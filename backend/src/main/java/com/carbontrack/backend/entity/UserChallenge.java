package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "user_challenges",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "challenge_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    /** NOT_STARTED | IN_PROGRESS | COMPLETED */
    @Column(nullable = false, length = 20)
    private String status = "IN_PROGRESS";

    /** Current measured value (kg CO2e emitted, or count of days/entries) */
    @Column(name = "progress_value", nullable = false)
    private Double progressValue = 0.0;

    @Column(name = "joined_at", nullable = false)
    private LocalDate joinedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;
}
