package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.RegisterRequest;
import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.repository.PasswordResetTokenRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.security.JwtUtil;
import com.carbontrack.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthRegistrationRoleTest {
    @Test
    void registrationAlwaysPersistsUserRoleAndSelectedOrganisation() {
        UserRepository users = mock(UserRepository.class);
        OrganisationRepository organisations = mock(OrganisationRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        JwtUtil jwt = mock(JwtUtil.class);
        Organisation organisation = new Organisation();
        organisation.setId(9L);
        organisation.setName("Acme");
        organisation.setActive(true);
        when(users.findByEmail(any())).thenReturn(Optional.empty());
        when(users.findByUsername(any())).thenReturn(Optional.empty());
        when(organisations.findById(9L)).thenReturn(Optional.of(organisation));
        when(encoder.encode(any())).thenReturn("hash");
        when(users.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });
        when(jwt.generateToken(any(User.class))).thenReturn("token");

        AuthServiceImpl service = new AuthServiceImpl(
                users, organisations, encoder, jwt, mock(AuthenticationManager.class),
                mock(PasswordResetTokenRepository.class), mock(EmailService.class));
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Employee One");
        request.setUsername("employee");
        request.setEmail("employee@example.test");
        request.setPassword("Strong!123");

        var response = service.register(request);
        assertEquals("USER", response.getRole());
        assertNull(response.getOrganisationId());
        verify(users).save(argThat(user -> "USER".equals(user.getRole())
                && user.getOrganisation() == null));
    }
}
