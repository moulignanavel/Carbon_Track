package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.OrganisationAdminResponse;
import com.carbontrack.backend.dto.OrganisationMemberResponse;
import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.OrganisationAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class OrganisationAdminServiceImpl implements OrganisationAdminService {
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;

    public OrganisationAdminServiceImpl(OrganisationRepository organisationRepository, UserRepository userRepository) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganisationAdminResponse> list(String search) {
        String query = search == null ? "" : search.trim().toLowerCase();
        return organisationRepository.findAll().stream()
                .filter(org -> query.isBlank() || org.getName().toLowerCase().contains(query))
                .sorted(java.util.Comparator.comparing(Organisation::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::response)
                .toList();
    }

    @Override
    public OrganisationAdminResponse create(String name) {
        String normalized = normalize(name);
        rejectDuplicate(normalized, null);
        Organisation organisation = new Organisation();
        organisation.setName(normalized);
        organisation.setActive(true);
        return response(organisationRepository.save(organisation));
    }

    @Override
    public OrganisationAdminResponse update(Long id, String name) {
        Organisation organisation = require(id);
        String normalized = normalize(name);
        rejectDuplicate(normalized, id);
        organisation.setName(normalized);
        return response(organisationRepository.save(organisation));
    }

    @Override
    public OrganisationAdminResponse setActive(Long id, boolean active) {
        Organisation organisation = require(id);
        organisation.setActive(active);
        return response(organisationRepository.save(organisation));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganisationMemberResponse> members(Long id) {
        require(id);
        return userRepository.findByOrganisation_Id(id).stream()
                .map(user -> new OrganisationMemberResponse(
                        user.getId(), user.getUsername(), user.getEmail(), user.getRole()))
                .toList();
    }

    private Organisation require(Long id) {
        return organisationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"));
    }

    private void rejectDuplicate(String name, Long currentId) {
        organisationRepository.findByNameIgnoreCase(name)
                .filter(org -> currentId == null || !org.getId().equals(currentId))
                .ifPresent(org -> { throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Organisation name already exists"); });
    }

    private String normalize(String name) {
        return name == null ? "" : name.trim().replaceAll("\\s+", " ");
    }

    private OrganisationAdminResponse response(Organisation organisation) {
        List<User> members = userRepository.findByOrganisation_Id(organisation.getId());
        long admins = members.stream().filter(user -> "ORG_ADMIN".equalsIgnoreCase(user.getRole())).count();
        return new OrganisationAdminResponse(
                organisation.getId(), organisation.getName(), organisation.isActive(), members.size(), admins);
    }
}
