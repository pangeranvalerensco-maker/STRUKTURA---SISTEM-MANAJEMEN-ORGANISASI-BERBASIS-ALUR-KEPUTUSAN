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

        // 2️⃣ Validasi WAJIB
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password wajib diisi");
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
    public User requestJoinOrganization(Long userId, Long organizationId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (user.getMemberStatus() != MemberStatus.NON_MEMBER) {
            throw new RuntimeException("User sudah bergabung atau menunggu approval");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        user.setOrganization(organization);
        user.setMemberStatus(MemberStatus.PENDING);

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
        if (targetUser.getMemberStatus() == MemberStatus.ACTIVE || targetUser.getMemberStatus() == MemberStatus.PENDING) {
            throw new RuntimeException("User ini masih ACTIVE/PENDING di organisasi lain. Mohon di-reset/dikeluarkan terlebih dahulu.");
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
    public Page<User> searchAndSortActiveMembers(Long organizationId, String keyword, int page, int size, String sortBy, String sortDirection) {
        
        // 1. Definisikan Paging dan Sorting
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        // 2. Definisikan Kriteria Pencarian (Specification)
        // Kita akan menggunakan JPA Specification untuk membuat query dinamis
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            
            Predicate finalPredicate = criteriaBuilder.conjunction();
            
            // Kriteria Wajib 1: Harus anggota ACTIVE
            finalPredicate = criteriaBuilder.and(finalPredicate, criteriaBuilder.equal(root.get("memberStatus"), MemberStatus.ACTIVE));
            
            // Kriteria Wajib 2: Harus terikat pada organisasi yang diminta
            if (organizationId != null) {
                // Di sini kita asumsikan Organization ID pasti valid
                finalPredicate = criteriaBuilder.and(finalPredicate, criteriaBuilder.equal(root.get("organization").get("id"), organizationId));
            }
            
            // Kriteria Opsional 3: Keyword Search (Mencari di Name atau Email)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchLike = "%" + keyword.toLowerCase() + "%";
                
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchLike);
                Predicate emailMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchLike);
                
                // Gabungkan pencarian nama dan email dengan OR
                Predicate searchPredicate = criteriaBuilder.or(nameMatch, emailMatch);
                
                finalPredicate = criteriaBuilder.and(finalPredicate, searchPredicate);
            }
            
            return finalPredicate;
        };

        // 3. Eksekusi Query
        return userRepository.findAll(spec, pageable);
    }
}
