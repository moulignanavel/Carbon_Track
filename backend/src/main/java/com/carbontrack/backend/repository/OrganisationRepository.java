package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.Organisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface OrganisationRepository extends JpaRepository<Organisation, Long> {
    Optional<Organisation> findByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByOfficialEmailIgnoreCase(String email);
    List<Organisation> findByActiveTrueOrderByNameAsc();
}
