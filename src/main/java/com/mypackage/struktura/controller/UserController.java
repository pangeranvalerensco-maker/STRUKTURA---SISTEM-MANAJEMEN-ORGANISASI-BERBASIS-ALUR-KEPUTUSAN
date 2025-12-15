package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.dto.LoginRequest;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.service.UserService;
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

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            // Sukses: Beri status HTTP 201 Created
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Gagal (misalnya email sudah terdaftar/validasi): Beri status HTTP 400 Bad
            // Request
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ================= AJUKAN GABUNG =================
    @PostMapping("/{userId}/join/{organizationId}")
    public User requestJoinOrganization(
            @PathVariable Long userId,
            @PathVariable Long organizationId) {
        return userService.requestJoinOrganization(userId, organizationId);
    }

    // ================= APPROVE (FIXED) =================
    // PIMPINAN / ADMIN approve anggota
    @PutMapping("/{approverId}/approve/{userId}")
    public User approveUser(
            @PathVariable Long approverId,
            @PathVariable Long userId) {
        return userService.approveUser(approverId, userId);
    }

    // ================= LIHAT ANGGOTA =================
    @GetMapping("/organization/{organizationId}")
    public List<User> members(@PathVariable Long organizationId) {
        return userService.getUsersByOrganization(organizationId);
    }

    // ================= LIHAT PENDING MEMBERS =================
    @GetMapping("/organization/{organizationId}/pending")
    public List<User> getPendingMembers(@PathVariable Long organizationId) {
        return userService.getPendingMembers(organizationId);
    }

    // REJECT MEMBER
    @PutMapping("/{approverId}/reject/{targetUserId}")
    public User rejectUser(@PathVariable Long approverId,
            @PathVariable Long targetUserId) {
        return userService.rejectUser(approverId, targetUserId);
    }

    // LIST ACTIVE MEMBERS
    @GetMapping("/organization/{organizationId}/active")
    public List<User> getActiveMembers(@PathVariable Long organizationId) {
        return userService.getActiveMembers(organizationId);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User loggedInUser = userService.login(request.getEmail(), request.getPassword());
            // Sukses: Beri status HTTP 200 OK
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Gagal (email/password salah): Beri status HTTP 401 Unauthorized
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}
