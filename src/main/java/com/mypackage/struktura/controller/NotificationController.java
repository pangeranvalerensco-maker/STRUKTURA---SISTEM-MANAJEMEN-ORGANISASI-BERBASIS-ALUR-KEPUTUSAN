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

    private final NotificationService notificationService; // 🛑 Panggil Service, bukan Repository

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        // Logika pengambilan data dipindah ke Service
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        // Logika hitung data dipindah ke Service
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        // 🛑 Logika for-loop dipindah ke Service
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/to-admin")
    public ResponseEntity<?> sendToAdmin(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        // Gunakan service yang sudah ada untuk broadcast ke semua admin
        notificationService.sendNotificationToAllAdmins(message);
        return ResponseEntity.ok(Map.of("message", "Pesan terkirim"));
    }

    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<?> getNotificationsPaged(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Memanggil service yang mengembalikan Page<Notification>
        return ResponseEntity.ok(notificationService.getUserNotificationsPaged(userId, page, size));
    }
}