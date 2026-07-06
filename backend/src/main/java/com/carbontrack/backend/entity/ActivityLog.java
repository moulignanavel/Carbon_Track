package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "activity_logs")
@Data
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(name = "quantity", nullable = false) 
    private Double amount;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "co2e_kg", nullable = false)
    private Double calculatedEmissions;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "notes")
    private String notes;
}