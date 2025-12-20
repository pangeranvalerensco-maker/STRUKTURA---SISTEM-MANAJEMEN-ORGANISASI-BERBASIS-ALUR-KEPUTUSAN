package com.mypackage.struktura.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "program_kerja")
@Data
@NoArgsConstructor
public class ProgramKerja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Judul proker wajib diisi")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Deskripsi wajib diisi")
    @Size(max = 1000, message = "Deskripsi maksimal 1000 karakter")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Tanggal mulai wajib ada")
    private LocalDate startDate;

    @NotNull(message = "Tanggal berakhir wajib ada")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private ProkerStatus status;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "pic_id")
    private User pic;

    private String positionRequirement;

    @Min(value = 0, message = "Anggaran tidak boleh negatif")
    private Double totalAnggaran;

    @Column(length = 2000)
    private String rincianAnggaran;

    private String executionReport;
    private String evidenceLink;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User createdBy;
}