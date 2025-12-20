package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.Notification;
import java.util.List;

public interface NotificationService {
    // Method untuk mengirim notifikasi ke semua Admin sistem
    void sendNotificationToAllAdmins(String message);
    
    // Method standar lainnya
    List<Notification> getUserNotifications(Long userId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);
}