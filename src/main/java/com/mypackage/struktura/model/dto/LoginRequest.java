package com.mypackage.struktura.model.dto;
import lombok.*;
import jakarta.validation.constraints.*;

@Getter @Setter @NoArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email harus diisi")
    @Email(message = "Format email salah")
    private String email;

    @NotBlank(message = "Password harus diisi")
    private String password;
}
