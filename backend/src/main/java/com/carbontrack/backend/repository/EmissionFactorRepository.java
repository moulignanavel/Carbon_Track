package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc(String activityType, String unit);
}
