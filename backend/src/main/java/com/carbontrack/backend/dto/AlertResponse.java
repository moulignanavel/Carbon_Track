package com.carbontrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private Long userId;
    private String alertType;
    private String message;
    private Double triggerValue;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
