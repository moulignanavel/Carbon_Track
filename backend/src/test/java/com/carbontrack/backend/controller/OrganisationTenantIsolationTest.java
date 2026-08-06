package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.SecurityService;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrganisationTenantIsolationTest {
    @Test
    void orgAdminCannotRequestAnotherOrganisation() {
        Organisation own = new Organisation();
        own.setId(1L);
        own.setName("Organisation A");
        own.setActive(true);
        User current = new User();
        current.setRole("ORG_ADMIN");
        current.setOrganisation(own);

        OrganisationRepository organisations = mock(OrganisationRepository.class);
        UserRepository users = mock(UserRepository.class);
        ActivityLogRepository logs = mock(ActivityLogRepository.class);
        SecurityService security = mock(SecurityService.class);
        GoalRepository goals = mock(GoalRepository.class);
        when(security.getCurrentUser()).thenReturn(current);

        OrganisationController controller = new OrganisationController(
                organisations, users, logs, security, goals);
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> controller.getDashboard(2L));
        assertEquals(403, exception.getStatusCode().value());
        verify(organisations, never()).findById(2L);
    }
}
