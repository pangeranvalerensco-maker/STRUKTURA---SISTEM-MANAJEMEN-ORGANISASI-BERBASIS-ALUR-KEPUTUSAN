package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ================= DAPATKAN NOTIFIKASI USER =================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // ================= HITUNG JUMLAH NOTIFIKASI YANG BELUM DIHITUNG =================
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // ================= UBAH NOTIFIKASI MENJADI DIBACA (DIJALANKAN SAAT BUKA HALAMAN NOTIFIKASI)
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // ================= KIRIM NOTIFIKASI KE ADMIN =================
    @PostMapping("/to-admin")
    public ResponseEntity<?> sendToAdmin(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        notificationService.sendNotificationToAllAdmins(message);
        return ResponseEntity.ok(Map.of("message", "Pesan terkirim"));
    }

    // ================= MENGAMBIL NOTIFIKASI PER HALAMAN =================
    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<?> getNotificationsPaged(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Memanggil service yang mengembalikan Page<Notification>
        return ResponseEntity.ok(notificationService.getUserNotificationsPaged(userId, page, size));
    }
}