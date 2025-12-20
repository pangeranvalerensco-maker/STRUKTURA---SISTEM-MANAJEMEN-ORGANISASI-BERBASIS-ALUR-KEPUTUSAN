package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.Organization;

import java.util.List;

public interface OrganizationService {

    Organization createOrganization(Organization organization, Long creatorId);

    List<Organization> getAllOrganizations();

    Organization getOrganizationById(Long id);

    List<Organization> searchOrganizations(
        String keyword, 
        int page, 
        int size, 
        String sortBy, 
        String sortDirection
    );

    Organization updateOrganization(Long orgId, Organization updatedData, Long pimpinanId);

    void deleteOrganization(Long orgId, Long adminId);
}
