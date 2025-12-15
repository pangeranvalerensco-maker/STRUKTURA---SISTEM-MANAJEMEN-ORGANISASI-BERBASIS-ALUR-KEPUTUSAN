package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.service.OrganizationService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public Organization createOrganization(Organization organization) {
        organization.setCreatedDate(LocalDate.now());
        organization.setStatus("ACTIVE"); // default saat dibuat
        return organizationRepository.save(organization);
    }

    @Override
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Override
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    
}
