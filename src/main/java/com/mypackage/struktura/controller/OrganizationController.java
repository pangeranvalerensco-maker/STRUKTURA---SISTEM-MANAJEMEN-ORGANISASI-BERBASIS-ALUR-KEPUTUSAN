package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.service.OrganizationService;
import com.mypackage.struktura.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserService userService;

    public OrganizationController(OrganizationService organizationService, UserService userService) {
        this.organizationService = organizationService;
        this.userService = userService;
    }

    // ================= CREATE ORGANIZATION (ADMIN ONLY) =================
    @PostMapping
    public ResponseEntity<?> createOrganization(@RequestBody Organization organization) {
        try {
            Organization createdOrg = organizationService.createOrganization(organization);
            return new ResponseEntity<>(createdOrg, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Error validasi atau duplikasi nama
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= ASSIGN PIMPINAN (ADMIN ONLY) =================
    // Endpoint: /api/organizations/{orgId}/assign-pimpinan/{userId}?adminId={adminId}
    @PutMapping("/{organizationId}/assign-pimpinan/{targetUserId}")
    public ResponseEntity<?> assignPimpinan(@PathVariable Long organizationId, 
                                            @PathVariable Long targetUserId,
                                            @RequestParam Long adminId) {
        try {
            User pimpinan = userService.assignPimpinan(adminId, targetUserId, organizationId);
            return new ResponseEntity<>(pimpinan, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Error logic (bukan Admin, user/org tidak ditemukan, user sudah pimpinan)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); 
        }
    }

    // ================= GET ALL ORGANIZATIONS (PUBLIC) =================
    @GetMapping
    public ResponseEntity<?> getAllOrganizations() {
        List<Organization> organizations = organizationService.getAllOrganizations();
        return new ResponseEntity<>(organizations, HttpStatus.OK);
    }

    // ================= GET ORGANIZATION BY ID (PUBLIC) =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganizationById(@PathVariable Long id) {
        try {
            Organization organization = organizationService.getOrganizationById(id);
            return new ResponseEntity<>(organization, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Error 404 jika Organisasi tidak ditemukan
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}