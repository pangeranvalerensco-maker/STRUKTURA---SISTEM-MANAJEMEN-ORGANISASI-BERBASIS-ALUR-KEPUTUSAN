package com.mypackage.struktura.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice // Setiap kali ada error di Controller, akan cek ini dulu agar format pesan error-nya rapi (JSON) dan mudah dibaca oleh JavaScript.
public class GlobalExceptionHandler {

    // Menangkap error validasi (@NotBlank, @Size, @Email, dsb)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // Menangkap error logic umum (throw new RuntimeException) Contoh: "Email sudah terdaftar"
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeExceptions(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage()); // Mengambil pesan error manual dari kodingan Java
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}