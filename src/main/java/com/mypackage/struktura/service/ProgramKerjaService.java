package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.ProgramKerja;
import com.mypackage.struktura.model.entity.ProkerStatus;

import java.util.List;

public interface ProgramKerjaService {
    // 1. Membuat program kerja baru dengan PIC dan validasi jabatan pengaju
    ProgramKerja createProker(Long creatorId, Long organizationId, Long picId, ProgramKerja proker);

    // 2. Mendapatkan daftar proker berdasarkan organisasi
    List<ProgramKerja> getProkerByOrganization(Long organizationId);

    // 3. Menghapus proker (Method standar)
    void deleteProker(Long prokerId);

    // 4. Menyetujui proker (Hanya Pimpinan)
    ProgramKerja approveProker(Long prokerId, Long pimpinanId);

    // 5. Menolak proker (Hanya Pimpinan)
    ProgramKerja rejectProker(Long prokerId, Long pimpinanId, String reason);

    // 6. Menghapus proker dengan validasi akses Pimpinan
    void deleteProker(Long prokerId, Long pimpinanId);

    // 7. Method pembantu untuk validasi (Opsional ditaruh di interface, 
    // namun terlihat dipanggil di Impl Anda)
    void validatePimpinan(Long pimpinanId);

    // 8. Update status proker (PIC atau Pimpinan)
    ProgramKerja updateProkerStatus(Long prokerId, ProkerStatus status, Long userId);

    // 9. Menandai proker sebagai selesai dan menyimpan laporan hasil
    ProgramKerja finishProker(Long prokerId, Long userId, String executionReport, String evidenceLink);

    ProgramKerja getProkerById(Long id);
}