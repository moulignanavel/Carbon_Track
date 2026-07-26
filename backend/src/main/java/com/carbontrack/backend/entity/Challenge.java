package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    /** transport | electricity | food | shopping | energy | all */
    @Column(nullable = false, length = 50)
    private String category;

    /**
     * REDUCE_EMISSIONS / STAY_UNDER — total CO2e emitted <= targetValue
     * LOG_DAYS                       — distinct log dates >= targetValue
     * LOG_ENTRIES                    — count of log entries >= targetValue
     */
    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "target_value", nullable = false)
    private Double targetValue;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    /** Icon identifier used by the frontend (e.g. "car", "zap", "leaf") */
    @Column(name = "icon_key", length = 50)
    private String iconKey;

    /** weekly | one_time */
    @Column(nullable = false, length = 20)
    private String period;
}
