package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only emission-factor catalog for authenticated application users.
 *
 * The admin controller remains responsible for factor updates. This endpoint
 * lets activity forms use the same type/unit factors as authoritative backend
 * calculations without exposing admin operations.
 */
@RestController
@RequestMapping("/api/emission-factors")
public class EmissionFactorController {

    private final EmissionFactorRepository emissionFactorRepository;

    public EmissionFactorController(EmissionFactorRepository emissionFactorRepository) {
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @GetMapping
    public ResponseEntity<List<EmissionFactor>> getEmissionFactors() {
        return ResponseEntity.ok(emissionFactorRepository.findAll());
    }
}
