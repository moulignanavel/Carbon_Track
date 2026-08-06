package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.OrganisationAdminResponse;
import com.carbontrack.backend.dto.OrganisationMemberResponse;
import java.util.List;

public interface OrganisationAdminService {
    List<OrganisationAdminResponse> list(String search);
    OrganisationAdminResponse create(String name);
    OrganisationAdminResponse update(Long id, String name);
    OrganisationAdminResponse setActive(Long id, boolean active);
    List<OrganisationMemberResponse> members(Long id);
}
