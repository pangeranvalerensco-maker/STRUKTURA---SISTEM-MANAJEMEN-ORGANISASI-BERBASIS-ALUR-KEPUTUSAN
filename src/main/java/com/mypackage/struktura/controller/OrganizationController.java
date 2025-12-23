package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.service.OrganizationService;
import com.mypackage.struktura.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserService userService;

    public OrganizationController(OrganizationService organizationService, UserService userService) {
        this.organizationService = organizationService;
        this.userService = userService;
    }

    // ================= CREATE ORGANIZATION =================
    @PostMapping
    public ResponseEntity<?> createOrganization(@Valid @RequestBody Organization org, @RequestParam Long creatorId) {
        try {
            Organization savedOrg = organizationService.createOrganization(org, creatorId);
            return ResponseEntity.ok(savedOrg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ================= ASSIGN PIMPINAN (ADMIN ONLY) =================
    @PutMapping("/{organizationId}/assign-pimpinan/{targetUserId}")
    public ResponseEntity<?> assignPimpinan(@PathVariable Long organizationId,
            @PathVariable Long targetUserId,
            @RequestParam Long adminId) {
        try {
            User pimpinan = userService.assignPimpinan(adminId, targetUserId, organizationId);
            return new ResponseEntity<>(pimpinan, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= GET ALL ORGANIZATIONS =================
    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    // ================= SEARCH & SORT =================
    @GetMapping("/search")
    public ResponseEntity<?> searchOrganizations(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        try {
            List<Organization> organizations = organizationService.searchOrganizations(
                    keyword, page, size, sortBy, sortDirection);
            return ResponseEntity.ok(organizations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ================= GET BY ID & DETAILS =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganizationById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(organizationService.getOrganizationById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // ================= GET DETAIL ORGANISASI =================
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getOrgDetails(@PathVariable Long id) {
        try {
            Organization org = organizationService.getOrganizationById(id);
            List<User> members = userService.getActiveMembers(id);
            return ResponseEntity.ok(Map.of(
                    "organization", org,
                    "members", members,
                    "memberCount", members.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ================= UPDATE & DELETE =================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(
            @PathVariable Long id,
            @RequestParam Long pimpinanId,
            @RequestBody Organization updatedData) { 
        try {
            if (updatedData.getStatus() == null || updatedData.getStatus().isEmpty()) {
                updatedData.setStatus("ACTIVE");
            }

            Organization org = organizationService.fullUpdate(id, pimpinanId, updatedData);
            return ResponseEntity.ok(org);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", e.getMessage()));
        }
    }

    // ================= PERMINTAAN HAPUS ORGANISASI =================
    @PostMapping("/{id}/request-delete")
    public ResponseEntity<?> requestDelete(
            @PathVariable Long id,
            @RequestParam Long pimpinanId,
            @RequestBody Map<String, String> payload) { 

        String reason = payload.get("reason");
        try {
            organizationService.createDeleteRequest(id, pimpinanId, reason);
            return ResponseEntity.ok(Map.of("message", "Permintaan penghapusan berhasil dikirim ke Admin."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ================= HAPUS ORGANISASI =================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable Long id, @RequestParam Long adminId) {
        try {
            organizationService.deleteOrganization(id, adminId);
            return ResponseEntity.ok(Map.of("message", "Organisasi berhasil dihapus"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}