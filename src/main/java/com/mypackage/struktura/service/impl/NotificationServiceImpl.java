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

    // Mengirimkan pesan pemberitahuan kepada seluruh pengguna yang memiliki peran ADMIN. Biasanya digunakan untuk laporan bantuan atau pengajuan organisasi baru.
    @Override
    @Transactional 
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
    public List<Notification> getUserNotifications(Long userId) { // Mengambil daftar seluruh notifikasi yang ditujukan untuk satu user tertentu.
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional 
    public void markAllAsRead(Long userId) { // Mengubah status semua notifikasi seorang user menjadi "sudah dibaca" agar angka pemberitahuan (badge) hilang.
        List<Notification> notifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        if (!notifs.isEmpty()) {
            notifs.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(notifs);
        }
    }

    @Override
    public long getUnreadCount(Long userId) { // Menghitung berapa banyak notifikasi yang belum diklik atau dibaca oleh user.
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    public Page<Notification> getUserNotificationsPaged(Long userId, int page, int size) { // Mengambil data notifikasi secara bertahap (per halaman) agar aplikasi tidak berat saat data sudah banyak.
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return notificationRepository.findByRecipientId(userId, pageable);
    }
}