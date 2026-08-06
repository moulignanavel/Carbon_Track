package com.carbontrack.backend.config;

import com.carbontrack.backend.repository.EmissionFactorRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Loads the existing backend factor seed scripts for the local H2 profile.
 *
 * Full Flyway migration is disabled for H2 because later migrations contain
 * MySQL-specific DDL. Reusing V4/V5 here keeps local previews and authoritative
 * calculations aligned with the normal MySQL factor catalog.
 */
@Component
@Profile("dev")
public class DevelopmentEmissionFactorInitializer implements ApplicationRunner {

    private final DataSource dataSource;
    private final EmissionFactorRepository emissionFactorRepository;

    public DevelopmentEmissionFactorInitializer(
            DataSource dataSource,
            EmissionFactorRepository emissionFactorRepository) {
        this.dataSource = dataSource;
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (emissionFactorRepository.count() > 0) {
            return;
        }

        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                new ClassPathResource("db/migration/V4__seed_emission_factors.sql"),
                new ClassPathResource("db/migration/V5__seed_all_frontend_emission_factors.sql")
        );
        populator.execute(dataSource);
    }
}
