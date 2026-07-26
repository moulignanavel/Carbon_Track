package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {

    List<UserChallenge> findByUserId(Long userId);

    List<UserChallenge> findByUserIdAndStatus(Long userId, String status);

    Optional<UserChallenge> findByUserIdAndChallenge_Id(Long userId, Long challengeId);

    boolean existsByUserIdAndChallenge_Id(Long userId, Long challengeId);
}
