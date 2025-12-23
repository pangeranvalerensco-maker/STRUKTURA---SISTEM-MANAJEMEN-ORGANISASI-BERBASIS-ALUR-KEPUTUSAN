package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.ProgramKerja;
import com.mypackage.struktura.model.entity.ProkerStatus;
import com.mypackage.struktura.service.ProgramKerjaService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/proker")
public class ProgramKerjaController {
    @Autowired
    private ProgramKerjaService prokerService;

    // ================= BUAT PROKER =================
    @PostMapping("/org/{orgId}")
    public ResponseEntity<?> createProker(
            @PathVariable Long orgId,
            @RequestParam Long creatorId,
            @RequestParam Long picId,
            @Valid @RequestBody ProgramKerja proker) {
        try {
            ProgramKerja result = prokerService.createProker(creatorId, orgId, picId, proker);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================= DAPATKAN PROKER =================
    @GetMapping("/org/{orgId}")
    public ResponseEntity<?> getProkerByOrg(@PathVariable Long orgId) {
        return ResponseEntity.ok(prokerService.getProkerByOrganization(orgId));
    }

    // ================= SETUJUI PROKER =================
    @PutMapping("/{prokerId}/approve")
    public ResponseEntity<?> approveProker(@PathVariable Long prokerId, @RequestParam Long pimpinanId) {
        try {
            return ResponseEntity.ok(prokerService.approveProker(prokerId, pimpinanId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================= TOLAK PROKER =================
    @PutMapping("/{prokerId}/reject")
    public ResponseEntity<?> rejectProker(
            @PathVariable Long prokerId,
            @RequestParam Long pimpinanId,
            @RequestParam(required = false) String reason) {
        try {
            return ResponseEntity.ok(prokerService.rejectProker(prokerId, pimpinanId, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================= HAPUS PROKER =================
    @DeleteMapping("/{prokerId}")
    public ResponseEntity<?> deleteProker(@PathVariable Long prokerId, @RequestParam Long pimpinanId) {
        try {
            prokerService.deleteProker(prokerId, pimpinanId);
            return ResponseEntity.ok("Proker berhasil dihapus");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================= UPDATE STATUS =================
    @PutMapping("/{prokerId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long prokerId,
            @RequestParam ProkerStatus status,
            @RequestParam Long userId) {
        // Logic: Cek apakah user adalah PIC atau Pimpinan
        return ResponseEntity.ok(prokerService.updateProkerStatus(prokerId, status, userId));
    }

    // ================= SELESAIKAN PROKER =================
    @PutMapping("/{id}/finish")
    public ResponseEntity<?> finishProker(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String report = body.get("executionReport");
            String link = body.get("evidenceLink"); // Tangkap evidenceLink

            ProgramKerja updated = prokerService.finishProker(id, userId, report, link);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================= GET PROKER BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getProkerById(@PathVariable Long id) {
        try {
            ProgramKerja proker = prokerService.getProkerById(id);
            return ResponseEntity.ok(proker);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proker tidak ditemukan.");
        }
    }
}