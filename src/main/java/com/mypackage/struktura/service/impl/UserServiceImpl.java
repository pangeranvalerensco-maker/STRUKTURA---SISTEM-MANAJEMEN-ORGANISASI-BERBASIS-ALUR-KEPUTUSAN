package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.UserService;
import org.springframework.stereotype.Service;

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

}
