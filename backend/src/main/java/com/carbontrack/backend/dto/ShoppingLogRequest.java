package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class ShoppingLogRequest {

    @NotBlank(message = "Product category is required")
    private String productCategory;

    @NotNull(message = "Spend amount is required")
    @PositiveOrZero(message = "Spend amount must be non-negative")
    private Double spendAmount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public ShoppingLogRequest() {}

    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }

    public Double getSpendAmount() { return spendAmount; }
    public void setSpendAmount(Double spendAmount) { this.spendAmount = spendAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
