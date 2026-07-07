package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.LeaderboardResponse;
import com.carbontrack.backend.dto.LeaderboardUserResponse;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.Badge;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.entity.UserBadge;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.BadgeRepository;
import com.carbontrack.backend.repository.UserBadgeRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final SecurityService securityService;

    public LeaderboardController(UserRepository userRepository,
                                 ActivityLogRepository activityLogRepository,
                                 UserBadgeRepository userBadgeRepository,
                                 BadgeRepository badgeRepository,
                                 SecurityService securityService) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
        this.securityService = securityService;
    }

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard() {
        User currentUser = securityService.getCurrentUser();
        List<LeaderboardUserResponse> list = calculateLeaderboard(null);

        // top three
        List<LeaderboardUserResponse> topThree = list.stream()
                .limit(3)
                .collect(Collectors.toList());

        // all (up to 50)
        List<LeaderboardUserResponse> all = list.stream()
                .limit(50)
                .collect(Collectors.toList());

        // current user
        LeaderboardUserResponse curUserResp = list.stream()
                .filter(u -> u.getUserId().equals(currentUser.getId()))
                .findFirst()
                .orElse(null);

        return ResponseEntity.ok(new LeaderboardResponse(
                topThree,
                all,
                curUserResp,
                System.currentTimeMillis() / 1000L
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<LeaderboardResponse> searchLeaderboard(@RequestParam("q") String query,
                                                                 @RequestParam(value = "limit", defaultValue = "50") int limit) {
        User currentUser = securityService.getCurrentUser();
        List<LeaderboardUserResponse> list = calculateLeaderboard(query);

        // top three
        List<LeaderboardUserResponse> topThree = list.stream()
                .limit(3)
                .collect(Collectors.toList());

        // all (filtered and limited)
        List<LeaderboardUserResponse> all = list.stream()
                .limit(limit)
                .collect(Collectors.toList());

        // current user
        LeaderboardUserResponse curUserResp = list.stream()
                .filter(u -> u.getUserId().equals(currentUser.getId()))
                .findFirst()
                .orElse(null);

        return ResponseEntity.ok(new LeaderboardResponse(
                topThree,
                all,
                curUserResp,
                System.currentTimeMillis() / 1000L
        ));
    }

    private List<LeaderboardUserResponse> calculateLeaderboard(String searchQuery) {
        List<User> users = userRepository.findAll();
        List<ActivityLog> allLogs = activityLogRepository.findAll();
        List<UserBadge> allUserBadges = userBadgeRepository.findAll();
        List<Badge> allBadges = badgeRepository.findAll();

        Map<Long, List<ActivityLog>> logsByUser = allLogs.stream()
                .collect(Collectors.groupingBy(ActivityLog::getUserId));

        Map<Long, List<UserBadge>> userBadgesByUser = allUserBadges.stream()
                .collect(Collectors.groupingBy(UserBadge::getUserId));

        Map<Long, Badge> badgeMap = allBadges.stream()
                .collect(Collectors.toMap(Badge::getId, b -> b));

        List<LeaderboardUserResponse> responseList = new ArrayList<>();

        for (User user : users) {
            // Exclude test users (username or email containing "test" case-insensitive)
            String usernameLower = user.getUsername() != null ? user.getUsername().toLowerCase() : "";
            String emailLower = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
            if (usernameLower.contains("test") || emailLower.contains("test")) {
                continue;
            }

            // Apply search query filter if present (by username or email)
            if (searchQuery != null && !searchQuery.isEmpty()) {
                String q = searchQuery.toLowerCase();
                boolean matchesUsername = usernameLower.contains(q);
                boolean matchesEmail = emailLower.contains(q);
                if (!matchesUsername && !matchesEmail) {
                    continue;
                }
            }

            List<ActivityLog> userLogs = logsByUser.getOrDefault(user.getId(), Collections.emptyList());
            int activityCount = userLogs.size();
            double totalEmissions = userLogs.stream()
                    .mapToDouble(ActivityLog::getCalculatedEmissions)
                    .sum();

            // Total CO2 emitted: sum of actual logged emissions
            double totalCO2Emitted = totalEmissions;

            List<UserBadge> userBadges = userBadgesByUser.getOrDefault(user.getId(), Collections.emptyList());
            List<String> badges = userBadges.stream()
                    .map(ub -> badgeMap.get(ub.getBadgeId()))
                    .filter(Objects::nonNull)
                    .map(Badge::getName)
                    .collect(Collectors.toList());

            String badge = badges.isEmpty() ? null : badges.get(0);

            responseList.add(new LeaderboardUserResponse(
                    user.getId(),
                    user.getUsername(),
                    0, // rank will be computed after sorting
                    totalCO2Emitted,
                    totalCO2Emitted, // totalEmissionsSaved
                    activityCount,
                    badges,
                    badge
            ));
        }

        // Sort: active users (activityCount > 0) come first, sorted by emissions ascending (lowest emissions first).
        // Inactive users come last, sorted alphabetically by username.
        responseList.sort((a, b) -> {
            boolean aActive = a.getActivityCount() > 0;
            boolean bActive = b.getActivityCount() > 0;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            if (aActive && bActive) {
                int cmp = Double.compare(a.getTotalCO2Saved(), b.getTotalCO2Saved());
                if (cmp != 0) return cmp;
                return a.getUsername().compareToIgnoreCase(b.getUsername());
            }
            return a.getUsername().compareToIgnoreCase(b.getUsername());
        });

        // Assign ranks
        for (int i = 0; i < responseList.size(); i++) {
            responseList.get(i).setRank(i + 1);
        }

        return responseList;
    }
}
