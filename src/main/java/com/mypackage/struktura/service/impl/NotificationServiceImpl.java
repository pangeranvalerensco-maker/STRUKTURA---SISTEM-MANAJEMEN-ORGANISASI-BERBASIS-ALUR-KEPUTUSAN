package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.NotificationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.NotificationService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void sendNotificationToAllAdmins(String message) {
        // Ambil semua user dengan role ADMIN
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        
        for (User admin : admins) {
            Notification n = new Notification();
            n.setRecipient(admin); // Sesuai field 'recipient' di Entity
            n.setMessage(message);
            n.setCreatedAt(LocalDateTime.now());
            n.setRead(false);
            notificationRepository.save(n);
        }
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        notifs.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifs);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }
}