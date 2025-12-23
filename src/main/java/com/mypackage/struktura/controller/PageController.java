package com.mypackage.struktura.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller // Controller ini bertugas mencari dan menampilkan file .html untuk user.
public class PageController {

    @GetMapping("/") // ⬅️ Rute utama/awal
    public String homePage() {
        return "home"; // home.html
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login"; // login.html
    }

    @GetMapping("/register")
    public String RegisterPage(){
        return "register"; // register.html
    }

    @GetMapping("/struktura")
    public String dashboardPage() {
        return "dashboard"; // dashboard.html
    }
}
