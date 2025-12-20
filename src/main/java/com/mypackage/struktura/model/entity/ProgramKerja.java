package com.mypackage.struktura.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "program_kerja")
public class ProgramKerja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private ProkerStatus status;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "pic_id")
    private User pic; // Menunjuk ke anggota yang jadi penanggung jawab

    private String positionRequirement; // Menyimpan jabatan pembuat proker (untuk audit)

    // Tambahkan di dalam class ProgramKerja
    private Double totalAnggaran;

    @Column(length = 2000)
    private String rincianAnggaran;

    private String executionReport; // Untuk menyimpan hasil kerja

    private String evidenceLink; // Link dokumentasi (Google Drive, dll)

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User createdBy; // Menyimpan informasi pembuat proker

    // === Constructor, Getter, & Setter ===
    public ProgramKerja() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public ProkerStatus getStatus() {
        return status;
    }

    public void setStatus(ProkerStatus status) {
        this.status = status;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getPic() {
        return pic;
    }

    public void setPic(User pic) {
        this.pic = pic;
    }

    public String getPositionRequirement() {
        return positionRequirement;
    }

    public void setPositionRequirement(String positionRequirement) {
        this.positionRequirement = positionRequirement;
    }

    public Double getTotalAnggaran() {
        return totalAnggaran;
    }

    public void setTotalAnggaran(Double totalAnggaran) {
        this.totalAnggaran = totalAnggaran;
    }

    public String getRincianAnggaran() {
        return rincianAnggaran;
    }

    public void setRincianAnggaran(String rincianAnggaran) {
        this.rincianAnggaran = rincianAnggaran;
    }

    public String getExecutionReport() {
        return executionReport;
    }

    public void setExecutionReport(String executionReport) {
        this.executionReport = executionReport;
    }

    public String getEvidenceLink() {
        return evidenceLink;
    }

    public void setEvidenceLink(String evidenceLink) {
        this.evidenceLink = evidenceLink;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}
