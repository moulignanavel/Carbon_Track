package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.*;
import com.carbontrack.backend.repository.*;
import com.carbontrack.backend.service.SecurityService;
import com.carbontrack.backend.exception.DuplicateResourceException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/org-portal")
@PreAuthorize("hasRole('ORG_ADMIN')")
public class OrganisationPortalController {
    private final SecurityService security;
    private final UserRepository users;
    private final OrganisationRepository organisations;
    private final ActivityLogRepository activities;
    private final GoalRepository goals;
    private final ChallengeRepository challenges;
    private final PasswordEncoder passwordEncoder;

    public OrganisationPortalController(SecurityService security, UserRepository users,
            OrganisationRepository organisations, ActivityLogRepository activities,
            GoalRepository goals, ChallengeRepository challenges, PasswordEncoder passwordEncoder) {
        this.security = security; this.users = users; this.organisations = organisations;
        this.activities = activities; this.goals = goals; this.challenges = challenges; this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/overview")
    public Map<String,Object> overview() {
        User admin = currentAdmin();
        Organisation org = admin.getOrganisation();
        List<User> allOrgUsers = users.findByOrganisation_Id(org.getId());
        Map<Long,User> allUserById = allOrgUsers.stream().collect(Collectors.toMap(User::getId, value -> value));
        Set<Long> allUserIds = allUserById.keySet();

        // Filter ONLY non-admin employees for employee lists & top contributor rankings
        List<User> members = allOrgUsers.stream()
                .filter(member -> "USER".equalsIgnoreCase(member.getRole()) && !admin.getId().equals(member.getId()))
                .toList();
        Map<Long,User> memberById = members.stream().collect(Collectors.toMap(User::getId, value -> value));

        List<ActivityLog> logs = activities.findAll().stream()
                .filter(log -> allUserIds.contains(log.getUserId()))
                .sorted(Comparator.comparing(ActivityLog::getLogDate).reversed())
                .toList();
        List<Goal> organisationGoals = goals.findAll().stream()
                .filter(g -> admin.getId().equals(g.getUserId()) || (g.getOrganisationManaged() != null && g.getOrganisationManaged() && allUserIds.contains(g.getUserId())))
                .map(g -> {
                    double actualKg = logs.stream()
                            .filter(l -> matchesCategory(g.getCategory(), l.getCategory(), l.getActivityType()))
                            .mapToDouble(this::emission)
                            .sum();
                    g.setCurrentKg(round(actualKg));
                    double target = g.getTargetKg() == null ? 0 : g.getTargetKg();
                    if (target > 0 && actualKg >= target) {
                        g.setStatus("ACHIEVED");
                    } else {
                        g.setStatus("ACTIVE");
                    }
                    return g;
                }).toList();
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate previousStart = monthStart.minusMonths(1);
        double total = logs.stream().mapToDouble(this::emission).sum();
        double currentMonth = sum(logs, monthStart, today);
        double previousMonth = sum(logs, previousStart, monthStart.minusDays(1));
        double reduction = previousMonth == 0 ? 0 : ((previousMonth-currentMonth)/previousMonth)*100;
        long participants = members.stream().filter(member -> logs.stream().anyMatch(log -> member.getId().equals(log.getUserId())
                && !log.getLogDate().isBefore(monthStart))).count();
        double participation = members.isEmpty() ? 0 : participants*100.0/members.size();

        List<Map<String,Object>> employeeRows = members.stream().map(member -> employee(member, logs, organisationGoals))
                .sorted(Comparator.comparingDouble(row -> (Double)row.get("monthlyEmission"))).toList();
        List<Map<String,Object>> top = new ArrayList<>(employeeRows);
        Collections.reverse(top);

        Map<String,Object> result = new LinkedHashMap<>();
        result.put("organisation", organisation(org, members.size()));
        result.put("adminProfile", profile(admin));
        result.put("kpis", Map.of(
                "totalEmployees", members.size(), "totalEmission", round(total),
                "monthlyReduction", round(reduction), "participationRate", round(participation),
                "averageCarbonScore", round(members.isEmpty()?0:employeeRows.stream().mapToDouble(r -> (Double)r.get("carbonScore")).average().orElse(0)),
                "activeGoals", organisationGoals.stream().filter(g -> "ACTIVE".equalsIgnoreCase(g.getStatus())).count()));
        result.put("monthlyEmissions", monthly(logs));
        result.put("weeklyTrend", weekly(logs));
        result.put("categoryBreakdown", categories(logs));
        result.put("departmentComparison", departments(members, logs));
        result.put("employees", employeeRows);
        result.put("topContributors", top.stream().limit(10).toList());
        result.put("lowestFootprint", employeeRows.stream().limit(10).toList());
        result.put("activityLogs", logs.stream().limit(250).map(log -> activity(log, allUserById.get(log.getUserId()))).toList());
        result.put("recentActivities", logs.stream().limit(8).map(log -> activity(log, allUserById.get(log.getUserId()))).toList());
        result.put("goals", organisationGoals);
        result.put("lastUpdated", Instant.now().toString());
        return result;
    }

    @PutMapping("/organisation-profile")
    public Map<String,Object> updateOrganisation(@RequestBody Map<String,Object> body) {
        Organisation org = currentAdmin().getOrganisation();
        set(body,"name",org::setName); set(body,"code",org::setCode); set(body,"organisationType",org::setOrganisationType); set(body,"industry",org::setIndustry); set(body,"address",org::setAddress);
        set(body,"contactNumber",org::setContactNumber); set(body,"officialEmail",org::setOfficialEmail);
        set(body,"city",org::setCity); set(body,"state",org::setState); set(body,"country",org::setCountry); set(body,"postalCode",org::setPostalCode);
        set(body,"website",org::setWebsite); set(body,"logoUrl",org::setLogoUrl); set(body,"logoData",org::setLogoData);
        set(body,"preferredUnit",org::setPreferredUnit); set(body,"reportingFrequency",org::setReportingFrequency);
        if (body.get("carbonTarget") instanceof Number number) org.setCarbonTarget(number.doubleValue());
        if (body.get("reportingYear") instanceof Number number) org.setReportingYear(number.intValue());
        return organisation(organisations.save(org), users.findByOrganisation_Id(org.getId()).size());
    }

    @PutMapping("/my-profile")
    public Map<String,Object> updateProfile(@RequestBody Map<String,Object> body) {
        User user = currentAdmin();
        String fullName = required(body, "fullName");
        if (fullName.length() > 100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name must be 100 characters or fewer");
        String email = required(body, "email").toLowerCase(Locale.ROOT);
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid work email address");
        users.findByEmail(email).filter(existing -> !existing.getId().equals(user.getId())).ifPresent(existing -> {
            throw new DuplicateResourceException("Email already exists");
        });
        user.setFullName(fullName); user.setEmail(email);
        set(body,"phone",user::setPhone); set(body,"jobTitle",user::setJobTitle);
        set(body,"avatarUrl",user::setAvatarUrl);
        return profile(users.save(user));
    }

    @PostMapping("/change-password")
    public void changePassword(@RequestBody Map<String,String> body) {
        User user = currentAdmin();
        if (!passwordEncoder.matches(body.getOrDefault("currentPassword",""), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        String next = body.getOrDefault("newPassword","");
        if (next.length()<8 || !next.matches(".*[A-Z].*") || !next.matches(".*[a-z].*")
                || !next.matches(".*\\d.*") || !next.matches(".*[^A-Za-z0-9].*"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must meet all password rules");
        if (passwordEncoder.matches(next, user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from the current password");
        user.setPasswordHash(passwordEncoder.encode(next)); users.save(user);
    }

    @PostMapping("/employees")
    public Map<String,Object> createEmployee(@RequestBody Map<String,Object> body) {
        User admin=currentAdmin();
        String username=required(body,"username"), email=required(body,"email");
        if(users.findByUsername(username).isPresent())throw new DuplicateResourceException("Username already exists");
        if(users.findByEmail(email).isPresent())throw new DuplicateResourceException("Email already exists");
        String password=required(body,"password");
        if(password.length()<8)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Password must be at least 8 characters");
        User employee=new User();employee.setFullName(required(body,"fullName"));employee.setUsername(username);
        employee.setEmail(email);employee.setPasswordHash(passwordEncoder.encode(password));employee.setRole("USER");
        employee.setStatus("ACTIVE");employee.setOrganisation(admin.getOrganisation());
        employee.setDepartment(body.get("department")==null?"":body.get("department").toString().trim());
        employee.setPhone(body.get("phone")==null?"":body.get("phone").toString().trim());
        employee=users.save(employee);
        return employee(employee,List.of(),List.of());
    }

    @PutMapping("/employees/{id}")
    public Map<String,Object> updateEmployee(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        User admin = currentAdmin();
        User employee = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (employee.getOrganisation() == null
                || !admin.getOrganisation().getId().equals(employee.getOrganisation().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employee belongs to another organisation");
        }
        if ("ORG_ADMIN".equalsIgnoreCase(employee.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot edit Organisation Admin via employee list");
        }
        String email = body.get("email") != null ? body.get("email").toString().trim() : employee.getEmail();
        if (email != null && !email.isBlank()) {
            users.findByEmail(email).filter(existing -> !existing.getId().equals(employee.getId())).ifPresent(existing -> {
                throw new DuplicateResourceException("Email already exists");
            });
            employee.setEmail(email);
        }
        if (body.get("fullName") != null && !body.get("fullName").toString().isBlank()) {
            employee.setFullName(body.get("fullName").toString().trim());
        }
        if (body.get("department") != null) {
            employee.setDepartment(body.get("department").toString().trim());
        }
        if (body.get("phone") != null) {
            employee.setPhone(body.get("phone").toString().trim());
        }
        if (body.get("status") != null) {
            String status = body.get("status").toString().trim().toUpperCase(Locale.ROOT);
            if (Set.of("ACTIVE", "INACTIVE").contains(status)) {
                employee.setStatus(status);
            }
        }
        return employee(users.save(employee), List.of(), List.of());
    }

    @DeleteMapping("/employees/{id}")
    public Map<String, Object> removeEmployee(@PathVariable Long id) {
        User admin = currentAdmin();
        User employee = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (employee.getOrganisation() == null
                || !admin.getOrganisation().getId().equals(employee.getOrganisation().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employee belongs to another organisation");
        }
        if ("ORG_ADMIN".equalsIgnoreCase(employee.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete Organisation Admin account");
        }
        employee.setOrganisation(null);
        users.save(employee);
        return Map.of("success", true, "message", "Employee removed from organisation");
    }

    @PostMapping("/activities")
    public ActivityLog createActivity(@RequestBody Map<String,Object> body) {
        User admin=currentAdmin();
        Long employeeId=Long.valueOf(required(body,"employeeId"));
        User employee=users.findById(employeeId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Employee not found"));
        if(employee.getOrganisation()==null||!admin.getOrganisation().getId().equals(employee.getOrganisation().getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Employee belongs to another organisation");
        ActivityLog log=new ActivityLog();log.setUserId(employeeId);log.setCategory(required(body,"category"));
        log.setActivityType(required(body,"activityType"));log.setAmount(number(body,"amount"));
        log.setUnit(required(body,"unit"));log.setCalculatedEmissions(number(body,"emission"));
        log.setLogDate(body.get("date")==null?LocalDate.now():LocalDate.parse(body.get("date").toString()));
        log.setNotes(body.get("notes")==null?"":body.get("notes").toString());
        return activities.save(log);
    }

    @PatchMapping("/activities/{id}/verification")
    public Map<String,Object> updateActivityVerification(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        User admin = currentAdmin();
        ActivityLog log = activities.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
        User employee = users.findById(log.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (employee.getOrganisation() == null
                || !admin.getOrganisation().getId().equals(employee.getOrganisation().getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Activity belongs to another organisation");
        String status = required(body, "status").toUpperCase(Locale.ROOT);
        if (!Set.of("PENDING", "VERIFIED", "REJECTED").contains(status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification status must be PENDING, VERIFIED or REJECTED");
        log.setVerificationStatus(status);
        log.setVerifiedBy("PENDING".equals(status) ? null : admin.getId());
        log.setVerifiedAt("PENDING".equals(status) ? null : Instant.now());
        return activity(activities.save(log), employee);
    }

    @PostMapping("/goals")
    public Goal createGoal(@RequestBody Goal request) {
        User admin=currentAdmin(); request.setId(null); request.setUserId(admin.getId());
        request.setOrganisationManaged(true);
        if(request.getCurrentKg()==null)request.setCurrentKg(0d); if(request.getStatus()==null)request.setStatus("ACTIVE");
        if(request.getStartDate()==null)request.setStartDate(LocalDate.now()); return goals.save(request);
    }
    @PutMapping("/goals/{id}")
    public Goal updateGoal(@PathVariable Long id,@RequestBody Goal request) {
        Goal goal=requireGoal(id); request.setId(goal.getId()); request.setUserId(goal.getUserId()); request.setOrganisationManaged(true); return goals.save(request);
    }
    @DeleteMapping("/goals/{id}") public void deleteGoal(@PathVariable Long id){goals.delete(requireGoal(id));}

    @GetMapping("/challenges")
    public List<Challenge> getChallenges() {
        User admin = currentAdmin();
        Long orgId = admin.getOrganisation().getId();
        return challenges.findAll().stream()
                .filter(c -> c.getOrganisationId() == null || orgId.equals(c.getOrganisationId()))
                .toList();
    }

    @PostMapping("/challenges")
    public Challenge createChallenge(@RequestBody Challenge request) {
        User admin = currentAdmin();
        request.setId(null);
        request.setOrganisationId(admin.getOrganisation().getId());
        if (request.getMetricType() == null || request.getMetricType().isBlank()) request.setMetricType("LOG_ENTRIES");
        if (request.getCategory() == null || request.getCategory().isBlank()) request.setCategory("all");
        if (request.getPeriod() == null || request.getPeriod().isBlank()) request.setPeriod("weekly");
        if (request.getTargetValue() == null) request.setTargetValue(5.0);
        if (request.getXpReward() == null) request.setXpReward(200);
        if (request.getIconKey() == null || request.getIconKey().isBlank()) request.setIconKey("leaf");
        return challenges.save(request);
    }

    @DeleteMapping("/challenges/{id}")
    public void deleteChallenge(@PathVariable Long id) {
        User admin = currentAdmin();
        Challenge challenge = challenges.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));
        if (!admin.getOrganisation().getId().equals(challenge.getOrganisationId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete global or other organisation challenge");
        }
        challenges.delete(challenge);
    }

    private User currentAdmin() {
        User user=security.getCurrentUser();
        if(!"ORG_ADMIN".equals(user.getRole())||user.getOrganisation()==null)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Organisation administrator access required");
        return user;
    }
    private Goal requireGoal(Long id){User admin=currentAdmin(); Goal goal=goals.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(!admin.getId().equals(goal.getUserId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN);return goal;}
    private Map<String,Object> organisation(Organisation o,int count){Map<String,Object> m=new LinkedHashMap<>();
        m.put("id",o.getId());m.put("name",o.getName());m.put("code",value(o.getCode()));m.put("organisationType",value(o.getOrganisationType()));m.put("industry",value(o.getIndustry()));m.put("address",value(o.getAddress()));
        m.put("city",value(o.getCity()));m.put("state",value(o.getState()));m.put("country",value(o.getCountry()));m.put("postalCode",value(o.getPostalCode()));
        m.put("phone",value(o.getContactNumber()));m.put("email",value(o.getOfficialEmail()));m.put("website",value(o.getWebsite()));
        m.put("totalEmployees",count);m.put("carbonTarget",o.getCarbonTarget()==null?0:o.getCarbonTarget());m.put("logoUrl",value(o.getLogoData()).isBlank()?value(o.getLogoUrl()):o.getLogoData());
        m.put("logoData",value(o.getLogoData()));m.put("reportingYear",o.getReportingYear());m.put("preferredUnit",value(o.getPreferredUnit()));m.put("reportingFrequency",value(o.getReportingFrequency()));return m;}
    private Map<String,Object> profile(User u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.getId());m.put("name",value(u.getFullName()));
        m.put("email",u.getEmail());m.put("phone",value(u.getPhone()));m.put("jobTitle",value(u.getJobTitle()));m.put("role",u.getRole());m.put("department",value(u.getDepartment()));
        m.put("organisation",u.getOrganisation()==null?"":value(u.getOrganisation().getName()));m.put("photo",value(u.getAvatarUrl()));return m;}
    private boolean matchesCategory(String goalCat, String logCat, String logAct) {
        if (goalCat == null || goalCat.isBlank() || "all".equalsIgnoreCase(goalCat.trim())) {
            return true;
        }
        String gc = goalCat.toLowerCase().trim();
        String lc = (logCat == null ? "" : logCat).toLowerCase().trim();
        String la = (logAct == null ? "" : logAct).toLowerCase().trim();

        if (lc.contains(gc) || gc.contains(lc) || la.contains(gc)) {
            return true;
        }
        if ((gc.contains("electric") || gc.contains("energy")) && (lc.contains("electric") || lc.contains("energy"))) {
            return true;
        }
        if (gc.contains("transport") && (lc.contains("transport") || la.contains("car") || la.contains("bus") || la.contains("travel"))) {
            return true;
        }
        return false;
    }

    private Map<String,Object> employee(User u,List<ActivityLog> logs,List<Goal> allGoals){
        double monthly=logs.stream().filter(l->u.getId().equals(l.getUserId())&&
            !l.getLogDate().isBefore(LocalDate.now().withDayOfMonth(1))).mapToDouble(this::emission).sum();
        long count=logs.stream().filter(l->u.getId().equals(l.getUserId())).count();
        double score=Math.max(0,100-monthly);
        double progress = (allGoals == null || allGoals.isEmpty() || count == 0) ? 0.0 :
            allGoals.stream().mapToDouble(g -> {
                double userCategoryEmissions = logs.stream()
                    .filter(l -> u.getId().equals(l.getUserId()))
                    .filter(l -> matchesCategory(g.getCategory(), l.getCategory(), l.getActivityType()))
                    .mapToDouble(this::emission)
                    .sum();
                double target = g.getTargetKg() == null ? 0 : g.getTargetKg();
                return target <= 0 ? 0 : Math.min(100, (userCategoryEmissions * 100.0) / target);
            }).average().orElse(0.0);
        Map<String,Object> m=new LinkedHashMap<>();
        m.put("id",u.getId());m.put("name",value(u.getFullName()).isBlank()?u.getUsername():u.getFullName());m.put("email",u.getEmail());m.put("phone",value(u.getPhone()));
        m.put("department",value(u.getDepartment()).isBlank()?"Unassigned":u.getDepartment());m.put("carbonScore",round(score));m.put("monthlyEmission",round(monthly));
        m.put("activities",count);m.put("goalProgress",round(progress));m.put("status",value(u.getStatus()).isBlank()?"ACTIVE":u.getStatus());
        m.put("role",u.getRole());
        m.put("carbonSaved",round(Math.max(0,100-monthly)));m.put("badge",score>80?"Eco Champion":score>60?"Green Starter":"Participant");m.put("trend",monthly<50?"down":"up");return m;}
    private List<Map<String,Object>> monthly(List<ActivityLog> logs){List<Map<String,Object>> out=new ArrayList<>();for(int i=11;i>=0;i--){LocalDate d=LocalDate.now().minusMonths(i);
        double v=logs.stream().filter(l->l.getLogDate().getYear()==d.getYear()&&l.getLogDate().getMonth()==d.getMonth()).mapToDouble(this::emission).sum();
        out.add(Map.of("month",d.getMonth().getDisplayName(TextStyle.SHORT,Locale.ENGLISH),"emissions",round(v)));}return out;}
    private List<Map<String,Object>> weekly(List<ActivityLog> logs){List<Map<String,Object>> out=new ArrayList<>();for(int i=6;i>=0;i--){LocalDate d=LocalDate.now().minusDays(i);
        double v=logs.stream().filter(l->d.equals(l.getLogDate())).mapToDouble(this::emission).sum();out.add(Map.of("day",d.getDayOfWeek().getDisplayName(TextStyle.SHORT,Locale.ENGLISH),"emissions",round(v)));}return out;}
    private List<Map<String,Object>> categories(List<ActivityLog> logs){return logs.stream().collect(Collectors.groupingBy(l->value(l.getCategory()),Collectors.summingDouble(this::emission)))
        .entrySet().stream().map(e->Map.<String,Object>of("category",e.getKey(),"emissions",round(e.getValue()))).toList();}
    private List<Map<String,Object>> departments(List<User> members,List<ActivityLog> logs){return members.stream().collect(Collectors.groupingBy(u->value(u.getDepartment()).isBlank()?"Unassigned":u.getDepartment()))
        .entrySet().stream().map(e->{Set<Long> ids=e.getValue().stream().map(User::getId).collect(Collectors.toSet());double total=logs.stream().filter(l->ids.contains(l.getUserId())).mapToDouble(this::emission).sum();
        return Map.<String,Object>of("department",e.getKey(),"emissions",round(total),"employees",e.getValue().size());}).toList();}
    private Map<String,Object> activity(ActivityLog l,User u){Map<String,Object> row=new LinkedHashMap<>();row.put("id",l.getId());row.put("date",l.getLogDate().toString());
        row.put("employee",u==null?"Unknown":value(u.getFullName()));row.put("category",value(l.getCategory()));row.put("activity",value(l.getActivityType()));
        row.put("quantity",l.getAmount());row.put("unit",value(l.getUnit()));row.put("emission",round(emission(l)));row.put("notes",value(l.getNotes()));
        row.put("verificationStatus",value(l.getVerificationStatus()).isBlank()?"PENDING":l.getVerificationStatus());row.put("verifiedAt",l.getVerifiedAt());return row;}
    private double sum(List<ActivityLog> logs,LocalDate from,LocalDate to){return logs.stream().filter(l->!l.getLogDate().isBefore(from)&&!l.getLogDate().isAfter(to)).mapToDouble(this::emission).sum();}
    private double emission(ActivityLog l){return l.getCalculatedEmissions()==null?0:l.getCalculatedEmissions();}
    private double round(double v){return Math.round(v*100.0)/100.0;} private String value(String v){return v==null?"":v;}
    private void set(Map<String,Object>b,String k,java.util.function.Consumer<String>s){if(b.get(k)!=null)s.accept(b.get(k).toString().trim());}
    private String required(Map<String,Object>b,String k){String value=b.get(k)==null?"":b.get(k).toString().trim();
        if(value.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,k+" is required");return value;}
    private double number(Map<String,Object>b,String k){try{return Double.parseDouble(required(b,k));}
        catch(NumberFormatException ex){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,k+" must be a number");}}
}
