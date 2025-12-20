package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.dto.JoinRequest;
import com.mypackage.struktura.model.dto.LoginRequest;
import com.mypackage.struktura.model.dto.PositionUpdate;
import com.mypackage.struktura.model.dto.MemberNumberUpdate;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ================= GET USER BY ID =================
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            // User tidak ditemukan
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            // Sukses: Beri status HTTP 201 Created
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Gagal (misalnya email sudah terdaftar/validasi)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= AJUKAN GABUNG =================
    @PostMapping("/{userId}/join/{organizationId}")
    public ResponseEntity<?> requestJoinOrganization(@PathVariable Long userId, @PathVariable Long organizationId,
            @RequestBody JoinRequest request) { // 🛑 TERIMA BODY
        try {
            User user = userService.requestJoinOrganization(userId, organizationId, request.getReason()); // 🛑 KIRIM
                                                                                                          // REASON
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= APPROVE =================
    @PutMapping("/{approverId}/approve/{targetUserId}")
    public ResponseEntity<?> approveUser(@PathVariable Long approverId, @PathVariable Long targetUserId) {
        try {
            User user = userService.approveUser(approverId, targetUserId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Logic error (misal: approver bukan Pimpinan, target bukan PENDING)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= REJECT MEMBER =================
    @PutMapping("/{approverId}/reject/{targetUserId}")
    public ResponseEntity<?> rejectUser(@PathVariable Long approverId,
            @PathVariable Long targetUserId) {
        try {
            User user = userService.rejectUser(approverId, targetUserId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Logic error (misal: approver bukan Pimpinan, target bukan PENDING)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= LIHAT ANGGOTA (General) =================
    // Endpoint ini jarang dipakai, lebih baik pakai endpoint spesifik
    // (pending/active)
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> members(@PathVariable Long organizationId) {
        try {
            List<User> users = userService.getUsersByOrganization(organizationId);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Logic error (misal: Organization ID tidak valid)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= LIHAT PENDING MEMBERS =================
    @GetMapping("/organization/{organizationId}/pending")
    public ResponseEntity<?> getPendingMembers(@PathVariable Long organizationId) {
        try {
            List<User> users = userService.getPendingMembers(organizationId);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Logic error (misal: Organization ID tidak valid)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= LIST ACTIVE MEMBERS =================
    @GetMapping("/organization/{organizationId}/active")
    public ResponseEntity<?> getActiveMembers(@PathVariable Long organizationId) {
        try {
            List<User> users = userService.getActiveMembers(organizationId);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Logic error (misal: Organization ID tidak valid)
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User loggedInUser = userService.login(request.getEmail(), request.getPassword());
            // Authentication Success
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Authentication Failure
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    // ================= FITUR WAJIB: SEARCH & SORT ACTIVE MEMBERS =================
    // Endpoint:
    // /api/users/organization/{orgId}/active/search?keyword=andi&page=0&size=10&sortBy=name&sortDirection=ASC
    @GetMapping("/organization/{organizationId}/active/search")
    public ResponseEntity<?> searchActiveMembers(
            @PathVariable Long organizationId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        try {
            Page<User> userPage = userService.searchAndSortActiveMembers(
                    organizationId, keyword, page, size, sortBy, sortDirection);

            return new ResponseEntity<>(userPage, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= UPDATE USER DETAILS =================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            // Asumsikan userDetails kini membawa field baru: name, email, gender, birthDate
            User updatedUser = userService.updateUser(id, userDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 🛑 METHOD BARU: Update Jabatan Anggota
    @PutMapping("/{pimpinanId}/position/{targetUserId}")
    public ResponseEntity<?> updateMemberPosition(@PathVariable Long pimpinanId,
            @PathVariable Long targetUserId,
            @RequestBody PositionUpdate dto) {
        try {
            User updatedUser = userService.updateMemberPosition(pimpinanId, targetUserId, dto.getPosition());
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 🛑 METHOD BARU: Update Nomor Anggota
    @PutMapping("/{pimpinanId}/member-number/{targetUserId}")
    public ResponseEntity<?> updateMemberNumber(@PathVariable Long pimpinanId,
            @PathVariable Long targetUserId,
            @RequestBody MemberNumberUpdate dto) {
        try {
            User updatedUser = userService.updateMemberNumber(pimpinanId, targetUserId, dto.getMemberNumber());
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{userId}/revoke")
    public ResponseEntity<?> revokeMembership(
            @PathVariable Long userId,
            @RequestParam String reason) {
        try {
            userService.revokeMembership(userId, reason);
            return ResponseEntity.ok("Keanggotaan berhasil dicabut");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}/reset-status")
    public ResponseEntity<?> resetStatus(@PathVariable Long userId) {
        try {
            // Panggil service, jangan panggil repository langsung di controller
            User user = userService.resetUserStatus(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/request-resign")
    public ResponseEntity<?> requestResignation(@PathVariable Long userId, @RequestParam String reason) {
        userService.requestResignation(userId, reason);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{pimpinanId}/process-resign/{targetUserId}")
    public ResponseEntity<?> processResign(
            @PathVariable Long pimpinanId,
            @PathVariable Long targetUserId,
            @RequestParam String action) {
        try {
            User updatedUser = userService.processResignation(pimpinanId, targetUserId, action);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Tambahkan di dalam UserController.java
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("Akun berhasil dihapus.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}