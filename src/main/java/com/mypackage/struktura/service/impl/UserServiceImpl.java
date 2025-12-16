package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.UserService;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Arrays;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public UserServiceImpl(UserRepository userRepository,
            OrganizationRepository organizationRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
    }

    // ================= REGISTER =================
    @Override
    public User registerUser(User user) {

        // 1️⃣ Validasi Email Unik (Penting)
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email sudah terdaftar.");
        }

        // 2️⃣ Validasi WAJIB & Password Minimal 🛑 FIX VALIDASI PASSWORD MANUAL
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            // FIX: Minimum 6 karakter
            throw new RuntimeException("Password wajib diisi dan minimal 6 karakter.");
        }

        // 3️⃣ DEFAULT SYSTEM VALUE
        user.setRole(Role.ANGGOTA);
        // KOREKSI: Menggunakan Enum MemberStatus
        user.setMemberStatus(MemberStatus.NON_MEMBER); // ⬅️ Menggunakan Enum NON_MEMBER
        user.setOrganization(null);
        user.setJoinDate(null);
        user.setMemberNumber(null);
        // CATATAN: Untuk projekan sederhana, kita abaikan enkripsi password dulu
        // (sesuai batasan scope)

        return userRepository.save(user);
    }

    // ================= AJUKAN GABUNG =================
    @Override
    public User requestJoinOrganization(Long userId, Long organizationId, String reason) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (user.getMemberStatus() != MemberStatus.NON_MEMBER) {
            throw new RuntimeException("User sudah bergabung atau menunggu approval");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        user.setOrganization(organization);
        user.setMemberStatus(MemberStatus.PENDING);
        user.setApplicationReason(reason);

        return userRepository.save(user);
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
        return userRepository.findByOrganizationIdAndMemberStatus(
                organizationId,
                MemberStatus.ACTIVE);
    }

    // ================= LOGIN =================
    @Override
    public User login(String email, String password) {
        // 1️⃣ Temukan user berdasarkan email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email atau Password salah"));

        // 2️⃣ Verifikasi password (tanpa enkripsi)
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Email atau Password salah");
        }

        // 3️⃣ Berhasil login
        return user;
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
        targetUser.setMemberStatus(MemberStatus.ACTIVE); // Pimpinan otomatis ACTIVE
        targetUser.setJoinDate(LocalDate.now());

        return userRepository.save(targetUser);
    }

    // ================= IMPLEMENTASI SEARCH & SORT =================
    @Override
    public Page<User> searchAndSortActiveMembers(Long organizationId, String keyword, int page, int size, String sortBy,
            String sortDirection) {

        // 🛑 Sederhanakan Sort: Hilangkan validasi yang kompleks, biarkan Spring
        // menangani exception.
        // Kita gunakan try-catch untuk Sort.Direction agar aman dari casing error.
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection.toUpperCase()); // Pastikan UPPERCASE
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.ASC; // Fallback aman
        }

        // 🛑 PERHATIAN: JIKA FIELD 'position' TIDAK ADA DI DATABASE, INI AKAN GAGAL.
        // Asumsi field yang dikirim frontend (name, email, joinDate, position) sudah
        // valid.
        Sort sort = Sort.by(direction, sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        // 2. Definisikan Kriteria Pencarian (Specification)
        Specification<User> spec = (root, query, criteriaBuilder) -> {

            Predicate finalPredicate = criteriaBuilder.conjunction();

            // Kriteria Wajib 1: ACTIVE
            finalPredicate = criteriaBuilder.and(finalPredicate,
                    criteriaBuilder.equal(root.get("memberStatus"), MemberStatus.ACTIVE));

            // 🛑 PERBAIKAN KRITIS: Menggunakan Eksplisit Join untuk Organisasi
            if (organizationId != null) {
                // Gunakan Path atau Join yang lebih aman
                // Path<Long> orgIdPath = root.get("organization").get("id"); // Cara lama yang
                // sering gagal

                // Coba cara yang lebih aman:
                finalPredicate = criteriaBuilder.and(finalPredicate,
                        criteriaBuilder.equal(root.join("organization").get("id"), organizationId));

                // NOTE: Pastikan di User.java, relasinya bernama 'organization' (sudah benar)
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

        // 🛑 FIX ENUM DESERIALIZATION DARI FRONTEAND:
        // Asumsi userDetails.getGender() sudah berisi ENUM (MALE/FEMALE)
        // Jika frontend mengirim String, Jackson sudah gagal di level ini.

        // Cek jika ada nilai Gender baru (Jika userDetails adalah Entity)
        if (userDetails.getGender() != null) {
            // Jika frontend mengirim String, kita harus konversi string tersebut ke Enum
            try {
                // Konversi string ke enum (misal: "LAKI_LAKI" menjadi MALE)
                // Karena kita tidak tahu persis string apa yang dikirim frontend:

                // Jika frontend mengirim MALE/FEMALE (String):
                // existingUser.setGender(Gender.valueOf(userDetails.getGender().name().toUpperCase()));

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

        // 3. Simpan
        return userRepository.save(existingUser);
    }

    // 🛑 METHOD BARU: Mengubah Jabatan Anggota
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

        return userRepository.save(targetUser);
    }

    // 🛑 METHOD BARU: Menetapkan Nomor Anggota
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
        // 🛑 Opsional: Cek duplikasi memberNumber jika diperlukan
        targetUser.setMemberNumber(memberNumber);

        return userRepository.save(targetUser);
    }

}
