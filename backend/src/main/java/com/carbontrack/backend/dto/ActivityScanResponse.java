package com.carbontrack.backend.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ActivityScanResponse {

    private String category;
    private String activityType;
    private Double amount;
    private String unit;
    private LocalDate logDate;
    private String notes;
    private String rawSummary;
    private String merchant;
    private List<ScannedItem> items = new ArrayList<>();

    public static class ScannedItem {
        private String category;
        private String activityType;
        private Double amount;
        private String unit;
        private String notes;

        public ScannedItem() {}

        public ScannedItem(String category, String activityType, Double amount, String unit, String notes) {
            this.category = category;
            this.activityType = activityType;
            this.amount = amount;
            this.unit = unit;
            this.notes = notes;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public ActivityScanResponse() {}

    public ActivityScanResponse(String category, String activityType, Double amount, String unit, LocalDate logDate, String notes, String rawSummary) {
        this.category = category;
        this.activityType = activityType;
        this.amount = amount;
        this.unit = unit;
        this.logDate = logDate;
        this.notes = notes;
        this.rawSummary = rawSummary;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRawSummary() {
        return rawSummary;
    }

    public void setRawSummary(String rawSummary) {
        this.rawSummary = rawSummary;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public List<ScannedItem> getItems() {
        return items;
    }

    public void setItems(List<ScannedItem> items) {
        this.items = items;
    }
}
