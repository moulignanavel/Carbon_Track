package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    private String category; // all, transport, electricity, food, shopping, energy

    @Column(nullable = false, length = 20)
    private String period; // daily, weekly, monthly, quarterly, annual

    @Column(name = "target_kg", nullable = false)
    private Double targetKg;

    @Column(name = "current_kg", nullable = false)
    private Double currentKg;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 20)
    private String status; // ACTIVE, ACHIEVED, MISSED

    // Legacy columns — kept nullable for backward compatibility
    @Column(name = "target_reduction_pct")
    private Double targetReductionPct;

    @Column(name = "period_days")
    private Integer periodDays;
}
