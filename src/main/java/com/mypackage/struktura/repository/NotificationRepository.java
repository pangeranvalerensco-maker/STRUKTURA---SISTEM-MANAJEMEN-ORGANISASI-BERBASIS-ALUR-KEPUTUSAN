package com.mypackage.struktura.repository;

import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Cari notifikasi berdasarkan User ID, urutkan dari yang terbaru
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);
    
    // Hitung jumlah notifikasi yang belum dibaca
    long countByRecipientIdAndIsReadFalse(Long userId);

    void deleteByRecipient(User recipient);

    Page<Notification> findByRecipientId(Long userId, Pageable pageable);
}