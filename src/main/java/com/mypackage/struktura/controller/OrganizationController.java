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
    // Endpoint:
    // /api/organizations/{orgId}/assign-pimpinan/{userId}?adminId={adminId}
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
    // ================= GET ALL ORGANIZATIONS (PUBLIC) =================
    @GetMapping // Rute: /api/organizations
    public ResponseEntity<?> getAllOrganizations() {
        // 🛑 PERBAIKAN: Fungsi ini hanya dipanggil jika frontend TIDAK menggunakan
        // search/sort.
        // Saat ini, frontend menggunakan search/sort. Kita akan gunakan endpoint search
        // sebagai default.
        List<Organization> organizations = organizationService.getAllOrganizations();
        return new ResponseEntity<>(organizations, HttpStatus.OK);
    }

    // ================= GET ORGANIZATION BY ID (PUBLIC) =================
    // ...

    // 🛑 PERBAIKAN UTAMA DI SINI (Rute dan Model Pengembalian)
    @GetMapping("/search") // Rute: /api/organizations/search
    public ResponseEntity<?> searchOrganizations(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "ASC") String sortDirection) {
        try {
            // Kita asumsikan organizationService.searchOrganizations mengembalikan
            // Page<Organization>
            // atau List<Organization> yang sudah diolah.
            // Jika Anda ingin pagination di frontend, Service harus mengembalikan
            // Page<Organization>.

            // Saat ini, kita asumsikan Service mengembalikan List.
            List<Organization> organizations = organizationService.searchOrganizations(
                    keyword, page, size, sortBy, sortDirection);

            // 🛑 WARNING: Jika service mengembalikan List, pagination di frontend tidak
            // akan bekerja
            // dengan benar karena frontend mengharapkan totalPages, totalElements, dll.
            // (objek Page<T>).

            // Untuk sementara, kita kirim List, dan fungsi frontend harus diubah untuk
            // menerima List.
            // ATAU

            // Jika service Anda mengembalikan Page<Organization>:
            // Page<Organization> organizationsPage =
            // organizationService.searchOrganizations(...);
            // return new ResponseEntity<>(organizationsPage, HttpStatus.OK);

            return new ResponseEntity<>(organizations, HttpStatus.OK);

        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
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