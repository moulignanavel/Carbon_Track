package com.carbontrack.backend.config;

import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
public class DevelopmentAdminInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${carbontrack.bootstrap.admin-email:admin@demo.carbontrack.local}")
    private String adminEmail;

    @Value("${carbontrack.bootstrap.admin-password:AdminPassword123!}")
    private String adminPassword;

    public DevelopmentAdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }
        if (adminPassword.length() < 12) {
            throw new IllegalStateException("CARBONTRACK_ADMIN_PASSWORD must contain at least 12 characters");
        }
        User admin = userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(adminEmail.trim(), adminEmail.trim()).orElseGet(User::new);
        if (admin.getId() == null) {
            admin.setEmail(adminEmail.trim().toLowerCase());
            admin.setUsername(uniqueUsername("system_admin"));
        }
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        admin.setStatus("ACTIVE");
        userRepository.save(admin);
    }

    private String uniqueUsername(String base) {
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }
}
