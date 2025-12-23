package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.Notification;
import org.springframework.data.domain.Page;
import java.util.List;

public interface NotificationService {
    
    void sendNotificationToAllAdmins(String message);

    List<Notification> getUserNotifications(Long userId);

    void markAllAsRead(Long userId);

    long getUnreadCount(Long userId);

    Page<Notification> getUserNotificationsPaged(Long userId, int page, int size);
}