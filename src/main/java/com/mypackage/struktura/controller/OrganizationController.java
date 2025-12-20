package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.service.OrganizationService;
import com.mypackage.struktura.service.UserService;

import jakarta.validation.Valid;

import com.mypackage.struktura.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserService userService;
    private final NotificationService notificationService;

    public OrganizationController(OrganizationService organizationService, UserService userService,
            NotificationService notificationService) {
        this.organizationService = organizationService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    // ================= CREATE ORGANIZATION (ADMIN ONLY) =================
    // @PostMapping
    // public ResponseEntity<?> createOrganization(@Valid @RequestBody Organization
    // org, @RequestParam Long creatorId) {
    // // 1. Simpan Organisasi Baru
    // Organization savedOrg = organizationService.createOrganization(org);
    // User creator = userService.getUserById(creatorId);

    // if (creator == null) {
    // return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message",
    // "User tidak ditemukan"));
    // }

    // // 🛑 LOGIKA PROTEKSI: Jika user sudah punya organisasi, cegah pembuatan baru
    // if (creator.getOrganization() != null) {
    // return ResponseEntity.badRequest().body(Map.of("message", "Anda sudah
    // terdaftar di organisasi lain."));
    // }

    // if (!creator.getRole().name().equals("ADMIN")) {
    // creator.setOrganization(savedOrg);
    // creator.setRole(com.mypackage.struktura.model.entity.Role.PIMPINAN);
    // creator.setMemberStatus(MemberStatus.ACTIVE);
    // creator.setPosition("Ketua Umum / Founder");
    // userService.updateUser(creator.getId(), creator);
    // notificationService.sendNotificationToAllAdmins("ORGANISASI_BARU: " +
    // creator.getName()
    // + " telah mendaftarkan organisasi baru: " + savedOrg.getName());

    // // 🛑 KEMBALIKAN OBJEK AGAR TIDAK ERROR JSON
    // return ResponseEntity.ok(savedOrg);
    // }

    // notificationService
    // .sendNotificationToAllAdmins("NEW_ORG_REQUEST:" + savedOrg.getId() + ":" +
    // savedOrg.getName());

    // Map<String, String> response = new HashMap<>();
    // response.put("message", "Organisasi berhasil didaftarkan. Anda sekarang
    // Pimpinan.");
    // return ResponseEntity.ok(response);
    // }

    @PostMapping
    public ResponseEntity<?> createOrganization(@Valid @RequestBody Organization org, @RequestParam Long creatorId) {
        try {
            // Semua pengecekan terjadi di dalam service ini
            Organization savedOrg = organizationService.createOrganization(org, creatorId);
            return ResponseEntity.ok(savedOrg);
        } catch (RuntimeException e) {
            // Menangkap error "Anda sudah terdaftar..." atau "User tidak ditemukan" dari
            // Service
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getOrgDetails(@PathVariable Long id) {
        try {
            Organization org = organizationService.getOrganizationById(id);
            // Mengambil daftar anggota aktif untuk ditampilkan di profil organisasi
            List<User> members = userService.getActiveMembers(id);

            Map<String, Object> response = new HashMap<>();
            response.put("organization", org);
            response.put("members", members);
            response.put("memberCount", members.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal mengambil detail organisasi: " + e.getMessage());
        }
    }

    // Tambahkan di dalam OrganizationController.java

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(
            @PathVariable Long id,
            @RequestParam Long pimpinanId,
            @Valid @RequestBody Organization updatedData) {
        try {
            // Memanggil method update yang sudah ada di service Anda
            Organization org = organizationService.updateOrganization(id, updatedData, pimpinanId);
            return new ResponseEntity<>(org, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/request-delete")
    public ResponseEntity<?> requestDelete(@PathVariable Long id, @RequestParam Long pimpinanId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        Organization org = organizationService.getOrganizationById(id);
        User pimpinan = userService.getUserById(pimpinanId);

        // Kirim notifikasi ke Admin
        notificationService.sendNotificationToAllAdmins("REQUEST_HAPUS: Pimpinan " + pimpinan.getName() +
                " meminta penghapusan organisasi " + org.getName() + ". Alasan: " + reason);

        return ResponseEntity.ok(Map.of("message", "Permintaan hapus telah dikirim ke Admin."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable Long id, @RequestParam Long adminId) {
        organizationService.deleteOrganization(id, adminId);
        return ResponseEntity.ok(Map.of("message", "Organisasi berhasil dihapus"));
    }
}