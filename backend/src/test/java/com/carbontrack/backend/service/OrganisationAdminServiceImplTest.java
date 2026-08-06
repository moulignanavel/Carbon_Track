package com.carbontrack.backend.service;

import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.impl.OrganisationAdminServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrganisationAdminServiceImplTest {
    private final OrganisationRepository organisations = mock(OrganisationRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final OrganisationAdminServiceImpl service = new OrganisationAdminServiceImpl(organisations, users);

    @Test
    void rejectsDuplicateOrganisationNameIgnoringCase() {
        Organisation existing = organisation(1L, "Acme");
        when(organisations.findByNameIgnoreCase("ACME")).thenReturn(Optional.of(existing));
        assertThrows(ResponseStatusException.class, () -> service.create("  ACME  "));
        verify(organisations, never()).save(any());
    }

    @Test
    void membersResponseNeverContainsPasswordHash() {
        Organisation organisation = organisation(1L, "Acme");
        User user = new User();
        user.setId(7L);
        user.setUsername("member");
        user.setEmail("member@example.test");
        user.setPasswordHash("secret-hash");
        user.setRole("USER");
        when(organisations.findById(1L)).thenReturn(Optional.of(organisation));
        when(users.findByOrganisation_Id(1L)).thenReturn(List.of(user));

        var member = service.members(1L).get(0);
        assertEquals("member@example.test", member.email());
        assertFalse(member.toString().contains("secret-hash"));
    }

    private Organisation organisation(Long id, String name) {
        Organisation organisation = new Organisation();
        organisation.setId(id);
        organisation.setName(name);
        organisation.setActive(true);
        return organisation;
    }
}
