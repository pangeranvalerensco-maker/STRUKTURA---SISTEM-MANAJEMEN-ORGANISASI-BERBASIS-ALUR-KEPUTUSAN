package com.mypackage.struktura.controller;

import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}