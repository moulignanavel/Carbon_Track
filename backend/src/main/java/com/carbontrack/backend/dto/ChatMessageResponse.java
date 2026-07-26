package com.carbontrack.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatMessageResponse {

    private String reply;
    private String timestamp;
    private List<String> suggestions = new ArrayList<>();

    public ChatMessageResponse() {
        this.timestamp = LocalDateTime.now().toString();
    }

    public ChatMessageResponse(String reply) {
        this.reply = reply;
        this.timestamp = LocalDateTime.now().toString();
    }

    public ChatMessageResponse(String reply, List<String> suggestions) {
        this.reply = reply;
        this.suggestions = suggestions;
        this.timestamp = LocalDateTime.now().toString();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
