// File: auth-init.js (File baru untuk logic universal)

const currentUserId = localStorage.getItem("CURRENT_USER_ID");
const isLoggedIn = currentUserId !== null;

// Logika 1: Menentukan tujuan link Logo/Struktura
function updateLogoLink() {
    const logoLink = document.getElementById('main-logo-link');
    if (logoLink) {
        logoLink.href = isLoggedIn ? "/dashboard" : "/";
    }
}

// Logika 2: Merender area Login/Logout
function renderHeaderAuth() {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return; 

    if (isLoggedIn) {
        const userName = localStorage.getItem("CURRENT_USER_NAME") || "Akun Anda";
        authArea.innerHTML = `
            <span>Selamat datang, ${userName}</span>
            <button onclick="logout()">Logout</button> 
        `;
    } else {
        authArea.innerHTML = `
            <a href="/login">Login</a>
            <a href="/register" class="auth-register">Daftar</a>
        `;
    }
}

// Logika 3: Redirect hanya jika mencoba mengakses DASHBOARD tanpa login
function checkDashboardAccess() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/dashboard') && !isLoggedIn) {
        // HANYA redirect jika mencoba masuk ke /dashboard tanpa session
        window.location.href = "/login";
    }
}

// Fungsi universal untuk logout
function logout() {
    // ⬅️ TAMBAHKAN KONFIRMASI INI
    if (confirm("Apakah Anda yakin ingin logout?")) {
        localStorage.clear();
        window.location.href = "/"; // Redirect ke home page
    }
}
// ...

// Jalankan logika saat DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateLogoLink();
    renderHeaderAuth();
    checkDashboardAccess();
});