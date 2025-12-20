package com.mypackage.struktura.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nama lengkap wajib diisi")
    @Size(min = 3, max = 100, message = "Nama minimal 3 karakter")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email wajib diisi")
    @Email(message = "Format email tidak valid")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Password wajib diisi")
    @Size(min = 6, message = "Password minimal 6 karakter")
    @Column(nullable = false)
    private String password;

    @NotNull(message = "Role wajib ditentukan")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(unique = true)
    private String memberNumber;

    private LocalDate joinDate;

    @NotNull(message = "Status anggota wajib ditentukan")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus memberStatus;

    @Column(length = 500)
    private String experienceSummary;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotNull(message = "Tanggal lahir wajib diisi")
    @Past(message = "Tanggal lahir harus di masa lalu")
    private LocalDate birthDate;

    private String applicationReason;

    private String position;
    
    private String revokeReason;
}