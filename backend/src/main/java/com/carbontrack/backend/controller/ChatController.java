package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.service.GeminiClientService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ChatController
 * ─────────────────────────────────────────────────────────────
 * REST endpoint for interacting with the AI Chatbot (CarbonBot).
 * Endpoint: POST /api/chat
 * Secured by Spring Security (JWT authentication required).
 * Passes personalized user profile stats and logs context to Gemini.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiClientService geminiClientService;
    private final SecurityService securityService;
    private final ActivityLogRepository activityLogRepository;

    public ChatController(GeminiClientService geminiClientService,
                          SecurityService securityService,
                          ActivityLogRepository activityLogRepository) {
        this.geminiClientService = geminiClientService;
        this.securityService = securityService;
        this.activityLogRepository = activityLogRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Message cannot be empty.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Fetch current user and their emissions data for different time windows
        User currentUser = securityService.getCurrentUser();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        Double todayEmissions = activityLogRepository.sumEmissionsByUserAndDateRange(currentUser.getId(), today, today);
        if (todayEmissions == null) {
            todayEmissions = 0.0;
        }

        Double monthEmissions = activityLogRepository.sumEmissionsByUserAndDateRange(currentUser.getId(), startOfMonth, today);
        if (monthEmissions == null) {
            monthEmissions = 0.0;
        }

        Double totalEmissions = activityLogRepository.sumTotalEmissionsByUserId(currentUser.getId());
        if (totalEmissions == null) {
            totalEmissions = 0.0;
        }

        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByIdDesc(currentUser.getId());

        // Format today's activities specifically
        StringBuilder todayLogsSummary = new StringBuilder();
        int todayCount = 0;
        for (ActivityLog log : logs) {
            if (today.equals(log.getLogDate())) {
                todayCount++;
                todayLogsSummary.append(String.format("- Category: %s, Type: %s, Quantity: %.2f %s, Emissions: %.2f kg CO2e, Notes: %s\n",
                        log.getCategory(), log.getActivityType(),
                        log.getAmount(), log.getUnit(), log.getCalculatedEmissions(),
                        log.getNotes() != null ? log.getNotes() : "none"));
            }
        }
        if (todayCount == 0) {
            todayLogsSummary.append("No activities logged yet for today (").append(today).append(").\n");
        }

        // Format recent overall activities summary
        StringBuilder logsSummary = new StringBuilder();
        if (logs.isEmpty()) {
            logsSummary.append("The user has not logged any activities yet.\n");
        } else {
            logsSummary.append("The last ").append(Math.min(5, logs.size())).append(" activities logged by this user overall are:\n");
            for (int i = 0; i < Math.min(5, logs.size()); i++) {
                ActivityLog log = logs.get(i);
                logsSummary.append(String.format("- Date: %s, Category: %s, Type: %s, Quantity: %.2f %s, Emissions: %.2f kg CO2e, Notes: %s\n",
                        log.getLogDate(), log.getCategory(), log.getActivityType(),
                        log.getAmount(), log.getUnit(), log.getCalculatedEmissions(),
                        log.getNotes() != null ? log.getNotes() : "none"));
            }
        }

        // Construct context-enriched prompt to guide Gemini's behavior specific to the user
        String prompt = "You are CarbonBot, a friendly and knowledgeable AI assistant integrated into the CarbonTrack platform. "
                + "Answer the user's question about carbon emissions, green habits, environmental science, climate action, "
                + "and carbon footprint calculations. Be encouraging and helpful.\n\n"
                + "Here is the personalized profile and real-time logged data of the current authenticated user:\n"
                + "- Username: " + currentUser.getUsername() + "\n"
                + "- User Email: " + currentUser.getEmail() + "\n"
                + "- System Today's Date: " + today.toString() + "\n"
                + "- Today's Total Carbon Footprint Emissions: " + String.format("%.2f", todayEmissions) + " kg CO2e\n"
                + "- This Month's Total Carbon Footprint Emissions: " + String.format("%.2f", monthEmissions) + " kg CO2e\n"
                + "- Total Lifetime Carbon Footprint Emissions: " + String.format("%.2f", totalEmissions) + " kg CO2e\n\n"
                + "Activities logged TODAY (" + today.toString() + "):\n"
                + todayLogsSummary.toString() + "\n"
                + "Recent overall activities logged:\n"
                + logsSummary.toString() + "\n"
                + "Instructions for answering:\n"
                + "1. If the user asks about 'today', 'today's emissions', or 'what did I log today', report their Today's Total Emissions ("
                + String.format("%.2f", todayEmissions) + " kg CO2e) and list their today's logged activities.\n"
                + "2. If the user asks about 'total emissions', 'lifetime emissions', or overall footprint, report Total Lifetime Emissions ("
                + String.format("%.2f", totalEmissions) + " kg CO2e).\n"
                + "3. If the user asks 'What is my last activity?', report the top entry from the recent activities.\n"
                + "4. Always answer in a friendly, conversational tone and refer to the user by their username (" + currentUser.getUsername() + ").\n"
                + "5. If the question is completely unrelated to climate, environment, emissions, or CarbonTrack, politely redirect back to those topics.\n\n"
                + "User Question: " + userMessage;

        String botResponse = geminiClientService.generateRecommendation(
                prompt,
                userMessage,
                currentUser.getUsername(),
                currentUser.getEmail(),
                totalEmissions,
                todayEmissions,
                logs
        );

        Map<String, String> response = new HashMap<>();
        response.put("response", botResponse);
        return ResponseEntity.ok(response);
    }
}
