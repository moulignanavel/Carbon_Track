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

    @Column(name = "target_reduction_pct", nullable = false)
    private Double targetReductionPct;

    @Column(name = "period_days", nullable = false)
    private Integer periodDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(nullable = false, length = 20)
    private String status; // ACTIVE, ACHIEVED, MISSED
}
