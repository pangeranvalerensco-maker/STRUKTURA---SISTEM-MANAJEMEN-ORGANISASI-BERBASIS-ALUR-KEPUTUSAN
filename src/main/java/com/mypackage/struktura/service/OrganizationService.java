package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.Organization;

import java.util.List;

public interface OrganizationService {

    Organization createOrganization(Organization organization);

    List<Organization> getAllOrganizations();

    Organization getOrganizationById(Long id);
}
