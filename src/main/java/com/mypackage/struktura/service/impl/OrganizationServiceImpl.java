package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.OrganizationService;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
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

        String activeStatus = "ACTIVE";

        if (keyword == null || keyword.isEmpty()) {
            return organizationRepository.findByStatusIgnoreCase(activeStatus, sort);
        }

        String searchPattern = "%" + keyword.toLowerCase() + "%";
        return organizationRepository.searchActiveByNameOrDescription(searchPattern, activeStatus, sort);
    }

    @Override
    public Organization updateOrganization(Long orgId, Organization updatedData, Long pimpinanId) {
        // 1. Validasi Pimpinan
        User pimpinan = userRepository.findById(pimpinanId)
                .orElseThrow(() -> new RuntimeException("Pimpinan tidak ditemukan"));

        // Cek apakah user adalah Pimpinan dan milik organisasi tersebut
        if (pimpinan.getRole() != Role.PIMPINAN || !pimpinan.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Hanya Pimpinan organisasi ini yang boleh mengedit profil.");
        }

        // 2. Ambil data lama
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        // 3. Update field
        org.setDescription(updatedData.getDescription());
        org.setEstablishedDate(updatedData.getEstablishedDate());
        org.setVisionMission(updatedData.getVisionMission());
        org.setScope(updatedData.getScope());
        org.setField(updatedData.getField());
        org.setAddress(updatedData.getAddress()); // Field baru
        org.setExternalLink(updatedData.getExternalLink()); // Field baru
        org.setMembershipRequirement(updatedData.getMembershipRequirement());

        return organizationRepository.save(org);
    }

}
