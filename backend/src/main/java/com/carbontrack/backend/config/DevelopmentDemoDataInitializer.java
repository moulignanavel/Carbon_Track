package com.carbontrack.backend.config;

import com.carbontrack.backend.entity.*;
import com.carbontrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@Profile("dev")
@Order(20)
public class DevelopmentDemoDataInitializer implements ApplicationRunner {
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${carbontrack.demo.enabled:false}")
    private boolean enabled;
    @Value("${carbontrack.demo.password:}")
    private String configuredPassword;

    public DevelopmentDemoDataInitializer(
            OrganisationRepository organisationRepository, UserRepository userRepository,
            ActivityLogRepository activityLogRepository, GoalRepository goalRepository,
            BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository,
            ChallengeRepository challengeRepository, UserChallengeRepository userChallengeRepository,
            PasswordEncoder passwordEncoder) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.goalRepository = goalRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.challengeRepository = challengeRepository;
        this.userChallengeRepository = userChallengeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled || organisationRepository.count() > 0
                || userRepository.findAll().stream().anyMatch(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))) {
            return;
        }

        String rawPassword = configuredPassword.isBlank() ? UUID.randomUUID().toString() : configuredPassword;
        String passwordHash = passwordEncoder.encode(rawPassword);
        Badge badge = badgeRepository.save(new Badge(null, "Carbon Starter",
                "Logged initial sustainability activities", "STREAK", 3.0));
        Challenge challenge = challengeRepository.save(new Challenge(null, "Low Carbon Week",
                "Log sustainable choices throughout the week", "all", "LOG_ENTRIES",
                4.0, 250, "leaf", "weekly"));

        seedOrganisation("Greenfield Technologies", "greenfield", passwordHash, badge, challenge, 0);
        seedOrganisation("BlueRiver Industries", "blueriver", passwordHash, badge, challenge, 1);
    }

    private void seedOrganisation(String name, String slug, String passwordHash,
                                  Badge badge, Challenge challenge, int organisationIndex) {
        Organisation organisation = new Organisation();
        organisation.setName(name);
        organisation.setActive(true);
        organisation = organisationRepository.save(organisation);

        List<User> users = new ArrayList<>();
        for (int index = 1; index <= 6; index++) {
            User user = new User();
            user.setUsername(slug + "_user_" + index);
            user.setEmail(slug + index + "@demo.carbontrack.local");
            user.setPasswordHash(passwordHash);
            user.setRole(index == 1 ? "ORG_ADMIN" : "USER");
            user.setOrganisation(organisation);
            users.add(userRepository.save(user));
        }
        organisation.setAdminUserId(users.get(0).getId());
        organisationRepository.save(organisation);

        for (int userIndex = 0; userIndex < users.size(); userIndex++) {
            User user = users.get(userIndex);
            for (int monthOffset = 0; monthOffset < 4; monthOffset++) {
                ActivityLog log = new ActivityLog();
                log.setUserId(user.getId());
                log.setCategory(monthOffset % 2 == 0 ? "transport" : "energy");
                log.setActivityType(monthOffset % 2 == 0 ? "public_transport" : "electricity");
                log.setAmount(12.0 + userIndex + monthOffset);
                log.setUnit(monthOffset % 2 == 0 ? "km" : "kWh");
                log.setCalculatedEmissions(3.5 + organisationIndex + userIndex * 0.7 + monthOffset);
                log.setLogDate(LocalDate.now().minusMonths(monthOffset).withDayOfMonth(Math.min(10 + userIndex, 25)));
                log.setNotes("Development demo activity");
                activityLogRepository.save(log);
            }

            Goal goal = new Goal();
            goal.setUserId(user.getId());
            goal.setTitle("Reduce monthly footprint");
            goal.setDescription("Development demo sustainability goal");
            goal.setCategory("all");
            goal.setPeriod("monthly");
            goal.setTargetKg(25.0);
            goal.setCurrentKg(10.0 + userIndex);
            goal.setStartDate(LocalDate.now().minusDays(15));
            goal.setEndDate(LocalDate.now().plusDays(15));
            goal.setStatus(userIndex % 2 == 0 ? "ACHIEVED" : "ACTIVE");
            goalRepository.save(goal);

            UserBadge userBadge = new UserBadge();
            userBadge.setUserId(user.getId());
            userBadge.setBadgeId(badge.getId());
            userBadgeRepository.save(userBadge);

            UserChallenge userChallenge = new UserChallenge();
            userChallenge.setUserId(user.getId());
            userChallenge.setChallenge(challenge);
            userChallenge.setStatus(userIndex % 2 == 0 ? "COMPLETED" : "IN_PROGRESS");
            userChallenge.setProgressValue(userIndex % 2 == 0 ? 4.0 : 2.0);
            userChallenge.setJoinedAt(LocalDate.now().minusDays(5));
            if ("COMPLETED".equals(userChallenge.getStatus())) {
                userChallenge.setCompletedAt(LocalDate.now().minusDays(1));
            }
            userChallengeRepository.save(userChallenge);
        }
    }
}
