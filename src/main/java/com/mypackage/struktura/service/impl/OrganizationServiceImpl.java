package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.service.OrganizationService;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

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

    @Override
    public List<Organization> searchOrganizations(String keyword, int page, int size, String sortBy,
            String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);

        // Status wajib aktif
        String activeStatus = "ACTIVE";

        if (keyword == null || keyword.isEmpty()) {
            // Case 1: Keyword KOSONG
            return organizationRepository.findByStatusIgnoreCase(activeStatus, sort);
        }

        // Case 2: Keyword ADA (Gunakan @Query yang baru)
        String searchPattern = "%" + keyword.toLowerCase() + "%";

        // Panggil method @Query yang mencari Name/Desc DAN Status "ACTIVE"
        return organizationRepository.searchActiveByNameOrDescription(
                searchPattern, // Keyword (Mencari di Name/Desc)
                activeStatus, // Status wajib "ACTIVE"
                sort);
    }
}
