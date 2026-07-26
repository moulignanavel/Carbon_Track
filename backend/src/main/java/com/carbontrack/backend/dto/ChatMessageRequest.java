package com.carbontrack.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatMessageRequest {

    private String message;
    private List<ChatTurn> history = new ArrayList<>();

    public static class ChatTurn {
        private String role; // "user" or "model"
        private String text;

        public ChatTurn() {}

        public ChatTurn(String role, String text) {
            this.role = role;
            this.text = text;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public ChatMessageRequest() {}

    public ChatMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ChatTurn> getHistory() {
        return history;
    }

    public void setHistory(List<ChatTurn> history) {
        this.history = history;
    }
}
