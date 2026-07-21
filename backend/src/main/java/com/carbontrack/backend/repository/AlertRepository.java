package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserId(Long userId);
    List<Alert> findByUserIdOrderByIdDesc(Long userId);
    List<Alert> findByUserIdAndAlertTypeAndCreatedAtAfter(Long userId, String alertType, java.time.LocalDateTime since);
}
