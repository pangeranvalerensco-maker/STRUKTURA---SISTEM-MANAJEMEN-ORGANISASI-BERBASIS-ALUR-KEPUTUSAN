package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.NotificationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.NotificationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional // 🛑 Tambahkan Transactional agar proses looping aman
    public void sendNotificationToAllAdmins(String message) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            Notification n = new Notification();
            n.setRecipient(admin);
            n.setMessage(message);
            n.setCreatedAt(LocalDateTime.now());
            n.setRead(false);
            notificationRepository.save(n);
        }
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        // Logika pengambilan data dipusatkan di sini
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional // 🛑 Penting untuk operasi update massal
    public void markAllAsRead(Long userId) {
        // Logika bisnis looping dipindah dari Controller ke sini
        List<Notification> notifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        if (!notifs.isEmpty()) {
            notifs.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(notifs);
        }
    }

    @Override
    public long getUnreadCount(Long userId) {
        // Logika perhitungan data
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    public Page<Notification> getUserNotificationsPaged(Long userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return notificationRepository.findByRecipientId(userId, pageable);
    }
}