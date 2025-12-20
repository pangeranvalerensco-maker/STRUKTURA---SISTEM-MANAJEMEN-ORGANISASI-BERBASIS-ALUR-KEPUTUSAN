package com.mypackage.struktura.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nama organisasi tidak boleh kosong")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Deskripsi tidak boleh kosong")
    @Column(length = 1000)
    private String description;

    @NotBlank(message = "Status organisasi wajib diisi")
    @Column(nullable = false)
    private String status;

    private LocalDate createdDate;

    @OneToMany
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private List<User> members;

    @NotNull(message = "Tanggal berdiri wajib diisi")
    @PastOrPresent(message = "Tanggal berdiri tidak boleh di masa depan")
    private LocalDate establishedDate;

    @Size(max = 2000, message = "Visi misi terlalu panjang")
    private String visionMission;

    private String scope;
    private String field;

    @Column(length = 500)
    private String address;

    private String externalLink;
    private String membershipRequirement;
}