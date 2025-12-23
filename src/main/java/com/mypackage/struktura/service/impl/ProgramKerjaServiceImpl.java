package com.mypackage.struktura.service.impl;

import com.mypackage.struktura.model.entity.ProgramKerja;
import com.mypackage.struktura.model.entity.ProkerStatus;
import com.mypackage.struktura.model.entity.Organization;
import com.mypackage.struktura.model.entity.Notification;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.model.entity.Role;
import com.mypackage.struktura.repository.ProgramKerjaRepository;
import com.mypackage.struktura.repository.OrganizationRepository;
import com.mypackage.struktura.repository.NotificationRepository;
import com.mypackage.struktura.repository.UserRepository;
import com.mypackage.struktura.service.ProgramKerjaService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgramKerjaServiceImpl implements ProgramKerjaService {

    private final NotificationRepository notificationRepository;
    private final ProgramKerjaRepository prokerRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository; 

    public ProgramKerjaServiceImpl(ProgramKerjaRepository prokerRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository, NotificationRepository notificationRepository) {
        this.prokerRepository = prokerRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public ProgramKerja createProker(Long creatorId, Long organizationId, Long picId, ProgramKerja proker) { // Membuat draf pengajuan program kerja baru oleh anggota kepada pimpinan.
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User pembuat tidak ditemukan"));

        // Validasi Jabatan (Pastikan mencakup semua variasi jabatan Anda)
        String pos = creator.getPosition() != null ? creator.getPosition().toLowerCase() : "";
        boolean isAuthorized = pos.contains("ketua") || pos.contains("koordinator") ||
                pos.contains("kepala") || pos.contains("kabid");

        if (!isAuthorized) {
            throw new RuntimeException("Hanya Ketua/Koordinator yang boleh mengajukan proker.");
        }

        User pic = userRepository.findById(picId)
                .orElseThrow(() -> new RuntimeException("PIC tidak ditemukan"));

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organisasi tidak ditemukan"));

        proker.setCreatedBy(creator); // Set pembuat proker
        proker.setOrganization(org);
        proker.setPic(pic);
        proker.setStatus(ProkerStatus.PENDING);

        // 1. Simpan ke Database
        ProgramKerja savedProker = prokerRepository.save(proker);

        // 2. Buat Notifikasi (Tanpa mengganggu return)
        try {
            // 1. Notifikasi untuk PIC (Tujuan Anda)
            Notification notifPic = new Notification();
            notifPic.setRecipient(pic); // User yang ditunjuk sebagai PIC
            notifPic.setMessage("PENGURUS_AJUAN: Anda diajukan sebagai PIC untuk proker '" + savedProker.getTitle()
                    + "'. Menunggu persetujuan pimpinan.");
            notifPic.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notifPic);

            // 2. Notifikasi untuk Pimpinan (Agar segera cek)
            List<User> leaders = userRepository.findByOrganizationIdAndRole(organizationId, Role.PIMPINAN);
            if (!leaders.isEmpty()) {
                Notification notifLeader = new Notification();
                notifLeader.setRecipient(leaders.get(0));
                notifLeader.setMessage("PROKER_NEW:" + savedProker.getId() + ":" + savedProker.getTitle());
                notifLeader.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notifLeader);
            }
        } catch (Exception e) {
            System.err.println("Gagal kirim notif: " + e.getMessage());
        }

        // 3. WAJIB RETURN DI SINI
        return savedProker;
    }

    @Override
    public List<ProgramKerja> getProkerByOrganization(Long organizationId) {
        return prokerRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteProker(Long prokerId) {
        prokerRepository.deleteById(prokerId);
    }

    @Override
    public ProgramKerja approveProker(Long prokerId, Long pimpinanId) { // SETUJUI PROKER
        validatePimpinan(pimpinanId);

        ProgramKerja proker = prokerRepository.findById(prokerId)
                .orElseThrow(() -> new RuntimeException("Proker tidak ditemukan"));

        proker.setStatus(ProkerStatus.PLANNED);
        ProgramKerja savedProker = prokerRepository.save(proker);

        // KIRIM NOTIFIKASI
        try {
            // Notif 1: Ke PIC (Agar tahu harus mulai kerja)
            sendNotification(proker.getPic(),
                    "PROKER_STATUS:Proker '" + proker.getTitle() + "' telah DISETUJUI. Silakan mulai pelaksanaan.");

            // Notif 2: Ke Pengaju/Creator (Hanya jika pengaju BUKAN PIC-nya sendiri)
            if (proker.getCreatedBy() != null && !proker.getCreatedBy().getId().equals(proker.getPic().getId())) {
                sendNotification(proker.getCreatedBy(),
                        "PROKER_STATUS:Usulan Proker Anda '" + proker.getTitle() + "' telah DISETUJUI oleh Pimpinan.");
            }
        } catch (Exception e) {
            System.err.println("Gagal kirim notif approve: " + e.getMessage());
        }

        return savedProker;
    }

    @Override
    public ProgramKerja rejectProker(Long prokerId, Long pimpinanId, String reason) { // TOLAK PROKER
        validatePimpinan(pimpinanId);
        ProgramKerja proker = prokerRepository.findById(prokerId).orElseThrow();
        proker.setStatus(ProkerStatus.REJECTED);

        // Kirim notif ke PIC & Pengaju
        String msg = "PROKER_STATUS:Proker '" + proker.getTitle() + "' DITOLAK. Alasan: " + reason;

        // Notif PIC
        sendNotification(proker.getPic(), msg);

        // Notif Pengaju (jika orangnya beda)
        if (proker.getCreatedBy() != null && !proker.getCreatedBy().getId().equals(proker.getPic().getId())) {
            sendNotification(proker.getCreatedBy(), msg);
        }

        return prokerRepository.save(proker);
    }

    private void sendNotification(User recipient, String message) { // Method pembantu biar kode gak panjang
        Notification notif = new Notification();
        notif.setRecipient(recipient);
        notif.setMessage(message);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRead(false);
        notificationRepository.save(notif);
    }
    
    @Override
    public void deleteProker(Long prokerId, Long pimpinanId) { // Fungsi Delete Proker (Hak Pimpinan)
        validatePimpinan(pimpinanId);
        ProgramKerja proker = prokerRepository.findById(prokerId)
                .orElseThrow(() -> new RuntimeException("Proker tidak ditemukan"));

        // PROTEKSI: Proker yang sudah selesai tidak boleh dihapus untuk audit
        if (proker.getStatus() == ProkerStatus.COMPLETED) {
            throw new RuntimeException("Proker yang sudah selesai tidak dapat dihapus.");
        }

        prokerRepository.deleteById(prokerId);
    }

    public void validatePimpinan(Long pimpinanId) { // memastikan user benar-benar memiliki wewenang sebagai pimpinan sebelum mengeksekusi aksi tertentu.
        User user = userRepository.findById(pimpinanId).orElseThrow();
        if (user.getRole() != Role.PIMPINAN) {
            throw new RuntimeException("Hanya Pimpinan yang memiliki hak akses ini.");
        }
    }

    @Override
    public ProgramKerja updateProkerStatus(Long prokerId, ProkerStatus status, Long userId) { // Mengubah status kegiatan secara dinamis (misal: dari "Direncanakan" ke "Berlangsung").
        ProgramKerja proker = prokerRepository.findById(prokerId)
                .orElseThrow(() -> new RuntimeException("Proker tidak ditemukan"));

        // Validasi: Hanya PIC proker atau Pimpinan yang boleh ubah status
        if (!proker.getPic().getId().equals(userId)) {
            User user = userRepository.findById(userId).orElseThrow();
            if (user.getRole() != Role.PIMPINAN) {
                throw new RuntimeException("Hanya PIC atau Pimpinan yang bisa mengubah status.");
            }
        }

        proker.setStatus(status);
        ProgramKerja saved = prokerRepository.save(proker);

        // Kirim Notif ke Pengaju jika status menjadi Berlangsung
        if (status == ProkerStatus.ON_GOING && proker.getCreatedBy() != null) {
            // Pastikan tidak mengirim ke diri sendiri jika Pengaju adalah PIC-nya
            if (!proker.getCreatedBy().getId().equals(proker.getPic().getId())) {
                sendNotification(proker.getCreatedBy(),
                        "PROKER_STATUS:Proker yang Anda ajukan '" + proker.getTitle() + "' SEKARANG MULAI BERJALAN.");
            }
        }

        return saved;
    }

    @Override
    public ProgramKerja finishProker(Long prokerId, Long userId, String executionReport, String evidenceLink) {
        ProgramKerja proker = prokerRepository.findById(prokerId)
                .orElseThrow(() -> new RuntimeException("Proker tidak ditemukan"));

        // 1. Validasi: Hanya PIC proker atau Pimpinan yang boleh menandai selesai
        if (!proker.getPic().getId().equals(userId)) {
            User user = userRepository.findById(userId).orElseThrow();
            if (user.getRole() != Role.PIMPINAN) {
                throw new RuntimeException("Hanya PIC atau Pimpinan yang bisa menandai proker sebagai selesai.");
            }
        }

        // 2. Update data proker
        proker.setStatus(ProkerStatus.COMPLETED);
        proker.setExecutionReport(executionReport);
        proker.setEvidenceLink(evidenceLink);
        ProgramKerja saved = prokerRepository.save(proker);

        try {
            // Cari pimpinan organisasi dari proker ini melalui userRepository
            List<User> leaders = userRepository.findByOrganizationIdAndRole(proker.getOrganization().getId(),
                    Role.PIMPINAN);
            String pimpinanMsg = "PROKER_FINISH:" + proker.getId() + ":PIC " + proker.getPic().getName()
                    + " telah menyelesaikan proker: " + proker.getTitle();

            if (!leaders.isEmpty()) {
                sendNotification(leaders.get(0), pimpinanMsg);
            }
            // 2. Notif ke Pengaju (BARU)
            if (proker.getCreatedBy() != null && !proker.getCreatedBy().getId().equals(proker.getPic().getId())) {
                sendNotification(proker.getCreatedBy(),
                        "PROKER_STATUS:Proker yang Anda ajukan '" + proker.getTitle()
                                + "' TELAH SELESAI dikerjakan oleh PIC.");
            }
        } catch (Exception e) {
            System.err.println("Gagal mengirim notifikasi: " + e.getMessage());
        }

        return saved;
    }

    @Override
    public ProgramKerja getProkerById(Long id) { // Melihat detail lengkap satu program kerja tertentu.
        return prokerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proker tidak ditemukan"));
    }
}