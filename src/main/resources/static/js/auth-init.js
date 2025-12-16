// File: auth-init.js (FINAL & FIXED)

const currentUserId = localStorage.getItem("CURRENT_USER_ID");
const isLoggedIn = currentUserId !== null;

// Logika 1: Menentukan tujuan link Logo/Struktura
function updateLogoLink() {
    const logoLink = document.getElementById('main-logo-link');
    if (logoLink) {
        logoLink.href = isLoggedIn ? "/dashboard" : "/";
    }
}

// Logika 2: Merender area Login/Logout (Memperbaiki link header yang mati)
function renderHeaderAuth() {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;

    if (isLoggedIn) {
        const userName = localStorage.getItem("CURRENT_USER_NAME") || "Akun Saya";

        // 🛑 PERUBAHAN KRITIS: Mengganti tombol Logout kaku dengan Dropdown
        authArea.innerHTML = `
            <div class="user-dropdown">
                <button class="dropdown-toggle" onclick="toggleDropdown(event)">
                    ${userName} 
                </button>
                <div class="dropdown-menu" id="userMenuDropdown">
                    <a href="#" onclick="handleProfileClick(event)">Profil Saya</a>
                    <a href="#" onclick="logout()">Logout</a> 
                </div>
            </div>
        `;
    } else {
        // 🛑 Link Login/Daftar di sini sudah pasti bekerja
        authArea.innerHTML = `
            <a href="/login">Login</a>
            <a href="/register" class="auth-register">Daftar</a>
        `;
    }
}

// 🛑 Fungsi baru untuk Dropdown (Tambahkan di auth-init.js)
function toggleDropdown(event) {
    event.stopPropagation();
    document.getElementById("userMenuDropdown").classList.toggle("show");
}

// 🛑 Fungsi untuk menangani klik Profil (Tambahkan di auth-init.js)
function handleProfileClick(event) {
    event.preventDefault();
    // Panggil fungsi loadProfilePage dari dashboard.js
    if (typeof loadProfilePage === 'function') {
        loadProfilePage(event);
    } else {
        // Fallback
        window.location.href = "/dashboard"; 
    }
    // Tutup dropdown setelah klik
    document.getElementById("userMenuDropdown").classList.remove("show");
}

// Tambahkan event listener untuk menutup dropdown saat klik di luar
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Logika 3: Redirect hanya jika mencoba mengakses DASHBOARD tanpa login
function checkDashboardAccess() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard') && !isLoggedIn) {
        window.location.href = "/login";
    }
}

// Fungsi universal untuk logout (dengan konfirmasi)
function logout() {
    if (confirm("Apakah Anda yakin ingin logout?")) {
        localStorage.clear();
        window.location.href = "/"; // Redirect ke home page
    }
}

// Inisialisasi pada pemuatan DOM
document.addEventListener('DOMContentLoaded', () => {
    updateLogoLink();
    renderHeaderAuth();
    checkDashboardAccess();
});