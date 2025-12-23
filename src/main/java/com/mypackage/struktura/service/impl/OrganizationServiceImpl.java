package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.OrganizationService;
import com.mypackage.struktura.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;
import jakarta.transaction.Transactional;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository, UserRepository userRepository,
            NotificationService notificationService) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional 
    public Organization createOrganization(Organization organization, Long creatorId) { // Proses pendaftaran organisasi baru ke sistem dan otomatis menetapkan pendaftar sebagai pimpinan.
        // 1. Validasi Keberadaan User
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        // 2. Logika Proteksi: Cek kepemilikan organisasi 
        if (creator.getOrganization() != null) {
            throw new RuntimeException("Anda sudah terdaftar di organisasi lain.");
        }

        // 3. Inisialisasi Data Organisasi
        organization.setCreatedDate(LocalDate.now());
        organization.setStatus("ACTIVE");
        Organization savedOrg = organizationRepository.save(organization);

        // 4. Logika Bisnis: Update User & Kirim Notifikasi
        if (creator.getRole() != Role.ADMIN) {
            // User biasa mendaftar organisasi -> Otomatis jadi Pimpinan
            creator.setOrganization(savedOrg);
            creator.setRole(Role.PIMPINAN);
            creator.setMemberStatus(MemberStatus.ACTIVE);
            creator.setPosition("Ketua Umum / Founder");
            userRepository.save(creator);

            notificationService.sendNotificationToAllAdmins("ORGANISASI_BARU: " + creator.getName()
                    + " telah mendaftarkan organisasi baru: " + savedOrg.getName());
        } else {
            // Jika Admin yang membuat, cukup kirim notifikasi sistem
            notificationService
                    .sendNotificationToAllAdmins("NEW_ORG_REQUEST:" + savedOrg.getId() + ":" + savedOrg.getName());
        }

        return savedOrg;
    }

    @Override
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Override
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    @Override
    public List<Organization> searchOrganizations(String keyword, int page, int size, String sortBy,
            String sortDirection) { // Fitur pencarian organisasi dengan dukungan kata kunci, pembagian halaman (page), dan pengurutan (sort).  
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);

        String activeStatus = "ACTIVE";

        if (keyword == null || keyword.isEmpty()) {
            return organizationRepository.findByStatusIgnoreCase(activeStatus, sort);
        }

        String searchPattern = "%" + keyword.toLowerCase() + "%";
        return organizationRepository.searchActiveByNameOrDescription(searchPattern, activeStatus, sort);
    }

    @Override
    public Organization updateOrganization(Long orgId, Organization updatedData, Long pimpinanId) { // Memperbarui data organisasi dengan validasi keamanan pimpinan.
        // 1. Validasi Pimpinan
        User pimpinan = userRepository.findById(pimpinanId)
                .orElseThrow(() -> new RuntimeException("Pimpinan tidak ditemukan"));

        // Cek apakah user adalah Pimpinan dan milik organisasi tersebut
        if (pimpinan.getRole() != Role.PIMPINAN || !pimpinan.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Hanya Pimpinan organisasi ini yang boleh mengedit profil.");
        }

        // 2. Ambil data lama
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        // 3. Update field
        org.setDescription(updatedData.getDescription());
        org.setEstablishedDate(updatedData.getEstablishedDate());
        org.setVisionMission(updatedData.getVisionMission());
        org.setScope(updatedData.getScope());
        org.setField(updatedData.getField());
        org.setAddress(updatedData.getAddress()); // Field baru
        org.setExternalLink(updatedData.getExternalLink()); // Field baru
        org.setMembershipRequirement(updatedData.getMembershipRequirement());

        return organizationRepository.save(org);
    }

    @Override
    @Transactional
    public void deleteOrganization(Long orgId, Long adminId) { // Menghapus data organisasi secara permanen, hanya bisa dilakukan oleh Admin sistem.
        // 1. Validasi Admin
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin tidak ditemukan"));
        if (!admin.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Hanya Admin yang boleh menghapus organisasi.");
        }

        // 2. Ambil Organisasi
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        // 3. Cek Jumlah Anggota Aktif
        List<User> members = userRepository.findByOrganizationIdAndMemberStatus(org.getId(), MemberStatus.ACTIVE);
        if (!members.isEmpty()) {
            throw new RuntimeException("Organisasi tidak bisa dihapus karena masih memiliki anggota aktif ("
                    + members.size() + " orang).");
        }

        // 4. Hapus (Logika database akan menghapus record organisasi)
        organizationRepository.delete(org);
    }

    @Transactional
    public User processResignation(Long pimpinanId, Long targetUserId, String action) {
        User target = userRepository.findById(targetUserId).orElseThrow();

        if ("APPROVE".equals(action)) {
            if (target.getRole() == Role.PIMPINAN) {
                // Cek jumlah seluruh anggota di organisasi tersebut
                List<User> allMembers = userRepository.findByOrganizationId(target.getOrganization().getId());

                // Jika ada lebih dari 1 orang dan belum ada pimpinan baru
                if (allMembers.size() > 1) {
                    List<User> otherLeaders = userRepository
                            .findByOrganizationIdAndRole(target.getOrganization().getId(), Role.PIMPINAN);
                    if (otherLeaders.size() <= 1) {
                        throw new RuntimeException(
                                "Gagal: Masih ada anggota lain. Harap 'Serah Terima Jabatan' atau 'Hapus Organisasi' terlebih dahulu.");
                    }
                }
            }

            // Reset status user menjadi NON_MEMBER
            target.setOrganization(null);
            target.setRole(Role.ANGGOTA);
            target.setMemberStatus(com.mypackage.struktura.model.entity.MemberStatus.NON_MEMBER);
            target.setPosition(null);

            return userRepository.save(target);
        }
        return target;
    }

    @Override
    @Transactional
    public Organization fullUpdate(Long id, Long pimpinanId, Organization updatedData) { // Melakukan pembaruan menyeluruh pada semua kolom data organisasi.
        // Gunakan logika update yang sudah ada atau buat baru yang mencakup semua field
        Organization org = getOrganizationById(id);

        // Validasi Pimpinan
        User pimpinan = userRepository.findById(pimpinanId).orElseThrow();
        if (pimpinan.getRole() != Role.PIMPINAN || !pimpinan.getOrganization().getId().equals(id)) {
            throw new RuntimeException("Akses ditolak: Anda bukan pimpinan organisasi ini.");
        }

        org.setName(updatedData.getName());
        org.setPeriod(updatedData.getPeriod());
        org.setEstablishedDate(updatedData.getEstablishedDate());
        org.setField(updatedData.getField());
        org.setScope(updatedData.getScope());
        org.setDescription(updatedData.getDescription());
        org.setVisionMission(updatedData.getVisionMission());
        org.setAddress(updatedData.getAddress());
        org.setExternalLink(updatedData.getExternalLink());
        org.setMembershipRequirement(updatedData.getMembershipRequirement());
        org.setStatus(updatedData.getStatus()); 

        return organizationRepository.save(org);
    }

    @Override
    @Transactional
    public void createDeleteRequest(Long id, Long pimpinanId, String reason) { // Mengirimkan permohonan resmi kepada Admin untuk membubarkan/menghapus organisasi disertai alasan yang kuat.
        Organization org = getOrganizationById(id);
        User pimpinan = userRepository.findById(pimpinanId).orElseThrow();

        // Kirim notifikasi ke Admin sebagai pengganti sistem request-delete sementara
        notificationService
                .sendNotificationToAllAdmins("DELETE_REQUEST:" + id + ":" + org.getName() + " Alasan: " + reason);
    }
}
