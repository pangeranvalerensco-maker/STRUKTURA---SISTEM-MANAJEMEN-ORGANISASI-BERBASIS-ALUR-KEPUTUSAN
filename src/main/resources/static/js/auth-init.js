// --- 1. SESSION GUARD (Perbaikan) ---
const currentUserId = localStorage.getItem("CURRENT_USER_ID");
const isLoggedIn = currentUserId !== null;
const currentPath = window.location.pathname;

// Daftar halaman yang hanya boleh diakses setelah login
const protectedPaths = ['/struktura']; 
const isTryingProtected = protectedPaths.some(path => currentPath.startsWith(path));

// LOGIKA BARU:
if (isLoggedIn && (currentPath === '/login' || currentPath === '/register')) {
    // Jika sudah login tapi buka Login/Regis, tendang ke Dashboard
    window.location.replace("/struktura");
} else if (!isLoggedIn && isTryingProtected) {
    // Jika BELUM login, kita izinkan masuk ke /struktura (sebagai Tamu)
    // Tapi kita tambahkan penanda di GLOBAL_USER agar struktura.js tahu ini Tamu
    console.log("Akses sebagai Tamu diizinkan");
}

// --- 2. HEADER & UI LOGIC ---

function updateLogoLink() {
    const logoLink = document.getElementById('main-logo-link');
    if (logoLink) {
        logoLink.href = isLoggedIn ? "/struktura" : "/";
    }
}

function renderHeaderAuth() {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;

    if (isLoggedIn) {
        const userName = localStorage.getItem("CURRENT_USER_NAME") || "Akun Saya";
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
        authArea.innerHTML = `
            <a href="/login">Login</a>
            <a href="/register" class="auth-register">Daftar</a>
        `;
    }
}

function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("userMenuDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}

function handleProfileClick(event) {
    event.preventDefault();
    if (typeof loadProfilePage === 'function') {
        loadProfilePage(event);
    } else {
        window.location.href = "/struktura#profile"; 
    }
    const dropdown = document.getElementById("userMenuDropdown");
    if (dropdown) dropdown.classList.remove("show");
}

// Tutup dropdown saat klik di luar
window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropdown-toggle')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let d of dropdowns) {
            if (d.classList.contains('show')) d.classList.remove('show');
        }
    }
});

// --- 3. UTILITIES (Toast, Confirm, Logout) ---

function customConfirm(message, onConfirm) {
    const modalHtml = `
        <div id="customConfirmOverlay" class="confirm-overlay">
            <div class="confirm-box">
                <h4>Konfirmasi</h4>
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button id="btnConfirmYes" class="btn-primary">Ya, Lanjutkan</button>
                    <button id="btnConfirmNo" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('btnConfirmNo').onclick = () => document.getElementById('customConfirmOverlay').remove();
    document.getElementById('btnConfirmYes').onclick = () => {
        document.getElementById('customConfirmOverlay').remove();
        if (onConfirm) onConfirm();
    };
}


function logout() {
    customConfirm("Apakah Anda yakin ingin keluar?", () => {
        showToast("Logout berhasil...", "default");
        localStorage.clear();
        setTimeout(() => {
            window.location.replace("/login");
        }, 500);
    });
}

function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toastElement = document.createElement('div');
    toastElement.className = `toast toast-${type}`;
    toastElement.textContent = message;

    container.appendChild(toastElement);
    setTimeout(() => toastElement.classList.add('show'), 10);
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 500);
    }, duration);
}
// Inisialisasi DOM
document.addEventListener('DOMContentLoaded', () => {
    updateLogoLink();
    renderHeaderAuth();
});