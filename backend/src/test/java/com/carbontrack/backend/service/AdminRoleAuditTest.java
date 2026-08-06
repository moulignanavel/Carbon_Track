package com.carbontrack.backend.service;

import com.carbontrack.backend.entity.RoleAuditLog;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import com.carbontrack.backend.repository.RoleAuditLogRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminRoleAuditTest {
    @Test
    void promotionCreatesAuditRecord() {
        UserRepository users = mock(UserRepository.class);
        ActivityLogRepository logs = mock(ActivityLogRepository.class);
        RoleAuditLogRepository audits = mock(RoleAuditLogRepository.class);
        SecurityService security = mock(SecurityService.class);
        User changedBy = new User();
        changedBy.setId(1L);
        changedBy.setRole("ADMIN");
        User target = new User();
        target.setId(2L);
        target.setUsername("manager");
        target.setEmail("manager@example.test");
        target.setRole("USER");
        com.carbontrack.backend.entity.Organisation organisation = new com.carbontrack.backend.entity.Organisation();
        organisation.setId(10L);
        target.setOrganisation(organisation);
        when(users.findById(2L)).thenReturn(Optional.of(target));
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(logs.findByUserIdOrderByIdDesc(2L)).thenReturn(List.of());
        when(security.getCurrentUser()).thenReturn(changedBy);

        AdminServiceImpl service = new AdminServiceImpl(users, logs,
                mock(EmissionFactorRepository.class), audits, security);
        var result = service.updateUserRole(2L, "ORG_ADMIN");

        assertEquals("ORG_ADMIN", result.getRole());
        verify(audits).save(argThat((RoleAuditLog audit) ->
                "USER".equals(audit.getOldRole())
                        && "ORG_ADMIN".equals(audit.getNewRole())
                        && audit.getChangedByUserId().equals(1L)
                        && audit.getOrganisationId().equals(10L)));
    }
}
