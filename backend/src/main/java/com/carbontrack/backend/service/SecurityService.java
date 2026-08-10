package com.carbontrack.backend.service;

import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    private final UserRepository userRepository;

    public SecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UsernameNotFoundException("No authenticated user found");
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal != null ? principal.toString() : null;
        }

        if (email == null) {
            throw new UsernameNotFoundException("No authenticated user found");
        }

        return userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(email, email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + email));
    }
}
