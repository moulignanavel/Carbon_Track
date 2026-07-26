package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.ChatMessageRequest;
import com.carbontrack.backend.dto.ChatMessageResponse;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.service.ActivityLoggingService;
import com.carbontrack.backend.service.GeminiClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final GeminiClientService geminiClientService;
    private final ActivityLoggingService activityLoggingService;

    public AiAssistantController(GeminiClientService geminiClientService, ActivityLoggingService activityLoggingService) {
        this.geminiClientService = geminiClientService;
        this.activityLoggingService = activityLoggingService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatMessageResponse> chat(@RequestBody ChatMessageRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(new ChatMessageResponse("Please enter a question or message for CarbonBot!"));
        }

        String userContextSummary = buildUserContextSummary();
        String reply = geminiClientService.generateChatResponse(request.getMessage(), request.getHistory(), userContextSummary);

        List<String> followUpSuggestions = List.of(
            "How can I cut my transport footprint by 20%?",
            "What diet changes save the most CO₂?",
            "How many trees do I need to plant to offset my CO₂?"
        );

        return ResponseEntity.ok(new ChatMessageResponse(reply, followUpSuggestions));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions() {
        return ResponseEntity.ok(List.of(
            "I travelled 30 km by car today. How can I reduce emissions?",
            "What is my total carbon emission footprint so far?",
            "Give me 3 easy ways to lower my home electricity bill.",
            "How many trees do I need to plant to offset 50 kg of CO₂?"
        ));
    }

    private String buildUserContextSummary() {
        try {
            List<ActivityLog> logs = activityLoggingService.getLogsForCurrentUser();
            if (logs == null || logs.isEmpty()) {
                return "User has newly joined CarbonTrack and has 0 logged activities so far.";
            }

            double totalEmissions = logs.stream().mapToDouble(l -> l.getCalculatedEmissions() != null ? l.getCalculatedEmissions() : 0.0).sum();
            int totalActivities = logs.size();

            return String.format("User has logged %d total activities on CarbonTrack. Total Lifetime Carbon Footprint: %.2f kg CO2e.",
                    totalActivities, totalEmissions);
        } catch (Exception e) {
            return "User is an active member on CarbonTrack.";
        }
    }
}
