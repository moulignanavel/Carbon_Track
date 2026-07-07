package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserIdOrderByIdDesc(Long userId);

    /**
     * Sum emissions for a user within a date range across ALL categories.
     */
    @Query("SELECT COALESCE(SUM(a.calculatedEmissions), 0) FROM ActivityLog a " +
           "WHERE a.userId = :userId " +
           "AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumEmissionsByUserAndDateRange(
            @Param("userId")    Long      userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate);

    /**
     * Sum emissions for a user within a date range for a SPECIFIC category.
     */
    @Query("SELECT COALESCE(SUM(a.calculatedEmissions), 0) FROM ActivityLog a " +
           "WHERE a.userId = :userId " +
           "AND a.category = :category " +
           "AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumEmissionsByUserCategoryAndDateRange(
            @Param("userId")    Long      userId,
            @Param("category")  String    category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate);
}