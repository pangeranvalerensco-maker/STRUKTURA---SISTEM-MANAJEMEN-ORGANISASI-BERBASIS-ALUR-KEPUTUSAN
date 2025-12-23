package com.mypackage.struktura.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Memberitahu Spring bahwa kelas ini adalah sumber konfigurasi Bean sistem.
@EnableWebSecurity // Mengaktifkan fitur keamanan web dari Spring Security.
public class SecurityConfig {

    // Bean untuk Encoding Password, password user di simpan dalam bentuk hash di database
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // memnentukan aturan lalu lintas permintaan (request) HTTP
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // mematikan proteksi ini agar tidak terjadi error 403 saat mengirim data POST/PUT.
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Izinkan semua akses tanpa harus login lebih dulu
            );
        return http.build();
    }
}