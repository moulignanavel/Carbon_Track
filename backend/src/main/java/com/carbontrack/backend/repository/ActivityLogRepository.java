package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.carbontrack.backend.dto.CategoryAggregationDto;

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
                     @Param("userId") Long userId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * Sum emissions for a user within a date range for a SPECIFIC category.
        */
       @Query("SELECT COALESCE(SUM(a.calculatedEmissions), 0) FROM ActivityLog a " +
                     "WHERE a.userId = :userId " +
                     "AND a.category = :category " +
                     "AND a.logDate >= :startDate AND a.logDate <= :endDate")
       Double sumEmissionsByUserCategoryAndDateRange(
                     @Param("userId") Long userId,
                     @Param("category") String category,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * Get aggregated emissions grouped by category for a user within a date range.
        */
       @Query("SELECT new com.carbontrack.backend.dto.CategoryAggregationDto(a.category, COALESCE(SUM(a.calculatedEmissions), 0.0)) "
                     +
                     "FROM ActivityLog a " +
                     "WHERE a.userId = :userId " +
                     "AND a.logDate >= :startDate AND a.logDate <= :endDate " +
                     "GROUP BY a.category")
       List<CategoryAggregationDto> findAggregatedEmissionsByUserAndDateRange(
                     @Param("userId") Long userId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * Get aggregated emissions grouped by activityType for a user, ordered by
        * highest emissions.
        */
       @Query("SELECT new com.carbontrack.backend.dto.ActivityAggregationDto(a.activityType, COALESCE(SUM(a.calculatedEmissions), 0.0)) "
                     +
                     "FROM ActivityLog a " +
                     "WHERE a.userId = :userId AND a.logDate >= :startDate " +
                     "GROUP BY a.activityType " +
                     "ORDER BY SUM(a.calculatedEmissions) DESC")
       List<com.carbontrack.backend.dto.ActivityAggregationDto> findTopEmissionsByActivityType(
                     @Param("userId") Long userId,
                     @Param("startDate") LocalDate startDate,
                     org.springframework.data.domain.Pageable pageable);

       /**
        * Count distinct log dates for a user within a date range.
        */
       @Query("SELECT COUNT(DISTINCT a.logDate) FROM ActivityLog a " +
                     "WHERE a.userId = :userId " +
                     "AND a.logDate >= :startDate AND a.logDate <= :endDate")
       long countDistinctLogDatesByUserAndDateRange(
                     @Param("userId") Long userId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * Get platform-wide average emissions per category.
        */
       @Query("SELECT new com.carbontrack.backend.dto.CategoryAggregationDto(a.category, SUM(a.calculatedEmissions) / COUNT(DISTINCT a.userId)) "
                     +
                     "FROM ActivityLog a " +
                     "GROUP BY a.category")
       List<CategoryAggregationDto> findPlatformCategoryAverages();

       /**
        * Get total emissions for all users (used for percentile calculation).
        */
       @Query("SELECT SUM(a.calculatedEmissions) FROM ActivityLog a GROUP BY a.userId")
       List<Double> findAllUserTotalEmissions();

       /**
        * Sum ALL emissions for a specific user (no date filter).
        */
       @Query("SELECT COALESCE(SUM(a.calculatedEmissions), 0.0) FROM ActivityLog a WHERE a.userId = :userId")
       Double sumTotalEmissionsByUserId(@Param("userId") Long userId);
}
