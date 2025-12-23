package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.NotificationRepository;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.UserService;
import com.mypackage.struktura.service.NotificationService;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    // Update Constructor
    public UserServiceImpl(UserRepository userRepository,
            OrganizationRepository organizationRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder) { 
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User getUserById(Long userId) { // Mengambil informasi profil lengkap seorang pengguna.
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
    }

    // ================= REGISTER =================
    @Override
    public User registerUser(User user) { // Proses pembuatan akun baru dan enkripsi password sebelum disimpan ke database.

        // Validasi Email Unik (Penting)
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email sudah terdaftar.");
        }

        // Validasi WAJIB & Password Minimal 🛑 FIX VALIDASI PASSWORD MANUAL
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            // FIX: Minimum 6 karakter
            throw new RuntimeException("Password wajib diisi dan minimal 6 karakter.");
        }

        user.setRole(Role.ANGGOTA);
        user.setMemberStatus(MemberStatus.NON_MEMBER); 
        user.setOrganization(null);
        user.setJoinDate(null);
        user.setMemberNumber(null);

        return userRepository.save(user);
    }

    // ================= AJUKAN GABUNG =================
    @Override
    public User requestJoinOrganization(Long userId, Long organizationId, String reason) { // Proses pengajuan diri menjadi anggota ke sebuah organisasi disertai alasan.
        User user = userRepository.findById(userId).orElseThrow();
        Organization org = organizationRepository.findById(organizationId).orElseThrow();

        user.setOrganization(org);
        user.setMemberStatus(MemberStatus.PENDING);
        user.setApplicationReason(reason);
        User savedUser = userRepository.save(user);

        // 📣 NOTIFIKASI UNTUK PIMPINAN
        try {
            List<User> leaders = userRepository.findByOrganizationIdAndRole(organizationId, Role.PIMPINAN);
            if (!leaders.isEmpty()) {
                Notification notif = new Notification();
                notif.setRecipient(leaders.get(0));
                notif.setMessage("NEW_MEMBER_REQUEST:Calon Anggota Baru: " + user.getName() + " ingin bergabung.");
                notif.setCreatedAt(LocalDateTime.now());
                notif.setRead(false);
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Gagal kirim notif join: " + e.getMessage());
        }

        return savedUser;
    }

    // ================= APPROVE =================
    @Override
    public User approveUser(Long approverId, Long targetUserId) {

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver tidak ditemukan"));

        if (approver.getRole() != Role.PIMPINAN) {
            throw new RuntimeException("Hanya pimpinan yang boleh approve");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (user.getMemberStatus() != MemberStatus.PENDING) {
            throw new RuntimeException("User tidak dalam status PENDING");
        }

        if (approver.getOrganization() == null ||
                !approver.getOrganization().getId()
                        .equals(user.getOrganization().getId())) {

            throw new RuntimeException("Tidak boleh approve user dari organisasi lain");
        }

        user.setMemberStatus(MemberStatus.ACTIVE);
        user.setJoinDate(LocalDate.now());

        User targetUser = userRepository.findById(targetUserId).orElseThrow();

        // 📣 NOTIFIKASI UNTUK USER
        Notification notif = new Notification();
        notif.setRecipient(targetUser);
        notif.setMessage(
                "Selamat! Pengajuan bergabung Anda di " + targetUser.getOrganization().getName() + " telah DISETUJUI.");
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        return userRepository.save(user);
    }

    // ================= LIST ANGGOTA =================
    @Override
    public List<User> getUsersByOrganization(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId);
    }

    // ================= LIST PENDING MEMBERS =================
    @Override
    public List<User> getPendingMembers(Long organizationId) {

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        return userRepository.findByOrganizationIdAndMemberStatus(
                organization.getId(),
                MemberStatus.PENDING);
    }

    // ================= REJECT MEMBER =================
    @Override
    public User rejectUser(Long approverId, Long targetUserId) {

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver tidak ditemukan"));

        if (approver.getRole() != Role.PIMPINAN) {
            throw new RuntimeException("Hanya PIMPINAN yang boleh reject anggota");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User target tidak ditemukan"));

        if (user.getMemberStatus() != MemberStatus.PENDING) {
            throw new RuntimeException("Hanya user PENDING yang bisa direject");
        }

        if (!approver.getOrganization().getId()
                .equals(user.getOrganization().getId())) {
            throw new RuntimeException("Tidak boleh reject user organisasi lain");
        }

        user.setMemberStatus(MemberStatus.NON_MEMBER);
        user.setOrganization(null);
        user.setJoinDate(null);

        return userRepository.save(user);
    }

    // ================= LIST ACTIVE MEMBERS =================
    @Override
    public List<User> getActiveMembers(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId);
    }

    // ================= LOGIN =================
    @Override
    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email atau Password salah"));

        // 1. Cek dengan BCrypt
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        if (user.getPassword().equals(rawPassword)) { // jika password tersimpan belum dalam bentuk sudah di di hash
            user.setPassword(passwordEncoder.encode(rawPassword));
            return userRepository.save(user);
        }

        throw new RuntimeException("Email atau Password salah");
    }

    // ================= ASSIGN PIMPINAN (ADMIN ONLY) =================
    @Override
    public User assignPimpinan(Long adminId, Long targetUserId, Long organizationId) {

        // 1. Cek: Apakah pemanggil (adminId) benar-benar ADMIN?
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin tidak ditemukan"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Hanya ADMIN yang dapat menetapkan PIMPINAN");
        }

        // 2. Ambil User Target dan Organisasi
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User target tidak ditemukan"));

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        // 3. Validasi: Status User Target
        if (targetUser.getRole() == Role.PIMPINAN) {
            throw new RuntimeException("User ini sudah menjabat sebagai PIMPINAN");
        }
        // Pastikan user tidak sedang aktif/pending di organisasi lain
        if (targetUser.getMemberStatus() == MemberStatus.ACTIVE
                || targetUser.getMemberStatus() == MemberStatus.PENDING) {
            throw new RuntimeException(
                    "User ini masih ACTIVE/PENDING di organisasi lain. Mohon di-reset/dikeluarkan terlebih dahulu.");
        }

        // 4. Update Status dan Role
        targetUser.setRole(Role.PIMPINAN);
        targetUser.setOrganization(organization);
        targetUser.setMemberStatus(MemberStatus.ACTIVE);
        targetUser.setJoinDate(LocalDate.now());

        return userRepository.save(targetUser);
    }

    // ================= IMPLEMENTASI SEARCH & SORT =================
    @Override
    public Page<User> searchAndSortActiveMembers(Long organizationId, String keyword, int page, int size, String sortBy,
            String sortDirection) {

        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection.toUpperCase()); 
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.ASC;
        }

        Sort sort = Sort.by(direction, sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        // Definisikan Kriteria Pencarian (Specification)
        Specification<User> spec = (root, query, criteriaBuilder) -> {

            Predicate finalPredicate = criteriaBuilder.conjunction();

            // Kriteria Wajib 1: ACTIVE
            finalPredicate = criteriaBuilder.and(finalPredicate,
                    criteriaBuilder.equal(root.get("memberStatus"), MemberStatus.ACTIVE));

            // Menggunakan Eksplisit Join untuk Organisasi
            if (organizationId != null) {
                finalPredicate = criteriaBuilder.and(finalPredicate,
                        criteriaBuilder.equal(root.join("organization").get("id"), organizationId));
            }

            // Kriteria Opsional 3: Keyword Search
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchLike = "%" + keyword.toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchLike);
                Predicate emailMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchLike);
                Predicate positionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("position")), searchLike);

                Predicate searchPredicate = criteriaBuilder.or(nameMatch, emailMatch, positionMatch);
                finalPredicate = criteriaBuilder.and(finalPredicate, searchPredicate);
            }

            return finalPredicate;
        };

        // 3. Eksekusi Query
        return userRepository.findAll(spec, pageable);
    }

    // ================= UPDATE USER DETAILS =================
    @Override
    public User updateUser(Long id, User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan."));

        // 1. Validasi Email (Jika berubah, pastikan unik)
        if (!existingUser.getEmail().equals(userDetails.getEmail())) {
            if (userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Email sudah digunakan oleh akun lain.");
            }
            existingUser.setEmail(userDetails.getEmail());
        }

        // 2. Update field baru/lama
        existingUser.setName(userDetails.getName());

        // Cek jika ada nilai Gender baru (Jika userDetails adalah Entity)
        if (userDetails.getGender() != null) {
            // Jika frontend mengirim String,  harus konversi string tersebut ke Enum
            try {
                // Jika userDetails sudah Entity, maka langsung set:
                existingUser.setGender(userDetails.getGender());

            } catch (IllegalArgumentException e) {
                // Tangkap jika string yang dikirim frontend tidak cocok dengan Enum MALE/FEMALE
                throw new RuntimeException("Nilai Jenis Kelamin tidak valid.");
            }
        } else {
            existingUser.setGender(null);
        }

        existingUser.setBirthDate(userDetails.getBirthDate());
        existingUser.setExperienceSummary(userDetails.getExperienceSummary());

        // 3. Simpan
        return userRepository.save(existingUser);
    }

    // Mengubah Jabatan Anggota
    @Override
    public User updateMemberPosition(Long pimpinanId, Long targetUserId, String newPosition) {
        // 1. Cek Pimpinan
        User pimpinan = userRepository.findById(pimpinanId)
                .orElseThrow(() -> new RuntimeException("Pimpinan tidak ditemukan"));
        if (pimpinan.getRole() != Role.PIMPINAN) {
            throw new RuntimeException("Hanya PIMPINAN yang dapat mengubah jabatan.");
        }

        // 2. Ambil User Target
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User target tidak ditemukan."));

        // 3. Validasi Keanggotaan dan Organisasi
        if (targetUser.getMemberStatus() != MemberStatus.ACTIVE) {
            throw new RuntimeException("Hanya anggota ACTIVE yang jabatannya bisa diubah.");
        }
        if (pimpinan.getOrganization() == null ||
                !pimpinan.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
            throw new RuntimeException("Tidak boleh mengedit jabatan anggota dari organisasi lain.");
        }

        // 4. Update Jabatan
        targetUser.setPosition(newPosition);
        userRepository.save(targetUser);
        return userRepository.findById(targetUserId).orElseThrow(); // Ambil ulang data utuh
    }

    // Menetapkan Nomor Anggota
    @Override
    public User updateMemberNumber(Long pimpinanId, Long targetUserId, String memberNumber) {
        // 1. Cek Pimpinan (Validasi serupa dengan updateMemberPosition)
        User pimpinan = userRepository.findById(pimpinanId)
                .orElseThrow(() -> new RuntimeException("Pimpinan tidak ditemukan"));
        if (pimpinan.getRole() != Role.PIMPINAN) {
            throw new RuntimeException("Hanya PIMPINAN yang dapat mengubah nomor anggota.");
        }

        // 2. Ambil User Target
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User target tidak ditemukan."));

        // 3. Validasi Keanggotaan dan Organisasi
        if (targetUser.getMemberStatus() != MemberStatus.ACTIVE) {
            throw new RuntimeException("Hanya anggota ACTIVE yang nomor anggotanya bisa diubah.");
        }
        if (pimpinan.getOrganization() == null ||
                !pimpinan.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
            throw new RuntimeException("Tidak boleh mengedit nomor anggota dari organisasi lain.");
        }

        // 4. Update Nomor Anggota
        targetUser.setMemberNumber(memberNumber);
        userRepository.save(targetUser);
        return userRepository.findById(targetUserId).orElseThrow(); // Ambil ulang data utuh

    }

    @Override
    public void revokeMembership(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : "Organisasi";

        // 📣 KIRIM NOTIFIKASI DULU sebelum datanya dihapus/di-null kan
        Notification notif = new Notification();
        notif.setRecipient(user);
        notif.setMessage("Keanggotaan Anda di " + orgName + " telah DICABUT. Alasan: " + reason);
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        // Proses pencabutan (Logika Anda yang sudah ada)
        user.setMemberStatus(MemberStatus.REVOKED);
        user.setRevokeReason(reason);
        user.setOrganization(null);
        user.setPosition(null);
        user.setMemberNumber(null);

        userRepository.save(user);
    }

    @Override
    public User resetUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        user.setMemberStatus(MemberStatus.NON_MEMBER);
        user.setRevokeReason(null); // Hapus alasan lama agar bisa daftar lagi
        return userRepository.save(user);
    }

    @Override
    public void requestResignation(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        // 1. Ubah status user agar muncul di tabel "Permintaan Keluar"
        user.setMemberStatus(MemberStatus.RESIGN_REQUESTED);
        user.setApplicationReason(reason); // ini untuk menyimpan alasan resign
        userRepository.save(user);

        // 2. Kirim Notifikasi
        Notification notif = new Notification();
        notif.setCreatedAt(LocalDateTime.now());

        if (user.getRole() == Role.PIMPINAN) {
            notif.setMessage("RESIGN_PIMPINAN: Pimpinan " + user.getName() + " ingin resign.");
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (!admins.isEmpty())
                notif.setRecipient(admins.get(0));
        } else {
            notif.setMessage("NEW_RESIGN_REQUEST: " + user.getName() + " ingin resign.");
            List<User> leaders = userRepository.findByOrganizationIdAndRole(user.getOrganization().getId(),
                    Role.PIMPINAN);
            if (!leaders.isEmpty())
                notif.setRecipient(leaders.get(0));
        }
        notificationRepository.save(notif);
    }

    @Override
    public User processResignation(Long pimpinanId, Long targetUserId, String action) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        Notification notif = new Notification();
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRecipient(targetUser); // Notif dikirim ke anggota tersebut

        if ("APPROVE".equalsIgnoreCase(action)) {
            // Logika jika disetujui: Lepas dari organisasi
            targetUser.setMemberStatus(MemberStatus.NON_MEMBER);
            targetUser.setOrganization(null);
            targetUser.setRole(Role.ANGGOTA);
            targetUser.setPosition(null);
            targetUser.setMemberNumber(null);
            targetUser.setApplicationReason(null);

            notif.setMessage(
                    "Pengunduran diri Anda telah DISETUJUI oleh pimpinan. Anda sekarang bukan anggota organisasi lagi.");
        } else {
            // Logika jika ditolak: Kembali aktif
            targetUser.setMemberStatus(MemberStatus.ACTIVE);
            targetUser.setApplicationReason(null);

            notif.setMessage("Permintaan pengunduran diri Anda DITOLAK. Anda tetap menjadi anggota aktif.");
        }

        notificationRepository.save(notif);
        return userRepository.save(targetUser); 
    }

    // anotasi @Transactional agar jika salah satu gagal, semua dibatalkan
    @Transactional
    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        // 1. Validasi Keanggotaan
        if (user.getOrganization() != null) {
            throw new RuntimeException("Gagal menghapus: Anda masih terdaftar dalam organisasi.");
        }

        // 2. Hapus semua notifikasi milik user ini terlebih dahulu
        notificationRepository.deleteByRecipient(user);

        // 3. Hapus User
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public User handoverLeadership(Long currentPimpinanId, Long targetMemberId) {
        User currentPimpinan = getUserById(currentPimpinanId); //
        User targetMember = getUserById(targetMemberId); //

        if (!currentPimpinan.getOrganization().getId().equals(targetMember.getOrganization().getId())) {
            throw new RuntimeException("User harus berada dalam organisasi yang sama");
        }

        // 1. Proses Pertukaran Jabatan
        targetMember.setRole(Role.PIMPINAN);
        targetMember.setPosition("Ketua Umum (Hasil Handover)");

        currentPimpinan.setRole(Role.ANGGOTA);
        currentPimpinan.setPosition("Mantan Pimpinan / Anggota");

        userRepository.save(currentPimpinan);
        User newLeader = userRepository.save(targetMember);

        // 2. Kirim Notifikasi ke Seluruh Admin
        notificationService.sendNotificationToAllAdmins(
                "HANDOVER_INFO: Pimpinan organisasi '" + newLeader.getOrganization().getName() +
                        "' telah beralih dari " + currentPimpinan.getName() + " ke " + newLeader.getName());

        return newLeader;
    }

    @Override
    @Transactional
    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        // Cek password lama: Mendukung data lama (teks biasa) atau data baru (BCrypt)
        boolean isOldPasswordCorrect = passwordEncoder.matches(oldPassword, user.getPassword()) ||
                user.getPassword().equals(oldPassword);

        if (!isOldPasswordCorrect) {
            throw new RuntimeException("Password lama salah!");
        }

        if (newPassword.length() < 6) {
            throw new RuntimeException("Password baru minimal 6 karakter.");
        }

        // Simpan password baru dalam format hash BCrypt
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}
