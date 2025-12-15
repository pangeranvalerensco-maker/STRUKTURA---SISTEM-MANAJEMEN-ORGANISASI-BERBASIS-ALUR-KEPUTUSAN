package com.mypackage.struktura.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
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
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "dashboard"; // dashboard.html
    }
}
