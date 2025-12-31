// #########################################################################
// ### [01] GLOBAL STATE & VARIABLES                                     ###
// #########################################################################
// Menampung data session, cache data, dan status aplikasi saat ini.

let currentPage = 0; // Untuk Pimpinan: Anggota Aktif
let currentSortBy = 'name';
let currentSortDirection = 'ASC';
let currentKeyword = '';

let orgCurrentPage = 0; // Untuk Semua Role: Daftar Organisasi
let orgCurrentKeyword = '';
let orgCurrentSortBy = 'name';
let orgCurrentSortDirection = 'ASC';

const userId = localStorage.getItem("CURRENT_USER_ID");
let GLOBAL_USER = {}; //  VARIABEL GLOBAL USER LENGKAP
let CURRENT_ORG_MEMBERS = [];
let CURRENT_ACTIVE_MEMBERS = []; // Variabel global baru untuk menampung data anggota

// variabel global di bagian atas dashboard.js
let LAST_PAGE_BEFORE_PROFILE = 'dashboard';

let currentOrgIdToAssign = null; // Variabel global untuk Modal
let CACHED_PROKERS = []; // Tempat menyimpan data proker agar bisa di-sort tanpa fetch ulang

// #########################################################################
// ### [02] CORE INITIALIZATION                                          ###
// #########################################################################
// Logika pemuatan awal (DOMContentLoaded) dan sinkronisasi session.

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.container');
    const userId = localStorage.getItem("CURRENT_USER_ID");

    mainContainer.innerHTML = `
        <div class="dashboard-grid" id="dashboardGrid">
            <div class="main-content" id="main-content-area"><h3>Memuat data...</h3></div>
            <div class="side-info" id="side-info-area"></div>
        </div>
        <div id="dynamic-footer-area"></div>
    `;

    const renderFooter = () => {
        const footerArea = document.getElementById('dynamic-footer-area');
        if (footerArea) {
            footerArea.innerHTML = `
                <hr style="margin-top: 50px; border: 0; border-top: 1px solid #eee;">
                <div style="text-align: center; padding: 20px; color: #718096; font-size: 0.85rem;">
                    &copy; 2025 Struktura - Developed by <b>Pangeran Valerensco Rivaldi Hutabarat</b>
                </div>`;
        }
    };

    const grid = document.getElementById('dashboardGrid');
    const sideInfo = document.getElementById('side-info-area');

    if (!userId) {
        GLOBAL_USER = { role: 'GUEST', memberStatus: 'NON_MEMBER' };
        const grid = document.getElementById('dashboardGrid');
        if (grid) grid.style.gridTemplateColumns = '1fr'; // Tampilan Full Width

        const sideInfo = document.getElementById('side-info-area');
        if (sideInfo) sideInfo.style.display = 'none';

        loadOrganizationListDashboard(null, GLOBAL_USER);
        renderFooter();
        return; 
    }

    // 1. Ambil data user lengkap
    fetch(`/api/users/${userId}`)
        .then(res => {
            if (!res.ok) { logout(); throw new Error("User not found"); }
            return res.json();
        })
        .then(user => {
            GLOBAL_USER = user; //  SIMPAN DATA LENGKAP DI GLOBAL
            renderSidebar(user);

            // Simpan status dan email yang benar ke localStorage
            localStorage.setItem("CURRENT_USER_STATUS", user.memberStatus);
            localStorage.setItem("CURRENT_USER_NAME", user.name);
            localStorage.setItem("CURRENT_USER_EMAIL", user.email); //  FIX: Email tersimpan!

            renderSidebar(user); // Render sidebar dengan data user
            // LOGIKA REFRESH: Cek hash di URL
            const currentHash = window.location.hash;

            if (currentHash === '#about') {
                loadAboutPage();
            } else if (currentHash === '#help') {
                loadHelpPage();
            } else if (currentHash === '#profile') {
                loadProfilePage(null);
            } else if (currentHash === '#proker' && user.memberStatus === 'ACTIVE') {
                loadProkerPage(null);
            } else if (currentHash === '#notifications') { 
                loadNotificationPage();
            } else if (currentHash === '#orgList' || currentHash === '#org-list') {
                loadOrgListPage(null, user);
            } else if (currentHash === '#kelola-org' && user.role === 'PIMPINAN' && user.organization) {
                loadEditOrganizationPage();
            } else if (currentHash === '#kelola' && user.role === 'PIMPINAN' && user.organization) {
                loadPimpinanDashboard(user);
            } else if (currentHash.startsWith('#organization-')) {
                const orgId = currentHash.split('-')[1];
                loadOrganizationProfile(orgId);
            } else if (currentHash.startsWith('#user-')) {
                const targetUserId = currentHash.split('-')[1];
                loadUserProfile(targetUserId, null);
            } else if (currentHash === '#create-org') {
                if (GLOBAL_USER.role !== 'ADMIN' && (GLOBAL_USER.memberStatus === 'NON_MEMBER' || !GLOBAL_USER.organization)) {
                    loadCreateOrganizationPage();
                } else {
                    showToast("Anda sudah terdaftar di organisasi!", "error");
                    loadDefaultLanding(null, GLOBAL_USER);
                }
            } else if (currentHash === '#handover') {
                if (user.role === 'PIMPINAN' && user.organization) {
                    loadHandoverPage();
                } else {
                    loadDefaultLanding(null, user);
                }
            } else {
                updatePageTitle("Dashboard Utama");
                loadDefaultLanding(null, user);
            }
        })
        .catch(err => {
            document.getElementById("main-content-area").innerHTML =
                `<p class="text-error">Gagal memuat data. ${err.message}. Silakan <a href="#" onclick="logout()">Login ulang</a>.</p>`;
        });

});

// 1. Dashboard Utama (Status Keanggotaan di Semua Org)
function loadUserStatusSummary(user) {
    const container = document.getElementById('main-content-area');
    container.innerHTML = `
        <h3>Selamat Datang di Struktura!</h3>
        <p>Aplikasi ini membantu Anda mengelola keanggotaan dan struktur organisasi.</p>
        <hr>
        
        <h4>Ringkasan Status Keanggotaan Anda</h4>
        ${user.organization ?
            `<div class="card-section">
                <h5>${user.organization.name}</h5>
                <p>Status: <b>${user.memberStatus}</b></p>
                <p>${user.memberStatus === 'PENDING' ?
                'Permintaan gabung Anda sedang diproses oleh pimpinan.' :
                user.memberStatus === 'ACTIVE' ?
                    'Anda adalah anggota aktif organisasi ini.' :
                    'Status tidak terdeteksi.'
            }</p>
             </div>`
            :
            `<p>Anda belum terdaftar di organisasi manapun. Silakan lihat <a href="#" onclick="loadOrgListPage(event, GLOBAL_USER)">Daftar Organisasi</a>.</p>`
        }
        
        `;
}

// Cek notifikasi setiap 30 detik secara otomatis
setInterval(() => {
    if (GLOBAL_USER && GLOBAL_USER.id) {
        fetchUnreadNotifCount();
    }
}, 30000);

// #########################################################################
// ### [03] NAVIGATION & ROUTING SYSTEM                                  ###
// #########################################################################
// Menangani Single Page Application (SPA) routing via Hash (#).

// --- Navigation System ---
function navigateTo(section, callback, event) {
    if (event) event.preventDefault();

    // Mengubah URL tanpa reload, misal: /dashboard menjadi /dashboard#profile
    history.pushState({ section: section }, "", `/struktura#${section}`);

    if (callback) callback();
}


function renderSectionByHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const isGuest = !localStorage.getItem("CURRENT_USER_ID");

    //  PROTEKSI: Daftar halaman yang dilarang untuk tamu
    const restricted = ['proker', 'kelola', 'notifications', 'handover', 'create-org', 'kelola-org'];
    if (isGuest && restricted.includes(hash)) {
        window.location.hash = '#orgList';
        showToast("Akses ditolak. Silakan login terlebih dahulu.", "error");
        return;
    }

    // Pastikan data user sudah ada sebelum merender halaman default
    if (!GLOBAL_USER || !GLOBAL_USER.id) {
        console.warn("Menunggu data user dimuat...");
        return;
    }

    switch (hash) {
        case 'about':
            loadAboutPage();
            break;
        case 'help':
            loadHelpPage();
            break;
        case 'notifications':
            loadNotificationPage(0);
            break;
        case 'dashboard':
        case 'orgList':
            loadOrganizationListDashboard(null, GLOBAL_USER);
            break;
        default:
            // Kirim GLOBAL_USER agar tidak error "undefined" di baris 391
            loadDefaultLanding(null, GLOBAL_USER);
            break;
    }
}

// Listener untuk mendeteksi perubahan URL (misal: #about, #help)
window.addEventListener('hashchange', renderSectionByHash);

window.onpopstate = function (event) {
    // Pastikan user masih login sebelum memuat konten
    if (!localStorage.getItem("CURRENT_USER_ID")) {
        window.location.replace("/login");
        return;
    }

    const section = (event.state && event.state.section) ? event.state.section : 'dashboard';

    // Aksi berdasarkan riwayat
    if (section === 'create-org') loadCreateOrganizationPage();
    else if (section === 'kelola-org') loadEditOrganizationPage();
    else if (section === 'handover') loadHandoverPage();
    else if (section === 'orgList') loadOrgListPage(null, GLOBAL_USER);
    else if (section === 'notifications') loadNotificationPage();
    else if (section === 'proker') loadProkerPage(null);
    else if (section === 'kelola') loadPimpinanDashboard(GLOBAL_USER);
    else if (section === 'profile') loadProfilePage(null);
    else loadDefaultLanding(null, GLOBAL_USER);
};

// Fungsi kembali cerdas
function goBackFromProfile() {
    const mainContainer = document.querySelector('.container');
    //  KUNCI: Pastikan grid dashboard selalu dibuat ulang sebelum konten dimuat
    mainContainer.innerHTML = `
        <div class="dashboard-grid" id="dashboardGrid">
            <div class="main-content" id="main-content-area"></div>
            <div class="side-info" id="side-info-area"></div>
        </div>
    `;

    //  LOGIKA DINAMIS BERDASARKAN LAST_PAGE_BEFORE_PROFILE
    if (LAST_PAGE_BEFORE_PROFILE === 'kelola') {
        history.pushState({ section: 'kelola' }, "", "#kelola");
        loadPimpinanDashboard(GLOBAL_USER);
    } else if (LAST_PAGE_BEFORE_PROFILE === 'org-detail') {
        // Jika dari profil organisasi, ambil ID organisasi yang sedang aktif
        const orgId = (GLOBAL_USER.organization) ? GLOBAL_USER.organization.id : null;
        if (orgId) {
            loadOrganizationProfile(orgId);
        } else {
            loadDefaultLanding(null, GLOBAL_USER);
        }
    } else if (LAST_PAGE_BEFORE_PROFILE === 'proker') {
        loadProkerPage(null);
    } else if (LAST_PAGE_BEFORE_PROFILE === 'orgList' || LAST_PAGE_BEFORE_PROFILE === 'org-list') {
        history.pushState({ section: 'orgList' }, "", "#orgList");
        loadOrgListPage(null, GLOBAL_USER);
    } else {
        history.pushState({ section: 'dashboard' }, "", "#dashboard");
        loadDefaultLanding(null, GLOBAL_USER);
    }
}

// Fungsi untuk merubah Page Title secara dinamis
function updatePageTitle(pageName) {
    const baseTitle = "Struktura";
    document.title = `${pageName} | ${baseTitle}`;
}


function loadDefaultLanding(event, user) {
    preventDefault(event);

    const sideInfo = document.getElementById("side-info-area");
    const dashboardGrid = document.querySelector(".dashboard-grid");

    if (sideInfo) sideInfo.style.display = 'block';
    if (dashboardGrid) dashboardGrid.style.gridTemplateColumns = '1fr 300px'; // Sesuaikan dengan lebar CSS Anda

    const container = document.getElementById("main-content-area");

    // Jika status REVOKED, tampilkan informasi pencabutan TAPI jangan kunci aplikasi
    if (user.memberStatus === 'REVOKED') {
        container.innerHTML = `
            <div class="revoked-banner">
                <div class="revoked-icon">🚫</div>
                <h2 style="color: #c53030;">Informasi Keanggotaan</h2>
                <hr>
                <p>Status Anda di organisasi sebelumnya telah <b>Dicabut</b>.</p>
                <div class="reason-box">
                    <strong>Alasan dari Pimpinan:</strong><br>
                    "${user.revokeReason || 'Tidak disebutkan.'}"
                </div>
                <p>Anda saat ini berstatus bebas. Anda bisa mencari organisasi baru melalui menu di bawah ini.</p>
                <button onclick="resetToNonMember(${user.id})" class="btn-primary">Cari Organisasi Baru</button>
            </div>
        `;
        return;
    }

    // Alur role normal (Admin, Pimpinan, Anggota)
    if (user.role === "ADMIN") {
        loadAdminDashboard(user);
    } else if (user.role === "PIMPINAN") {
        loadPimpinanDashboard(user);
    } else {
        loadUserStatusSummary(user);
    }
}

// #########################################################################
// ### [04] SHARED UI COMPONENTS & HELPERS                               ###
// #########################################################################
// Fungsi pembantu umum (Toast, Confirmation, API Helper, Sidebar).

// Fungsi pembantu untuk membuka profil dengan mencatat asal halaman
function viewMemberProfile(userId, fromPage) {
    // 1. Cek dan tutup modal detail proker jika sedang terbuka
    const modalProker = document.getElementById('prokerDetailModal');
    if (modalProker) {
        modalProker.remove();
    }

    // 2. Simpan asal halaman dan muat profil
    LAST_PAGE_BEFORE_PROFILE = fromPage;
    loadUserProfile(userId);
}

function loadUserProfile(userId, event) {
    if (event) event.preventDefault();

    history.pushState({ section: 'user-' + userId }, '', `/struktura#user-${userId}`);

    const container = document.getElementById('main-content-area');

    fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            updatePageTitle(`Profil ${user.name}`);
            const genderIndo = user.gender === 'MALE' ? 'Laki-laki' :
                user.gender === 'FEMALE' ? 'Perempuan' : '-';

            container.innerHTML = `
                <div class="user-profile-card">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <h2>${user.name}</h2>
                    <p class="user-role-badge">${user.role}</p>
                    <hr>
                    <div class="user-info-grid">
                        <div class="info-item"><label>No Anggota</label><span>${user.memberNumber || 'Belum Ada'}</span></div>
                        <div class="info-item"><label>Jabatan</label><span>${user.position || 'Anggota'}</span></div>
                        <div class="info-item"><label>Organisasi</label><span>${user.organization ? user.organization.name : 'Tidak Terikat'}</span></div>
                        <div class="info-item"><label>Email</label><span>${user.email}</span></div>
                        <div class="info-item"><label>Jenis Kelamin</label><span>${genderIndo}</span></div>
                        <div class="info-item"><label>Status</label><span class="badge status-active">ACTIVE</span></div>
                    </div>
                    <div class="experience-section">
                        <h4>Ringkasan Pengalaman Organisasi</h4>
                        <p>${user.experienceSummary || 'Belum ada data pengalaman yang diisi.'}</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="goBackFromProfile()" class="btn-secondary">Kembali</button>
                    </div>
                </div>
            `;
        })
        .catch(err => showToast("Gagal memuat profil: " + err.message, "error"));
}

function preventDefault(event) {
    // Fungsi universal untuk mencegah refresh halaman
    if (event) {
        event.preventDefault();
    }
}

// Fungsi utilitas untuk mengubah YYYY-MM-DD menjadi format Indonesia
function formatIndoDate(dateString) {
    if (!dateString || dateString === 'N/A' || dateString === '-') return '-';

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Balikkan string asli jika bukan tanggal valid

    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function renderSidebar(user) {
    const sideInfoArea = document.getElementById("side-info-area");
    const orgName = user.organization ? user.organization.name : 'Belum Ada';
    const hasOrg = user.organization !== null;

    sideInfoArea.innerHTML = `
        <div class="card-section">
            <h4>Informasi Akun</h4>
            <p>Nama: <b>${user.name}</b></p>
            <p>Role: <b>${user.role}</b></p>
            <p>Organisasi: <b>${orgName}</b></p>
            <p>Status: <b>${user.memberStatus}</b></p>
        </div>
        
        <div class="card-section" style="margin-top: 20px;">
        <h4>Menu Utama</h4>
        <ul id="main-menu" class="side-menu-list">
            <li><a href="#" onclick="navigateTo('dashboard', () => loadDefaultLanding(null, GLOBAL_USER), event)">Dashboard Utama</a></li>
            <li><a href="#" onclick="navigateTo('orgList', () => loadOrgListPage(null, GLOBAL_USER), event)">Daftar Organisasi</a></li> 
            ${hasOrg ? `<li><a href="#" onclick="LAST_PAGE_BEFORE_PROFILE = 'dashboard'; loadOrganizationProfile(${user.organization.id}, event)">Organisasi Saya</a></li>` : ''}
            <li>
                <a href="#" onclick="navigateTo('notifications', () => loadNotificationPage(), event)">
                    Pemberitahuan <span id="notifBadge" class="badge-notif" style="display:none;">0</span>
                </a>
            </li>
            ${user.memberStatus === "ACTIVE" && GLOBAL_USER.role !== 'ADMIN' ?
            `<li><a href="#" onclick="navigateTo('proker', () => loadProkerPage(null), event)">Program Kerja</a></li>` : ''
        }
        </ul>
    </div>
    `;

    const mainMenu = document.getElementById("main-menu");

    if (user.role === "PIMPINAN" && hasOrg) {
        mainMenu.innerHTML += `
                                <li>
                                    <a href="#" onclick="LAST_PAGE_BEFORE_PROFILE = window.location.hash.replace('#',''); navigateTo('kelola-org', () => loadEditOrganizationPage(), event)">
                                        Kelola Organisasi
                                    </a>
                                </li>
                                <li><a href="#" onclick="navigateTo('kelola', () => loadPimpinanDashboard(GLOBAL_USER), event)">Kelola Anggota</a></li>
                            `;
    }

    fetchUnreadNotifCount();
}

function extractBidangFromPosition(position) {
    if (!position || position === "Anggota") return "Umum";
    const p = position.toLowerCase();

    // Cari kata kunci pemisah (Divisi, Bidang, atau Bagian)
    const keywords = ["divisi ", "bidang ", "bagian "];
    for (let kw of keywords) {
        if (p.includes(kw)) {
            // Mengambil kata setelah "divisi/bidang/bagian"
            const parts = position.split(new RegExp(kw, "i"));
            return parts[1] ? parts[1].trim() : "Umum";
        }
    }
    return "Umum"; // Jika jabatan seperti "Ketua" tanpa nama bidang
}

// #########################################################################
// ### [05] USER PROFILE MODULE                                          ###
// #########################################################################
// Manajemen akun pengguna, edit profil, dan keamanan (Password).

function loadProfilePage(event) {
    if (event) event.preventDefault();
    updatePageTitle("Profil Saya");
    const user = GLOBAL_USER;

    history.pushState({ section: 'profile' }, "Profil Saya", "#profile");
    const container = document.getElementById('main-content-area');
    const birthDateFormatted = formatIndoDate(user.birthDate);

    const hasOrg = user.organization !== null;
    let dangerZoneAction = '';

    //  LOGIKA TOMBOL DINAMIS
    let deleteBtnAttr = hasOrg ? 'disabled title="Keluar organisasi dahulu sebelum hapus akun" style="opacity:0.5; cursor:not-allowed;"' : 'onclick="confirmDeleteAccount()"';
    let resignBtn = hasOrg ? `<button onclick="openResignModal()" class="btn-danger-outline">Mengundurkan Diri</button>` : '';

    container.innerHTML = `
        <h3>Profil Saya</h3>
        <p>Lihat dan kelola informasi akun Anda di sini.</p>
        <hr>
        <div class="card-section profile-details">
            <table class="data-table">
                <tr><th>Nama</th><td>${user.name || '-'}</td></tr>
                <tr><th>Tanggal Lahir</th><td>${birthDateFormatted || '-'}</td></tr>
                <tr><th>Email</th><td>${user.email || '-'}</td></tr>
                <tr><th>Role</th><td><b>${user.role}</b></td></tr>
                <tr><th>Status</th><td>${user.memberStatus}</td></tr>
                <tr><th>Jabatan</th><td>${user.position || '-'}</td></tr>
                <tr><th>No. Anggota</th><td>${user.memberNumber || '-'}</td></tr>
                <tr><th>Organisasi</th><td>${user.organization ? user.organization.name : '-'}</td></tr>
                <tr><th>Jenis Kelamin</th><td>${user.gender === 'MALE' ? 'Laki-laki' : user.gender === 'FEMALE' ? 'Perempuan' : '-'}</td></tr>
                <tr><th>Pengalaman</th><td>${user.experienceSummary || '-'}</td></tr>
            </table>
            <div class="danger-zone" style="margin-top:30px; border-top:1px solid #eee; padding-top:20px;">
                <h4 style="color:red;">Manajemen Akun</h4>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button onclick="loadEditProfileForm(GLOBAL_USER)" class="btn-primary">Edit Profil</button>
                    ${resignBtn}
                    <button ${deleteBtnAttr} class="btn-danger-outline">Hapus Akun</button>
                    <button onclick="openChangePasswordModal()" class="btn-secondary" style="background: #4a5568; color: white;">
                        🔒 Ganti Password Akun
                    </button>
                    </div>
            </div>
        </div>
    `;
}

function loadEditProfileForm(user) {
    const container = document.getElementById('main-content-area');

    // Format tanggal untuk input type="date" (YYYY-MM-DD)
    const birthDateValue = user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '';

    container.innerHTML = `
        <h3>Edit Profil</h3>
        <p>Perbarui data diri Anda.</p>
        <hr>

        <form id="editProfileForm">
            <div>
                <label for="editName">Nama Lengkap</label>
                <input type="text" id="editName" value="${user.name}" required>
            </div>
            
            <div>
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" value="${user.email}" required>
            </div>
            
            <div>
                <label for="editGender">Jenis Kelamin</label>
                <select id="editGender">
                    <option value="">-- Pilih --</option>
                    <option value="MALE" ${user.gender === 'MALE' ? 'selected' : ''}>Laki-laki</option> 
                    <option value="FEMALE" ${user.gender === 'FEMALE' ? 'selected' : ''}>Perempuan</option> 
                </select>
            </div>

            <div>
                <label for="editBirthDate">Tanggal Lahir</label>
                <input type="date" id="editBirthDate" max="9999-12-31" value="${birthDateValue}">
            </div>
            
            <div style="grid-column: span 2;">
                <label for="editExperienceSummary">Ringkasan Pengalaman Organisasi</label>
                <textarea id="editExperienceSummary" rows="4" maxlength="255" placeholder="Maksimal 255 karakter...">${user.experienceSummary || ''}</textarea>
                <small id="charCount" style="color: #666;">Batas: 255 karakter</small>
            </div>

            <p id="editMessage"></p> 

            <div style="grid-column: span 2;">
                <button type="submit" class="btn-primary">Simpan Perubahan</button>
                <button type="button" onclick="loadProfilePage(null)">Batal</button>
            </div>
        </form>
    `;

    // Pasang Event Listener untuk submit form
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
}

function handleEditProfile(event) {
    event.preventDefault();

    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const gender = document.getElementById('editGender').value;
    const birthDate = document.getElementById('editBirthDate').value;
    const experienceSummary = document.getElementById('editExperienceSummary').value;

    // 1. Validasi: Cek jika jenis kelamin belum dipilih
    if (!gender || gender === "") {
        showNotification("Gagal: Silakan pilih Jenis Kelamin terlebih dahulu!", "error");
        return; // Berhenti di sini, jangan kirim data ke server
    }

    const messageElement = document.getElementById('editMessage');
    const userId = localStorage.getItem("CURRENT_USER_ID");

    messageElement.innerText = "Menyimpan data...";
    messageElement.style.color = "black";

    fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            email: email,
            gender: gender,
            birthDate: birthDate,
            experienceSummary: experienceSummary
        })
    })
        .then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Gagal menyimpan data.");
            }
            return res.json();
        })
        .then(updatedUser => {
            // UPDATE GLOBAL_USER dan localStorage setelah berhasil
            GLOBAL_USER = updatedUser;
            localStorage.setItem("CURRENT_USER_NAME", updatedUser.name);

            messageElement.style.color = "green";
            messageElement.innerText = "Data berhasil diperbarui! Memuat ulang...";

            // Muat ulang tampilan profil setelah sukses
            setTimeout(() => loadProfilePage(null), 1500);
        })
        .catch(err => {
            messageElement.style.color = "red";

            //  Logika filter pesan error agar rapi (User Friendly)
            if (err.message.includes("Data truncation") || err.message.includes("too long")) {
                messageElement.innerText = "⚠️ Gagal menyimpan: Teks Ringkasan Pengalaman terlalu panjang! (Maksimal 255 karakter).";
            } else {
                messageElement.innerText = `[Error]: ${err.message}`;
            }
        });
}

function openChangePasswordModal() {
    const modalHtml = `
        <div id="changePasswordModal" class="confirm-overlay">
            <div class="confirm-box" style="width: 400px;">
                <h4>Ganti Password</h4>
                <div style="text-align: left; margin-top: 15px;">
                    <label>Password Lama:</label>
                    <input type="password" id="oldPassword" class="form-input" style="width:100%; margin-bottom:10px;">
                    <label>Password Baru:</label>
                    <input type="password" id="newPassword" class="form-input" style="width:100%; margin-bottom:10px;">
                    <label>Konfirmasi Password Baru:</label>
                    <input type="password" id="confirmNewPassword" class="form-input" style="width:100%;">
                </div>
                <div class="confirm-buttons" style="margin-top: 20px;">
                    <button onclick="submitChangePassword()" class="btn-primary">Simpan Password</button>
                    <button onclick="document.getElementById('changePasswordModal').remove()" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}


function submitChangePassword() {
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;

    if (newPass !== confirmPass) {
        return showToast("Konfirmasi password baru tidak cocok!", "error");
    }

    if (newPass.length < 6) {
        return showToast("Password baru minimal 6 karakter!", "error");
    }

    const userId = localStorage.getItem("CURRENT_USER_ID");

    fetch(`/api/users/${userId}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            oldPassword: oldPass,
            newPassword: newPass
        })
    })
        .then(async res => {
            if (res.ok) {
                showToast("Password berhasil diperbarui!", "success");
                document.getElementById('changePasswordModal').remove();
            } else {
                const err = await res.text();
                showToast(err || "Gagal ganti password", "error");
            }
        })
        .catch(err => showToast("Terjadi kesalahan sistem", "error"));
}

function confirmDeleteAccount() {
    customConfirm("⚠️ PERINGATAN: Menghapus akun akan menghilangkan seluruh data Anda secara permanen. Lanjutkan?", () => {
        fetch(`/api/users/${GLOBAL_USER.id}`, {
            method: 'DELETE' 
        })
            .then(async res => {
                if (res.ok) {
                    showToast("Akun berhasil dihapus. Sampai jumpa!", "success");
                    setTimeout(() => {
                        localStorage.removeItem('CURRENT_USER_ID');
                        window.location.hash = '';
                        location.reload();
                    }, 3000);
                } else {
                    const errorMsg = await res.text();
                    showToast("Gagal: " + errorMsg, "error");
                }
            })
            .catch(err => {
                console.error("Delete error:", err);
                showToast("Terjadi kesalahan koneksi ke server.", "error");
            });
    });
}

function openResignModal() {
    const modalHtml = `
        <div id="resignModal" class="confirm-overlay">
            <div class="confirm-box" style="width: 450px;">
                <h4 style="color: #d9534f;">Pengajuan Pengunduran Diri</h4>
                <p>Berikan alasan Anda mengundurkan diri dari <b>${GLOBAL_USER.organization.name}</b>:</p>
                <textarea id="resignReasonInput" rows="4" 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;"
                    placeholder="Contoh: Fokus studi, pindah domisili, dll..."></textarea>
                <div class="confirm-buttons">
                    <button onclick="submitResignation()" class="btn-danger">Kirim Pengajuan</button>
                    <button onclick="document.getElementById('resignModal').remove()" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitResignation() {
    const reason = document.getElementById('resignReasonInput').value;
    if (!reason.trim()) {
        showToast("Alasan wajib diisi!", "error");
        return;
    }

    // Mengirim permintaan ke backend
    fetch(`/api/users/${GLOBAL_USER.id}/request-resign?reason=${encodeURIComponent(reason)}`, { method: 'POST' })
        .then(res => {
            if (res.ok) {
                showToast("Pengajuan terkirim. Menunggu persetujuan pimpinan.", "success");
                document.getElementById('resignModal').remove();
                location.reload();
            }
        })
        .catch(err => showToast(err.message, "error"));
}

function resetToNonMember(userId) {
    fetch(`/api/users/${userId}/reset-status`, { method: 'PUT' })
        .then(res => res.json())
        .then(updatedUser => {
            GLOBAL_USER = updatedUser;
            showToast("Status berhasil diperbarui. Silakan pilih organisasi baru.", "success");
            loadOrgListPage(null, GLOBAL_USER);
        })
        .catch(err => showToast(err.message, "error"));
}

// #########################################################################
// ### [06] ORGANIZATION MODULE (PUBLIC & JOIN)                          ###
// #########################################################################
// Daftar organisasi, profil publik organisasi, dan alur pendaftaran anggota.

// 3. Daftar Organisasi (Dipanggil dari Sidebar)
function loadOrgListPage(event, user) {
    preventDefault(event);
    updatePageTitle("Daftar Organisasi");

    LAST_PAGE_BEFORE_PROFILE = 'org-list';

    history.pushState({ section: 'orgList' }, "Daftar Organisasi", "#org-list");
    loadOrganizationListDashboard(event, user);
}


async function loadOrganizationListDashboard(event, user) {
    if (event) preventDefault(event);
    const container = document.getElementById('main-content-area');
    const isGuest = user.role === 'GUEST';
    LAST_PAGE_BEFORE_PROFILE = 'org-list';

    const canCreateOrg = user.memberStatus === 'NON_MEMBER' || !user.organization;

    // Ambil data bidang secara dinamis dari database
    let fieldOptions = "";
    try {
        const res = await fetch('/api/organizations');
        const allOrgs = await res.json();
        const uniqueFields = [...new Set(allOrgs.map(o => o.field).filter(f => f))].sort();
        fieldOptions = uniqueFields.map(f => `<option value="${f}">${f}</option>`).join('');
    } catch (err) {
        console.error("Gagal memuat bidang:", err);
    }

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>Daftar Organisasi Aktif</h3>
            ${!isGuest && canCreateOrg ? `<button onclick="loadCreateOrganizationPage()" class="btn-success">+ Daftarkan Organisasi Baru</button>` : ''}
        </div>
        <p>Lihat organisasi yang tersedia atau buat organisasi Anda sendiri. Status Anda: <b>${user.memberStatus}</b>.</p>
        <hr>

        <div class="search-sort-controls" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <input type="text" id="orgKeywordSearch" placeholder="Cari Nama Organisasi..." style="flex: 1; min-width: 200px;">
            
            <select id="orgFilterField" onchange="handleOrgListSortAndSearch(null)">
                <option value="">Semua Bidang</option>
                ${fieldOptions}
                <option value="Umum">Umum/Lainnya</option>
            </select>

            <select id="orgSortDirection" onchange="handleOrgListSortAndSearch(null, null, this.value)">
                <option value="ASC">Urutkan Nama A-Z</option>
                <option value="DESC">Urutkan Nama Z-A</option>
            </select>
            
            <button onclick="handleOrgListSortAndSearch(document.getElementById('orgKeywordSearch').value)" class="btn-primary">Cari</button>
        </div>

        <table id="organizationList" class="data-table">
            <thead>
                <tr>
                    <th>Nama Organisasi</th>
                    <th>Bidang</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody><tr><td colspan="4">Memuat...</td></tr></tbody>
        </table>
        <div id="orgPaginationControls" style="margin-top: 10px; text-align: center;"></div>
    `;

    loadOrgList(user);
}

function loadOrgList(user) {
    // 1. Ambil keyword mentah (jangan di-encode untuk filter JS)
    const rawKeyword = orgCurrentKeyword.toLowerCase();
    const fieldSelect = document.getElementById('orgFilterField');
    const fieldFilter = fieldSelect ? fieldSelect.value : "";
    const pageSize = 10;

    // 2. Ambil elemen tableBody di awal agar bisa menampilkan status "Memuat..."
    const tableBody = document.querySelector("#organizationList tbody");
    const paginationArea = document.getElementById('orgPaginationControls');

    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Memuat data...</td></tr>`;

    // 3. Gunakan endpoint asli Anda (tanpa /search jika ingin filter di JS)
    fetch('/api/organizations')
        .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil data dari server.");
            return res.json();
        })
        .then(organizations => {
            // 4. FILTERING (Logika Asli Anda)
            let result = organizations.filter(o => {
                const matchStatus = o.status === "ACTIVE";
                const matchKeyword = o.name.toLowerCase().includes(rawKeyword) ||
                    (o.description && o.description.toLowerCase().includes(rawKeyword));
                const matchField = fieldFilter === "" || o.field === fieldFilter;

                return matchStatus && matchKeyword && matchField;
            });

            // 5. SORTING (Default A-Z)
            if (orgCurrentSortDirection === 'ASC') {
                result.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                result.sort((a, b) => b.name.localeCompare(a.name));
            }

            // 6. LOGIKA PAGINASI (Memotong array menjadi 20 data)
            const totalPages = Math.ceil(result.length / pageSize);
            const start = orgCurrentPage * pageSize;
            const paginated = result.slice(start, start + pageSize);

            tableBody.innerHTML = '';

            if (paginated.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Organisasi tidak ditemukan.</td></tr>`;
                if (paginationArea) paginationArea.innerHTML = '';
                return;
            }

            paginated.forEach(org => {
                const isMemberOfThisOrg = GLOBAL_USER?.organization?.id === org.id;
                const alreadyHasOrg = GLOBAL_USER?.organization !== null && GLOBAL_USER?.role !== 'GUEST';
                const isGuest = user.role === 'GUEST';
                const isAdmin = user.role === 'ADMIN';

                let actionBtn = '';

                if (isGuest) {
                    actionBtn = `<button onclick="window.location.href='/login'" class="btn-primary btn-small">Login untuk Gabung</button>`;
                } else if (isMemberOfThisOrg) {
                    actionBtn = `<b class="text-success">Organisasi Anda</b>`;
                } else if (isAdmin) {
                    actionBtn = `<span class="text-muted" title="Anda Adalah Admin">Terkunci</span>`;
                } else if (alreadyHasOrg) {
                    actionBtn = `<span class="text-muted" title="Anda sudah memiliki organisasi">Terkunci</span>`;
                } else {
                    actionBtn = `<button onclick="openJoinModal(${org.id}, '${org.name}')" class="btn-success btn-small">Gabung</button>`;
                }

                tableBody.innerHTML += `
                    <tr>
                        <td><a href="#" class="org-link" onclick="loadOrganizationProfile(${org.id}, event)">${org.name}</a></td>
                        <td><span class="badge" style="background:#edf2f7; color:#4a5568;">${org.field || 'Umum'}</span></td>
                        <td style="white-space: normal; word-wrap: break-word;">${org.description || '-'}</td>
                        <td style="text-align:center;">${actionBtn}</td>
                    </tr>`;
            });

            // 7. RENDER NAVIGASI PAGINASI
            if (paginationArea) {
                paginationArea.innerHTML = '';
                if (totalPages > 1) {
                    paginationArea.innerHTML = `
                        <div style="margin-top:15px;">
                            <button ${orgCurrentPage === 0 ? 'disabled' : ''} 
                                    onclick="orgCurrentPage--; loadOrgList(GLOBAL_USER)" 
                                    class="btn-secondary btn-small">« Prev</button>
                            <span style="margin: 0 15px; font-weight: bold;">Halaman ${orgCurrentPage + 1} dari ${totalPages}</span>
                            <button ${orgCurrentPage >= totalPages - 1 ? 'disabled' : ''} 
                                    onclick="orgCurrentPage++; loadOrgList(GLOBAL_USER)" 
                                    class="btn-secondary btn-small">Next »</button>
                        </div>
                    `;
                }
            }
        })
        .catch(err => {
            tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">${err.message}</td></tr>`;
        });
}

function handleOrgListSortAndSearch(newKeyword, newSortBy, newSortDirection) {
    if (newKeyword !== null) { orgCurrentKeyword = newKeyword; }
    if (newSortBy) { orgCurrentSortBy = newSortBy; }
    if (newSortDirection) { orgCurrentSortDirection = newSortDirection; }
    orgCurrentPage = 0;

    const user = GLOBAL_USER; // Gunakan global user
    loadOrgList(user);
}

function handleOrgListPagination(pageNumber) {
    orgCurrentPage = pageNumber;
    const user = GLOBAL_USER; // Gunakan global user
    loadOrgList(user);
}

function loadOrganizationProfile(orgId, event) {
    if (event) event.preventDefault();
    const container = document.getElementById('main-content-area');
    LAST_PAGE_BEFORE_PROFILE = 'org-list';
    history.pushState({ section: 'orgProfile-' + orgId }, '', `#organization-${orgId}`);

    fetch(`/api/organizations/${orgId}/details`)
        .then(res => res.json())
        .then(data => {
            const org = data.organization;
            const members = data.members;
            CURRENT_ORG_MEMBERS = members; // Simpan ke cache lokal

            // Mencari Pimpinan dari daftar anggota
            const leader = members.find(m => m.role === 'PIMPINAN');
            const isPimpinan = GLOBAL_USER.role === 'PIMPINAN' && GLOBAL_USER.organization.id === org.id;
            const formattedDate = formatIndoDate(org.establishedDate);
            updatePageTitle(`Profil ${org.name}`);

            container.innerHTML = `
                <div class="profile-header">
                    <div class="header-content">
                        <h2>${org.name}</h2>
                        <p class="text-muted">${org.field || 'Bidang belum diatur'} | ${org.scope || 'Cakupan belum diatur'}</p>
                        <p style="margin-top:10px;">👤 <b>Pimpinan:</b> 
                            ${leader ?
                    `<b class="member-link-text pimpinan-link" 
                                    style="color: #2b6cb0; cursor: pointer; text-decoration: none;" 
                                    onclick="viewMemberProfile(${leader.id}, 'org-detail')">
                                    ${leader.name}
                                </b>` :
                    '<span class="text-muted">Belum ditetapkan</span>'
                }
                        </p>
                    </div>
                    ${isPimpinan ? `
                    <button onclick="LAST_PAGE_BEFORE_PROFILE = 'org-detail'; navigateTo('kelola-org', () => loadEditOrganizationPage(), event)" 
                            class="btn-primary">
                        Edit Profil
                    </button>` : ''}
                </div>

                <div class="org-detail-grid">
                    <div class="detail-section">
                        <h4>🏢 Tentang Kami</h4>
                        <p>${org.description || 'Tidak ada deskripsi.'}</p>
                        <p>📍 <b>Alamat:</b> ${org.address || '-'}</p>
                        <p>🌐 <b>Tautan:</b> <a href="${org.externalLink}" target="_blank">${org.externalLink || '-'}</a></p>
                        <div class="requirement-box" style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #e53e3e; margin-top: 15px;">
                            <strong>📜 Kriteria Keanggotaan:</strong><br>
                            <p style="margin-top: 5px;">${org.membershipRequirement || 'Tidak ada kriteria khusus.'}</p>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>🎯 Visi & Misi</h4>
                        <p>${org.visionMission || 'Belum diatur.'}</p>
                        <p>📅 <b>Berdiri Sejak:</b> ${formattedDate}</p>
                        <p>⏳ <b>Periode Kepengurusan:</b> ${org.period || '-'}</p>
                        <p>📂 <b>Bidang:</b> ${org.field || '-'}</p>
                        <p>🌎 <b>Lingkup:</b> ${org.scope || '-'}</p>
                    </div>
                </div>

                <hr>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3>Daftar Anggota (${data.memberCount})</h3>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="memberSearch" placeholder="Cari nama atau no anggota..." 
                               oninput="filterAndSortOrgMembers()" style="padding:8px; border-radius:5px; border:1px solid #ddd;">
                        <select id="memberSort" onchange="filterAndSortOrgMembers()" style="padding:8px; border-radius:5px; border:1px solid #ddd;">
                            <option value="name-asc">Urutkan Nama (A-Z)</option>
                            <option value="name-desc">Urutkan Nama (Z-A)</option>
                            <option value="rank">Jabatan Tertinggi</option>
                            <option value="no-anggota">No. Anggota</option>
                        </select>
                    </div>
                </div>

                <div id="orgMemberTableContainer"></div>
            `;

            filterAndSortOrgMembers();
        })
        .catch(err => showToast("Gagal memuat profil organisasi: " + err.message, "error"));
}

function filterAndSortOrgMembers() {
    const keyword = document.getElementById('memberSearch').value.toLowerCase();
    const sortVal = document.getElementById('memberSort').value;
    const tableContainer = document.getElementById('orgMemberTableContainer');

    // 1. FILTERING
    let result = CURRENT_ORG_MEMBERS.filter(m => {
        const noAnggota = m.memberNumber || "";
        const jabatan = m.position || "Anggota"; // Ambil data jabatan

        return m.name.toLowerCase().includes(keyword) ||
            noAnggota.toLowerCase().includes(keyword) ||
            jabatan.toLowerCase().includes(keyword); // 🔍 Sekarang bisa cari jabatan!
    });

    // 2. SORTING cerdas
    if (sortVal === 'name-asc') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (sortVal === 'name-desc') {
        result.sort((a, b) => b.name.localeCompare(a.name));
    }
    else if (sortVal === 'no-anggota') {
        //  LOGIKA: Taruh yang kosong di paling bawah
        result.sort((a, b) => {
            const noA = a.memberNumber;
            const noB = b.memberNumber;

            if (!noA && noB) return 1;  // a kosong, b isi -> a turun
            if (noA && !noB) return -1; // a isi, b kosong -> a naik
            if (!noA && !noB) return 0; // keduanya kosong

            return noA.localeCompare(noB, undefined, { numeric: true }); // Urutan angka normal
        });
    }
    else if (sortVal === 'rank') {
        // Skala Prioritas Jabatan
        const getRank = (pos) => {
            const p = (pos || "").toLowerCase();
            if (p.includes("ketua") || p.includes("pimpinan")) return 1;
            if (p.includes("koordinator") || p.includes("kabid") || p.includes("kepala")) return 2;
            if (p.includes("sekretaris") || p.includes("bendahara")) return 3;
            return 4; // Anggota Biasa
        };
        result.sort((a, b) => getRank(a.position) - getRank(b.position));
    }

    // 3. RENDER TABLE
    tableContainer.innerHTML = `
        <table class="modern-table">
            <thead>
                <tr>
                    <th>No. Anggota</th>
                    <th>Nama</th>
                    <th>Jabatan</th>
                    <th>Jenis Kelamin</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${result.map(m => `
                    <tr>
                        <td>${m.memberNumber || '-'}</td>
                        <td><a href="#" onclick="viewMemberProfile(${m.id}, 'org-detail'); return false;">${m.name}</a></td>
                        <td>${m.position || 'Anggota'}</td>
                        <td>${m.gender === 'MALE' ? 'Laki-laki' : m.gender === 'FEMALE' ? 'Perempuan' : '-'}</td>
                        <td><span class="badge status-active">ACTIVE</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openJoinModal(organizationId, organizationName) {
    const isProfileComplete = GLOBAL_USER.experienceSummary && GLOBAL_USER.experienceSummary.trim().length > 10;

    const modalHtml = `
        <div id="joinModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 101;">
            <div style="background: white; width: 450px; margin: 100px auto; padding: 25px; border-radius: 8px;">
                <h4>Ajukan Gabung: ${organizationName}</h4>

                ${!isProfileComplete ? `
                    <div class="warning-box" style="background: #fff5f5; color: #c53030; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #feb2b2;">
                        <strong>⚠️ Profil Belum Lengkap!</strong><br>
                        Pimpinan mewajibkan ringkasan pengalaman organisasi. Silakan lengkapi di menu <b>Profil Saya</b> sebelum melamar.
                    </div>
                ` : `

                <p>Jelaskan secara singkat alasan Anda ingin bergabung (Opsional).</p>
                
                <form id="joinForm">
                    <textarea id="joinReason" rows="4" placeholder="Alasan bergabung..." style="width: 100%; padding: 8px; margin-bottom: 15px;"></textarea>
                    <input type="hidden" id="modalOrgId" value="${organizationId}">
                    
                    <button type="submit">Kirim Pengajuan</button>
                    <button type="button" onclick="closeJoinModal()" style="background-color: #6c757d;">Batal</button>
                    <p id="joinModalMessage" style="margin-top: 10px; color: red;"></p>
                </form>
            `}
                ${!isProfileComplete ? `<button type="button" onclick="closeJoinModal()" class="btn-secondary" style="width:100%">Tutup</button>` : ''}
            </div>
        </div>
    `;

    document.getElementById('main-content-area').insertAdjacentHTML('afterend', modalHtml);
    if (isProfileComplete) {
        document.getElementById('joinForm').addEventListener('submit', handleJoinSubmit);
    }
}

function closeJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) modal.remove();
}

//  FUNGSI BARU: Mengirim Pengajuan Gabung dengan Alasan
function handleJoinSubmit(event) {
    event.preventDefault();
    const organizationId = document.getElementById('modalOrgId').value;
    const reason = document.getElementById('joinReason').value;
    const message = document.getElementById("joinModalMessage");
    const userId = localStorage.getItem("CURRENT_USER_ID");

    message.innerText = `Mengajukan ke Org ID ${organizationId}...`;
    message.style.color = "black";

    // Modifikasi: Mengirim Body JSON
    fetch(`/api/users/${userId}/join/${organizationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason }) // Mengirim alasan bergabung
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text || "Gagal mengajukan gabung.") });
            }
            return res.json();
        })
        .then(user => {
            GLOBAL_USER = user;
            localStorage.setItem("CURRENT_USER_STATUS", user.memberStatus);

            message.style.color = "green";
            message.innerText = `Berhasil mengajukan! Status Anda kini PENDING.`;

            setTimeout(() => {
                closeJoinModal();
                loadDefaultLanding(null, GLOBAL_USER); // Muat ulang dashboard ke tampilan PENDING
            }, 1500);
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat join.";
        });
}

// Fungsi untuk memuat halaman form pendaftaran lengkap
function loadCreateOrganizationPage() {
    updatePageTitle("Daftarkan Organisasi Baru");
    history.pushState({ section: 'create-org' }, "", "#create-org");
    const container = document.getElementById('main-content-area');

    container.innerHTML = `
        <div class="header-with-action">
            <h3>Daftarkan Profil Organisasi Baru</h3>
            <p>Lengkapi data di bawah ini. Anda akan otomatis menjadi <b>Pimpinan Utama</b> setelah organisasi dibuat.</p>
        </div>
        <hr>
        <form id="fullOrgCreateForm" class="profile-edit-form">
            <div class="grid-2-col">
                <div class="form-group">
                    <label>Nama Organisasi</label>
                    <input type="text" id="newOrgName" required placeholder="Masukkan nama resmi organisasi">
                </div>
                <div class="form-group">
                    <label>Periode Kepengurusan</label>
                    <input type="text" id="newOrgPeriod" value="2025/2026" required placeholder="Contoh: 2024/2025">
                </div>
                <div class="form-group">
                    <label>Tanggal Berdiri</label>
                    <input type="date" id="newOrgDate" required>
                </div>
                <div class="form-group">
                    <label>Bidang</label>
                    <input type="text" id="newOrgField" required placeholder="Contoh: Pendidikan, IT, Sosial">
                </div>
                <div class="form-group">
                    <label>Lingkup</label>
                    <input type="text" id="newOrgScope" placeholder="Contoh: Nasional, Regional, Kampus">
                </div>
            </div>

            <div class="form-group">
                <label>Visi & Misi</label>
                <textarea id="newOrgVision" rows="5" required placeholder="Tuliskan visi dan misi organisasi..."></textarea>
            </div>

            <div class="form-group">
                <label>Deskripsi Singkat</label>
                <textarea id="newOrgDesc" rows="3" required placeholder="Jelaskan apa itu organisasi Anda..."></textarea>
            </div>

            <div class="form-group">
                <label>Kriteria Keanggotaan</label>
                <textarea id="newOrgRequirement" rows="3" placeholder="Apa syarat untuk menjadi anggota?"></textarea>
            </div>

            <div class="grid-2-col">
                <div class="form-group">
                    <label>Alamat Kantor</label>
                    <input type="text" id="newOrgAddress" placeholder="Lokasi sekretariat">
                </div>
                <div class="form-group">
                    <label>Tautan Eksternal (Website/Sosmed)</label>
                    <input type="url" id="newOrgLink" placeholder="https://...">
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-success">Daftarkan & Jadi Pimpinan</button>
                <button type="button" onclick="loadOrgListPage(null, GLOBAL_USER)" class="btn-secondary">Batal</button>
            </div>
        </form>
    `;

    document.getElementById('fullOrgCreateForm').addEventListener('submit', handleFullOrgCreation);
}

// Handler submit untuk pendaftaran mandiri (Form Lengkap)
function handleFullOrgCreation(event) {
    event.preventDefault();
    const creatorId = localStorage.getItem("CURRENT_USER_ID");

    const data = {
        name: document.getElementById('newOrgName').value,
        period: document.getElementById('newOrgPeriod').value,
        establishedDate: document.getElementById('newOrgDate').value,
        field: document.getElementById('newOrgField').value,
        scope: document.getElementById('newOrgScope').value,
        visionMission: document.getElementById('newOrgVision').value,
        description: document.getElementById('newOrgDesc').value,
        membershipRequirement: document.getElementById('newOrgRequirement').value,
        address: document.getElementById('newOrgAddress').value,
        externalLink: document.getElementById('newOrgLink').value,
        status: "ACTIVE"
    };

    fetch(`/api/organizations?creatorId=${creatorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(async res => {
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal mendaftarkan organisasi.");
            return result;
        })
        .then(() => {
            showToast("Pendaftaran Berhasil! Anda sekarang adalah Pimpinan.", "success");
            setTimeout(() => window.location.reload(), 1500);
        })
        .catch(err => showToast(err.message, "error"));
}

// #########################################################################
// ### [07] PROGRAM KERJA (PROKER) MODULE                                ###
// #########################################################################
// Manajemen Proker: Pengajuan, Persetujuan, Laporan Akhir, dan Filter.

function loadProkerPage(event) {
    if (event) event.preventDefault();
    updatePageTitle("Program Kerja");
    const container = document.getElementById('main-content-area');
    const orgId = GLOBAL_USER.organization ? GLOBAL_USER.organization.id : null;

    if (!orgId && GLOBAL_USER.role !== 'ADMIN') {
        container.innerHTML = "<h3>Anda belum terdaftar di organisasi.</h3>";
        return;
    }

    //  PERBAIKAN: Ambil data anggota dulu agar bidangOptions tidak kosong
    fetch(`/api/users/organization/${orgId}/active`)
        .then(res => res.json())
        .then(members => {
            CURRENT_ORG_MEMBERS = members; // Simpan data ke cache global

            const userPos = (GLOBAL_USER.position || "").toLowerCase();
            const canAdd = GLOBAL_USER.role === 'PIMPINAN' || userPos.includes("ketua") || userPos.includes("koordinator") || userPos.includes("kepala") || userPos.includes("kabid");

            //  Logika filter bidang Anda
            const bidangOptions = Array.from(new Set(
                CURRENT_ORG_MEMBERS.map(m => extractBidangFromPosition(m.position))
            )).map(b => `<option value="${b}">${b}</option>`).join('');

            // Gunakan template innerHTML milik Anda
            container.innerHTML = `
                <div class="header-with-action">
                    <h3>Program Kerja</h3>
                    ${canAdd ? `<button onclick="openAddProkerModal()" class="btn-success">+ Tambah Proker</button>` : ''}
                </div>
                
                <div class="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
                    <div class="stat-card">Total: <b id="statTotal">0</b></div>
                    <div class="stat-card" style="border-left: 4px solid #ecc94b;">Menunggu: <b id="statPending">0</b></div>
                    <div class="stat-card" style="border-left: 4px solid #3182ce;">Direncanakan: <b id="statPlanned">0</b></div>
                    <div class="stat-card" style="border-left: 4px solid #38a169;">Berlangsung: <b id="statOngoing">0</b></div>
                    <div class="stat-card" style="border-left: 4px solid #2d3748;">Selesai: <b id="statCompleted">0</b></div>
                    <div class="stat-card" style="border-left: 4px solid #e53e3e;">Ditolak: <b id="statRejected">0</b></div>
                </div>

                <div class="proker-toolbar" style="background:#f4f7f6; padding:20px; border-radius:12px; margin-bottom:20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <input type="text" id="prokerSearch" placeholder="Cari Judul, PIC, Deskripsi, Anggaran, atau Tanggal..." 
                            style="flex:1; padding:12px; border-radius:8px; border:1px solid #ccc;" 
                            oninput="searchAndSortProker()">
                        <button onclick="searchAndSortProker()" class="btn-primary" style="width:120px;">🔍 Cari</button>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
                        <select id="sortAlpha" onchange="searchAndSortProker()" style="padding:10px; border-radius:8px;">
                            <option value="">Urutkan Abjad...</option>
                            <option value="asc">Judul (A - Z)</option>
                            <option value="desc">Judul (Z - A)</option>
                        </select>
                        <select id="sortTime" onchange="searchAndSortProker()" style="padding:10px; border-radius:8px;">
                            <option value="">Urutkan Waktu...</option>
                            <option value="newest">Paling Baru Dibuat</option>
                            <option value="oldest">Paling Lama Dibuat</option>
                        </select>
                        <select id="sortBudget" onchange="searchAndSortProker()" style="padding:10px; border-radius:8px;">
                            <option value="">Urutkan Anggaran...</option>
                            <option value="highest">Anggaran Terbesar</option>
                            <option value="lowest">Anggaran Terkecil</option>
                        </select>
                        <select id="sortStatus" onchange="searchAndSortProker()" style="padding:10px; border-radius:8px;">
                            <option value="">Urutkan Kategori Status...</option>
                            <option value="PENDING">Menunggu Persetujuan</option>
                            <option value="PLANNED">Direncanakan</option>
                            <option value="ON_GOING">Berlangsung</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                        <select id="sortBidang" onchange="searchAndSortProker()" style="padding:10px; border-radius:8px;">
                            <option value="">Semua Bidang...</option>
                            ${bidangOptions}
                        </select>
                    </div>
                </div>

                <div id="prokerList" class="proker-grid">Memuat data...</div>
            `;

            // Setelah UI siap, panggil fungsi fetch proker milik Anda
            fetchProker(orgId);
        })
        .catch(err => console.error("Gagal memuat filter bidang:", err));
}

function fetchProker(orgId) {
    fetch(`/api/proker/org/${orgId}`)
        .then(res => res.json())
        .then(prokers => {
            CACHED_PROKERS = prokers; // Simpan ke memori
            searchAndSortProker(); // Tampilkan data awal
        })
        .catch(err => console.error("Gagal ambil proker:", err));
}

function searchAndSortProker() {
    const keyword = document.getElementById('prokerSearch').value.toLowerCase();
    const alpha = document.getElementById('sortAlpha').value;
    const time = document.getElementById('sortTime').value;
    const budget = document.getElementById('sortBudget').value;
    const status = document.getElementById('sortStatus').value;
    const bidangFilter = document.getElementById('sortBidang').value;

    // 1. FILTERING Detail
    let result = CACHED_PROKERS.filter(p => {
        const picName = p.pic ? p.pic.name.toLowerCase() : "";
        const anggaran = p.totalAnggaran ? p.totalAnggaran.toString() : "0";
        const desc = p.description ? p.description.toLowerCase() : "";
        const tgl = formatIndoDate(p.startDate).toLowerCase();
        const picPos = p.pic ? p.pic.position : "";
        const picBidang = extractBidangFromPosition(picPos);

        const matchSearch = p.title.toLowerCase().includes(keyword) || picName.includes(keyword) ||
            desc.includes(keyword) || anggaran.includes(keyword) || tgl.includes(keyword);

        const matchStatus = status === "" || p.status === status;
        const matchBidang = bidangFilter === "" || picBidang === bidangFilter;
        return matchSearch && matchStatus && matchBidang;
    });

    // 2. SORTING Berjenjang
    if (budget === 'highest') result.sort((a, b) => (b.totalAnggaran || 0) - (a.totalAnggaran || 0));
    else if (budget === 'lowest') result.sort((a, b) => (a.totalAnggaran || 0) - (b.totalAnggaran || 0));

    if (time === 'newest') result.sort((a, b) => b.id - a.id); // ID besar = paling baru
    else if (time === 'oldest') result.sort((a, b) => a.id - b.id);

    if (alpha === 'asc') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (alpha === 'desc') result.sort((a, b) => b.title.localeCompare(a.title));

    renderProkerList(result);
}

function renderProkerList(prokers) {
    const listContainer = document.getElementById('prokerList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const stats = { TOTAL: prokers.length, PENDING: 0, PLANNED: 0, ON_GOING: 0, COMPLETED: 0, REJECTED: 0 };
    let htmlCards = '';

    if (prokers.length === 0) {
        listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #666;"><h4>🔍 Tidak ada proker yang cocok.</h4></div>';
        updateProkerStats(stats);
        return;
    }

    prokers.forEach(p => {
        if (stats[p.status] !== undefined) stats[p.status]++;

        const statusClass = `status-${p.status.toLowerCase()}`;
        const isPIC = p.pic && p.pic.id == GLOBAL_USER.id;
        const isPimpinan = GLOBAL_USER.role === 'PIMPINAN';

        let deleteAction = '';
        if (isPimpinan && p.status !== 'COMPLETED' && p.status !== 'ON_GOING') {
            deleteAction = `
            <button onclick="confirmDeleteProker(${p.id}, '${p.title.replace(/'/g, "\\'")}')" 
                    class="btn-link-danger" style="margin-left: auto; color: #e53e3e; cursor: pointer;" title="Hapus Proker">
                🗑️ Hapus
            </button>`;
        }

        // Tombol Aksi Anggota/PIC
        let progressAction = '';
        if (isPIC || isPimpinan) {
            if (p.status === 'PLANNED') progressAction = `<button onclick="updateStatus(${p.id}, 'ON_GOING')" class="btn-primary btn-small">Mulai</button>`;
            else if (p.status === 'ON_GOING') progressAction = `<button onclick="openProkerDetailModal(${p.id})" class="btn-success btn-small">Selesaikan</button>`;
        }

        // Tombol Persetujuan Pimpinan
        let pimpinanApproval = '';
        if (isPimpinan && p.status === 'PENDING') {
            pimpinanApproval = `
                <div style="margin-top:10px; display:flex; gap:5px;">
                    <button onclick="approveProker(${p.id})" class="btn-success btn-small">Terima</button>
                    <button onclick="openRejectProkerModal(${p.id})" class="btn-danger btn-small">Tolak</button>
                </div>`;
        }

        htmlCards += `
            <div class="proker-card ${statusClass}" onclick="openProkerDetailModal(${p.id})" style="cursor:pointer;">
                <div class="proker-header">
                    <h4>${p.title}</h4>
                    <span class="badge ${statusClass}">${p.status}</span>
                    </div>
                    <p class="proker-desc">${p.description ? p.description.substring(0, 80) + '...' : '-'}</p>
                    <p class="anggaran-text">💰 Rp ${p.totalAnggaran ? p.totalAnggaran.toLocaleString() : '0'}</p>
                    <div class="proker-footer">
                        <span>PIC: 
                            <b class="member-link-text" 
                            onclick="event.stopPropagation(); viewMemberProfile(${p.pic ? p.pic.id : 0}, 'proker')">
                            ${p.pic ? p.pic.name : 'N/A'}
                            </b>
                        </span>
                    </div>
                    <hr style="margin: 5px 0;">
                    <small>${formatIndoDate(p.startDate)} s/d ${formatIndoDate(p.endDate)}</small>
                <div class="proker-actions" onclick="event.stopPropagation()">
                    ${progressAction} ${pimpinanApproval}
                    ${deleteAction}
                </div>
                </div>
                `;
    });

    listContainer.innerHTML = htmlCards;
    updateProkerStats(stats);
}

function updateProkerStats(stats) {
    const map = {
        'statTotal': stats.TOTAL,
        'statPending': stats.PENDING,     
        'statPlanned': stats.PLANNED,
        'statOngoing': stats.ON_GOING,
        'statCompleted': stats.COMPLETED,
        'statRejected': stats.REJECTED    
    };

    for (const [id, value] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

function openAddProkerModal() {
    const orgId = GLOBAL_USER.organization.id;

    // 1. Ambil daftar anggota aktif untuk Dropdown PIC
    fetch(`/api/users/organization/${orgId}/active`)
        .then(res => res.json())
        .then(members => {
            let picOptions = members.map(m => `<option value="${m.id}">${m.name} (${m.position || 'Anggota'})</option>`).join('');

            const modalHtml = `
                <div id="prokerModal" class="modal-overlay">
                    <div class="modal-content">
                        <h4>Tambah Program Kerja Baru</h4>
                        <form id="prokerForm">
                            <label>Judul Proker</label>
                            <input type="text" id="prokerTitle" required placeholder="Contoh: Bakti Sosial Desa">
                            
                            <label>Deskripsi</label>
                            <textarea id="prokerDesc" rows="3" placeholder="Jelaskan detail kegiatan..."></textarea>
                            
                            <div class="grid-2-col">
                                <div>
                                    <label>Tanggal Mulai</label>
                                    <input type="date" id="prokerStart" max="9999-12-31" required>
                                </div>
                                <div>
                                    <label>Tanggal Selesai</label>
                                    <input type="date" id="prokerEnd" max="9999-12-31" required>
                                </div>
                                <div>
                                    <label>Total Anggaran (Rp)</label>
                                    <input type="number" id="prokerAnggaran" placeholder="Contoh: 500000">
                                </div>
                                <div>
                                    <label>Rincian Anggaran Singkat</label>
                                    <textarea id="prokerRincian" rows="2" placeholder="Contoh: Konsumsi Rp.300rb, Banner Rp.200rb"></textarea>
                                </div>
                            </div>

                            <label>Penanggung Jawab (PIC)</label>
                            <select id="prokerPic" required>
                                <option value="">-- Pilih Anggota --</option>
                                ${picOptions}
                            </select>

                            <div class="modal-actions">
                                <button type="submit" class="btn-success">Ajukan Proker</button>
                                <button type="button" onclick="closeProkerModal()" class="btn-secondary">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('prokerForm').addEventListener('submit', handleProkerSubmit);
        })
        .catch(err => showToast("Gagal mengambil daftar anggota: " + err.message, "error"));
}


function closeProkerModal() {
    const modal = document.getElementById('prokerModal');
    if (modal) modal.remove();
}

function handleProkerSubmit(event) {
    event.preventDefault();

    const startDate = document.getElementById('prokerStart').value;
    const endDate = document.getElementById('prokerEnd').value;

    //  VALIDASI TAHUN: Cek jika tahun lebih dari 4 digit
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    if (startYear > 9999 || endYear > 9999) {
        showToast("⚠️ Format tanggal salah! Tahun maksimal adalah 4 digit (9999).", "error");
        return;
    }

    const orgId = GLOBAL_USER.organization.id;
    const creatorId = GLOBAL_USER.id;
    const picId = document.getElementById('prokerPic').value;

    if (!picId) {
        showToast("Harap pilih Penanggung Jawab (PIC)", "error");
        return;
    }

    const prokerData = {
        title: document.getElementById('prokerTitle').value,
        description: document.getElementById('prokerDesc').value,
        startDate: document.getElementById('prokerStart').value,
        endDate: document.getElementById('prokerEnd').value,
        totalAnggaran: parseFloat(document.getElementById('prokerAnggaran').value) || 0, // Ambil nilai anggaran
        rincianAnggaran: document.getElementById('prokerRincian').value // Ambil rincian
    };

    // Pastikan URL endpoint sesuai dengan Controller di Backend
    fetch(`/api/proker/org/${orgId}?creatorId=${creatorId}&picId=${picId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prokerData)
    })
        .then(async res => {
            if (!res.ok) {
                //  Jika server tetap kirim error 400 karena format JSON
                if (res.status === 400) throw new Error("Data Wajib Diisi");
                const errorMsg = await res.text();
                throw new Error(errorMsg);
            }
            return res.json();
        })
        .then(() => {
            showToast("Program Kerja berhasil diajukan! Menunggu persetujuan pimpinan.", "success");
            closeProkerModal();
            fetchProker(orgId); // Refresh daftar proker
        })
        .catch(err => {
            console.error(err);
            showToast(err.message, "error");
        });
}

function openProkerDetailModal(prokerId) {
    // 1. Ambil data proker spesifik (menggunakan data dari GLOBAL_USER.organization.prokers jika tersedia atau fetch baru)
    fetch(`/api/proker/${prokerId}`)
        .then(res => res.json())
        .then(p => {
            const isPIC = p.pic && p.pic.id == GLOBAL_USER.id;
            const canReport = isPIC && p.status === 'ON_GOING';
            console.log("DEBUG PROKER:", {
                "Status Proker": p.status,
                "ID PIC": p.pic ? p.pic.id : 'Kosong',
                "ID Anda": GLOBAL_USER.id,
                "Bisa Input Laporan?": canReport
            });

            const start = formatIndoDate(p.startDate);
            const end = formatIndoDate(p.endDate);

            const modalHtml = `
                <div id="prokerDetailModal" class="modal-overlay">
                    <div class="modal-content proker-detail-view">
                        <div class="modal-header">
                            <h3>${p.title}</h3>
                            <span class="badge status-${p.status.toLowerCase()}">${p.status}</span>
                        </div>
                        <hr>
                        <div class="proker-info-body">
                            <p><b>Deskripsi:</b><br>${p.description || '-'}</p>
                            <div class="grid-2-col">
                                <p><b>📅 Pelaksanaan:</b><br>${start} s/d ${end}</p>
                                <p><b>💰 Anggaran:</b><br>Rp ${p.totalAnggaran ? p.totalAnggaran.toLocaleString() : '0'}</p>
                            </div>
                            <p><b>📍 PIC:</b> 
                                <b class="member-link-text" 
                                onclick="viewMemberProfile(${p.pic ? p.pic.id : 0}, 'proker')">
                                ${p.pic ? p.pic.name : 'N/A'}
                                </b>
                            </p>
                            ${p.rincianAnggaran ? `<p><b>📝 Rincian Anggaran:</b><br>${p.rincianAnggaran}</p>` : ''}
                            
                            <div class="report-section">
                                <h4>📝 Laporan Pelaksanaan</h4>
                                    ${canReport ? `
                                        <textarea id="prokerReportInput" rows="5" placeholder="Tuliskan hasil kegiatan...">${p.executionReport || ''}</textarea>
                                        
                                        <div style="margin-top: 15px;">
                                            <label style="display:block; margin-bottom:5px; font-weight:bold;">🔗 Link Lampiran (Dokumentasi/Drive):</label>
                                            <input type="url" id="prokerLinkInput" 
                                                value="${p.evidenceLink || ''}" 
                                                placeholder="Contoh: https://drive.google.com/..." 
                                                style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                                            <small style="color: #666;">*Pastikan link sudah di-set 'Public' agar Pimpinan bisa melihat.</small>
                                        </div>

                                        <button onclick="submitProkerReport(${p.id})" class="btn-success" style="margin-top:15px; width:100%; padding: 12px;">
                                            Simpan Laporan & Selesaikan
                                        </button>
                                    ` : `
                                        <div class="report-box-static" style="border-left: 4px solid #28a745; padding: 10px; background: #f9f9f9;">
                                            <p><b>Hasil Kegiatan:</b><br>${p.executionReport || '<i>Belum ada laporan hasil.</i>'}</p>
                                            
                                            ${p.evidenceLink && p.evidenceLink !== "" ? `
                                                <div style="margin-top: 15px; padding: 10px; background: #e6fffa; border-radius: 5px; border: 1px solid #b2f5ea;">
                                                    <p style="margin:0;">🔗 <b>Dokumentasi Lampiran:</b></p>
                                                    <a href="${p.evidenceLink}" target="_blank" style="color: #2c7a7b; font-weight: bold; word-break: break-all;">
                                                        ${p.evidenceLink}
                                                    </a>
                                                </div>
                                            ` : `
                                                <p style="margin-top:10px; color: #a0aec0; font-size: 0.8rem;"><i>(Tidak ada lampiran link dokumentasi)</i></p>
                                            `}
                                        </div>
                                    `}
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="document.getElementById('prokerDetailModal').remove()" class="btn-secondary">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = document.getElementById('prokerDetailModal');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        })
        .catch(err => showToast("Gagal memuat detail: " + err.message, "error"));
}

function submitProkerReport(prokerId) {
    const report = document.getElementById('prokerReportInput').value;
    const link = document.getElementById('prokerLinkInput').value; // Ambil nilai link

    if (!report.trim()) {
        showToast("Laporan hasil tidak boleh kosong!", "error");
        return;
    }

    const userId = GLOBAL_USER.id;
    fetch(`/api/proker/${prokerId}/finish?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            executionReport: report,
            evidenceLink: link // Kirim link ke backend
        })
    })
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            showToast("Laporan disimpan dan proker selesai!", "success");
            document.getElementById('prokerDetailModal').remove();
            fetchProker(GLOBAL_USER.organization.id);
        })
        .catch(err => showToast(err.message, "error"));
}


function approveProker(prokerId) {
    const pimpinanId = GLOBAL_USER.id;

    // Panggil customConfirm dengan callback
    customConfirm("Setujui program kerja ini?", () => {
        // Kode di bawah ini hanya jalan jika tombol "Ya" diklik
        fetch(`/api/proker/${prokerId}/approve?pimpinanId=${pimpinanId}`, { method: 'PUT' })
            .then(async res => {
                if (!res.ok) throw new Error(await res.text());
                showToast("Proker disetujui!", "success");
                fetchProker(GLOBAL_USER.organization.id);
            })
            .catch(err => showToast(err.message, "error"));
    });
}

function rejectProker(prokerId) {
    const pimpinanId = GLOBAL_USER.id;

    customConfirm("Tolak program kerja ini?", () => {
        fetch(`/api/proker/${prokerId}/reject?pimpinanId=${pimpinanId}`, { method: 'PUT' })
            .then(async res => {
                if (!res.ok) throw new Error(await res.text());
                showToast("Proker ditolak.", "error");
                fetchProker(GLOBAL_USER.organization.id);
            })
            .catch(err => showToast(err.message, "error"));
    });
}


function openRejectProkerModal(prokerId) {
    const modalHtml = `
        <div id="rejectProkerModal" class="confirm-overlay">
            <div class="confirm-box" style="width: 450px;">
                <h4 style="color: #d9534f;">Tolak Program Kerja</h4>
                <p>Berikan alasan penolakan atau poin revisi untuk PIC:</p>
                <textarea id="prokerRejectReason" rows="4" 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;"
                    placeholder="Contoh: Anggaran terlalu besar, PIC harap diganti..."></textarea>
                <div class="confirm-buttons">
                    <button onclick="submitRejectProker(${prokerId})" class="btn-danger">Konfirmasi Tolak</button>
                    <button onclick="document.getElementById('rejectProkerModal').remove()" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitRejectProker(prokerId) {
    const reason = document.getElementById('prokerRejectReason').value;
    if (!reason.trim()) {
        showToast("Alasan wajib diisi agar PIC bisa mengevaluasi!", "error");
        return;
    }

    const pimpinanId = GLOBAL_USER.id;
    fetch(`/api/proker/${prokerId}/reject?pimpinanId=${pimpinanId}&reason=${encodeURIComponent(reason)}`, {
        method: 'PUT'
    })
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            showToast("Proker ditolak dengan alasan.", "success");
            document.getElementById('rejectProkerModal').remove();
            fetchProker(GLOBAL_USER.organization.id);
        })
        .catch(err => showToast(err.message, "error"));
}

function deleteProker(prokerId) {
    const pimpinanId = GLOBAL_USER.id;

    customConfirm("Hapus program kerja ini? Tindakan ini tidak dapat dibatalkan.", () => {

        fetch(`/api/proker/${prokerId}?pimpinanId=${pimpinanId}`, { method: 'DELETE' })
            .then(async res => {
                if (!res.ok) throw new Error(await res.text());
                showToast("Proker berhasil dihapus", "success");
                fetchProker(GLOBAL_USER.organization.id);
            })
            .catch(err => showToast(err.message, "error"));
    });
}

// Fungsi baru untuk konfirmasi hapus
function confirmDeleteProker(prokerId, title) {
    customConfirm(`⚠️ PERINGATAN: Menghapus proker "${title}" akan menghapus seluruh data terkait secara permanen. Apakah anda yakin ingin menghapus?`, () => {
        const pimpinanId = GLOBAL_USER.id;

        fetch(`/api/proker/${prokerId}?pimpinanId=${pimpinanId}`, {
            method: 'DELETE'
        })
            .then(async res => {
                if (!res.ok) throw new Error(await res.text());
                showToast("Program Kerja berhasil dihapus.", "success");
                fetchProker(GLOBAL_USER.organization.id); // Refresh daftar
            })
            .catch(err => showToast("Gagal menghapus: " + err.message, "error"));
    });
}

function updateStatus(prokerId, newStatus) {
    const userId = GLOBAL_USER.id;

    fetch(`/api/proker/${prokerId}/status?status=${newStatus}&userId=${userId}`, {
        method: 'PUT'
    })
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            showToast(`Status Proker diperbarui menjadi ${newStatus}`, "success");
            fetchProker(GLOBAL_USER.organization.id);
        })
        .catch(err => showToast(err.message, "error"));
}

// #########################################################################
// ### [08] PIMPINAN (MANAGEMENT) AREA                                   ###
// #########################################################################
// Kontrol khusus pimpinan: Approve/Reject, Revoke, dan Kelola Jabatan.

function loadPimpinanDashboard(user) {
    preventDefault(null);
    updatePageTitle("Kelola Anggota");
    const orgId = user.organization.id;
    const container = document.getElementById('main-content-area');

    localStorage.setItem("CURRENT_ORG_ID", orgId);

    //  1. Ambil data dulu
    fetch(`/api/users/organization/${orgId}/active`)
        .then(res => res.json())
        .then(members => {
            // Simpan ke variabel global agar bisa di-sort/filter/paginasi di JS
            CURRENT_ACTIVE_MEMBERS = members;

            const activeOnly = members.filter(m => m.memberStatus === 'ACTIVE');
            const totalActive = activeOnly.length;
            const resignRequests = members.filter(m => m.memberStatus === 'RESIGN_REQUESTED');

            const bidangOptions = Array.from(new Set(
                members.map(m => extractBidangFromPosition(m.position))
            )).map(b => `<option value="${b}">${b}</option>`).join('');

            //  2. Pasang HTML ke Container
            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Manajemen Anggota: ${user.organization.name}</h3>
                    <button onclick="loadHandoverPage()" class="btn-primary" style="padding: 10px 20px;">🤝 Serah Terima Jabatan</button>
                </div>
                <hr>
                
                <div class="card-section">
                    <h4>Permintaan Gabung (PENDING)</h4>
                    <table id="pendingTable" class="data-table">
                        <thead><tr><th>Nama</th><th>Email</th><th>Alasan</th><th>Aksi</th></tr></thead>
                        <tbody><tr><td colspan="3">Memuat...</td></tr></tbody>
                    </table>
                </div>

                <div class="card-section" style="margin-top: 20px; border-left: 4px solid #e53e3e;">
                    <h4>Permintaan Mengundurkan Diri</h4>
                    <table id="resignRequestTable" class="data-table">
                        <thead><tr><th>Nama</th><th>Email</th><th>Alasan Keluar</th><th>Aksi</th></tr></thead>
                        <tbody>
                            ${resignRequests.length === 0 ? '<tr><td colspan="3" class="text-muted">Tidak ada permintaan.</td></tr>' :
                    resignRequests.map(u => `
                                <tr>
                                    <td><b>${u.name}</b><br><small>${u.position || 'Anggota'}</small></td>
                                    <td>${u.email}</td> 
                                    <td><i>"${u.applicationReason || '-'}"</i></td>
                                    <td>
                                        <button onclick="processResign(${u.id}, 'APPROVE')" class="btn-danger btn-small">Setujui</button>
                                        <button onclick="processResign(${u.id}, 'REJECT')" class="btn-secondary btn-small">Tolak</button>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="card-section" style="margin-top: 20px;">
                    <div class="pimpinan-toolbar" style="background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                            <h4>Anggota Aktif ( ${totalActive} Orang )</h4>
                            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                <div style="display:flex; gap:5px;">
                                    <input type="text" id="keywordSearch" placeholder="Cari Nama, Email, No..." style="padding:8px; border-radius:5px; border:1px solid #ddd; width:200px;">
                                </div>
                                    
                                <select id="activeBidangFilter" onchange="currentPage = 0; filterAndSortActiveMembers()" style="padding:8px; border-radius:5px; border:1px solid #ddd;">
                                    <option value="">Semua Bidang</option>
                                    ${bidangOptions}
                                </select>
                                    
                                <select id="activeSort" onchange="currentPage = 0; filterAndSortActiveMembers()" style="padding:8px; border-radius:5px; border:1px solid #ddd;">
                                    <option value="name-asc">Nama (A-Z)</option>
                                    <option value="name-desc">Nama (Z-A)</option>
                                    <option value="periode">Urutkan Periode Organisasi</option>
                                    <option value="rank">Jabatan Tertinggi</option>
                                    <option value="no-anggota">No. Anggota</option>
                                    <option value="date-new">Terbaru Gabung</option>
                                    <option value="date-old">Terlama Gabung</option>
                                    <option value="gender">Berdasarkan Gender</option>
                                </select>
                
                                <button onclick="currentPage = 0; filterAndSortActiveMembers()" class="btn-primary" style="padding:8px 15px;">🔍 Cari</button>
                            </div>
                        </div>
                    </div>

                    <table id="activeTable" class="data-table">
                        <thead>
                            <tr><th>No</th><th>Nama</th><th>Email</th><th>Jabatan</th><th>No. Anggota</th><th>Gender</th><th>Tgl Gabung</th><th>Aksi</th></tr> 
                        </thead>
                        <tbody></tbody>
                    </table>

                    <div id="paginationControls" style="margin-top: 20px; text-align: center;"></div>
                </div>
            `;

            //  3. BARU PASANG LISTENER (Setelah element keywordSearch dipastikan ada)
            const searchInput = document.getElementById('keywordSearch');
            if (searchInput) {
                searchInput.addEventListener('input', filterAndSortActiveMembers);
                searchInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') handleSearchAndSort(this.value);
                });
            }

            //  4. Jalankan pengisian tabel data lainnya
            loadPending(orgId);
            loadResignRequests(orgId);
            currentPage = 0;
            filterAndSortActiveMembers();
        })
        .catch(err => {
            console.error("Gagal memuat dashboard:", err);
            // ini agar pesan error tidak menutupi dashboard jika hanya masalah render
            if (!err.message.includes('null')) {
                container.innerHTML = `<p class="text-error">Error: ${err.message}</p>`;
            }
        })
}

function loadPending(orgId) {
    fetch(`/api/users/organization/${orgId}/pending`)
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat daftar pending');
            return res.json();
        })
        .then(users => {
            const tableBody = document.querySelector("#pendingTable tbody");
            tableBody.innerHTML = '';

            if (users.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">Tidak ada permintaan Bergabung</td></tr>`; //  Ganti colspan menjadi 4
                return;
            }
            users.forEach(u => {
                const reason = u.applicationReason || 'Tidak ada alasan spesifik.';
                tableBody.innerHTML += `
                    <tr>
                        <td><a href="#" onclick="loadUserProfile(${u.id}, event)">${u.name}</a></td>
                        <td>${u.email}</td>
                        <td>${reason}</td> <td>
                            <button onclick="approve(${u.id})" class="btn-success">Approve</button>
                            <button onclick="reject(${u.id})" class="btn-danger">Reject</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            document.querySelector("#pendingTable tbody").innerHTML = `<tr><td colspan="4" style="color: red;">${err.message}</td></tr>`; //  Ganti colspan menjadi 4
        });
}

function approve(targetUserId) {
    const approverId = localStorage.getItem("CURRENT_USER_ID");

    fetch(`/api/users/${approverId}/approve/${targetUserId}`, { method: "PUT" })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Gagal Approve.");
            }
            showToast("Anggota berhasil disetujui!", "success");

            // Muat ulang dashboard tanpa refresh halaman penuh
            loadPimpinanDashboard(GLOBAL_USER);
        })
        .catch(err => {
            showToast(err.message, "error");
        });
}

function reject(targetUserId) {
    const approverId = localStorage.getItem("CURRENT_USER_ID");

    fetch(`/api/users/${approverId}/reject/${targetUserId}`, { method: "PUT" })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Gagal Reject.");
            }
            showToast("Permintaan bergabung ditolak.", "success");

            loadPimpinanDashboard(GLOBAL_USER);
        })
        .catch(err => {
            showToast(err.message, "error");
        });
}


function loadResignRequests(orgId) {
    //  GUNAKAN endpoint general (tanpa /active) agar status RESIGN_REQUESTED ikut terbawa
    fetch(`/api/users/organization/${orgId}`)
        .then(res => res.json())
        .then(members => {
            const tableBody = document.querySelector("#resignRequestTable tbody");

            //  Ambil data user yang statusnya RESIGN_REQUESTED
            const requests = members.filter(m => m.memberStatus === 'RESIGN_REQUESTED');

            tableBody.innerHTML = '';
            if (requests.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3" class="text-muted">Tidak ada permintaan keluar.</td></tr>`;
                return;
            }

            requests.forEach(u => {
                tableBody.innerHTML += `
                    <tr>
                        <td>
                            <b style="color: #2d3748;">${u.name}</b><br>
                            <small class="text-muted">${u.position || 'Anggota'}</small>
                        </td>
                        <td><i>"${u.applicationReason || 'Tidak ada alasan'}"</i></td>
                        <td>
                            <div style="display:flex; gap:5px;">
                                <button onclick="processResign(${u.id}, 'APPROVE')" class="btn-danger btn-small">Setujui</button>
                                <button onclick="processResign(${u.id}, 'REJECT')" class="btn-secondary btn-small">Tolak</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Gagal memuat permintaan resign:", err));
}

//  Fungsi Aksi Tombol (Pastikan ini ada di dashboard.js)
function processResign(targetUserId, action) {
    const approverId = GLOBAL_USER.id;
    const actionText = action === 'APPROVE' ? "MENYETUJUI" : "MENOLAK";
    const isMe = targetUserId == GLOBAL_USER.id;

    customConfirm(`Apakah Anda yakin ingin ${actionText} pengunduran diri ini?`, () => {
        // Kita gunakan method PUT ke endpoint yang akan kita buat di UserController
        fetch(`/api/users/${approverId}/process-resign/${targetUserId}?action=${action}`, {
            method: 'PUT'
        })
            .then(async res => {
                if (res.ok) {
                    showToast("Pengunduran diri berhasil diproses.", "success");

                    if (isMe && action === 'APPROVE') {
                        localStorage.removeItem("CURRENT_ORG_ID");
                        GLOBAL_USER.organization = null;
                        GLOBAL_USER.role = 'USER';
                        GLOBAL_USER.memberStatus = 'NON_MEMBER';
                        localStorage.setItem("CURRENT_USER_STATUS", "NON_MEMBER");

                        showToast("Status Anda diperbarui. Memuat ulang sistem...", "info");
                        setTimeout(() => {
                            // Opsi 1: Reload halaman total untuk reset sidebar & state
                            window.location.href = "/struktura";
                        }, 1500);
                    } else {
                        loadPimpinanDashboard(GLOBAL_USER);
                    }
                } else {
                    const errorText = await res.text();
                    showToast("Gagal: " + errorText, "success");
                }
            })
            .catch(err => console.error("Pengunduran diri berhasil di proses", err));
    });
}


function filterAndSortActiveMembers() {
    const searchInput = document.getElementById('keywordSearch');
    const sortSelect = document.getElementById('activeSort');
    const bidangSelect = document.getElementById('activeBidangFilter'); 
    const tableBody = document.querySelector("#activeTable tbody");
    const paginationArea = document.getElementById('paginationControls');

    if (!searchInput || !sortSelect || !tableBody) return;

    const keyword = searchInput.value.toLowerCase();
    const sortVal = sortSelect.value;
    const bidangFilter = bidangSelect ? bidangSelect.value : "";
    const pageSize = 20;

    // 1. FILTERING (Pencarian + Filter Bidang)
    let result = CURRENT_ACTIVE_MEMBERS.filter(u => {
        const isActive = u.memberStatus === 'ACTIVE';

        //  DEFINISIKAN DATA YANG MAU DICARI
        const name = u.name ? u.name.toLowerCase() : "";
        const email = u.email ? u.email.toLowerCase() : "";
        const mNum = u.memberNumber ? u.memberNumber.toLowerCase() : "";
        const userPos = u.position ? u.position.toLowerCase() : "anggota";
        const keyword = searchInput.value.toLowerCase(); // Ambil kata kunci dari input

        // Logika pencarian: Cek apakah keyword ada di Nama, Email, No, atau Jabatan
        const matchSearch = name.includes(keyword) ||
            email.includes(keyword) ||
            mNum.includes(keyword) ||
            userPos.includes(keyword);

        const memberBidang = extractBidangFromPosition(u.position);
        const matchBidang = bidangFilter === "" || memberBidang === bidangFilter;

        return isActive && matchSearch && matchBidang;
    });

    // 3. LOGIKA SORTING (Perbaikan Sort Jabatan/Rank)
    if (sortVal === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortVal === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortVal === 'date-new') result.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    else if (sortVal === 'date-old') result.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
    else if (sortVal === 'gender') result.sort((a, b) => (a.gender || "").localeCompare(b.gender || ""));
    else if (sortVal === 'no-anggota') {
        result.sort((a, b) => {
            if (!a.memberNumber) return 1;
            if (!b.memberNumber) return -1;
            return a.memberNumber.localeCompare(b.memberNumber, undefined, { numeric: true });
        });
    }
    else if (sortVal === 'rank') {
        const getRank = (pos) => {
            const p = (pos || "").toLowerCase();
            if (p.includes("ketua") || p.includes("pimpinan")) return 1;
            if (p.includes("koordinator") || p.includes("kabid") || p.includes("kepala")) return 2;
            if (p.includes("sekretaris") || p.includes("bendahara")) return 3;
            return 4; // Anggota Biasa
        };
        result.sort((a, b) => getRank(a.position) - getRank(b.position));
    }
    else if (sortVal === 'periode') {
        // Karena periode ada di entitas Organization, kita akses via u.organization
        result.sort((a, b) => {
            const pA = a.organization ? a.organization.period : "";
            const pB = b.organization ? b.organization.period : "";
            return pB.localeCompare(pA); // Periode terbaru di atas
        });
    }

    // 3. LOGIKA PAGINASI (Memotong array result)
    const totalPages = Math.ceil(result.length / pageSize);
    const start = currentPage * pageSize;
    const paginatedResult = result.slice(start, start + pageSize);

    // 4. RENDER KE TABEL
    tableBody.innerHTML = '';
    paginatedResult.forEach((u, index) => {
        const rowNum = start + index + 1;
        const isMe = GLOBAL_USER.id == u.id;
        tableBody.innerHTML += `
            <tr>
                <td>${rowNum}.</td>
                <td title="${u.name}"><a href="#" class="member-link-text" onclick="viewMemberProfile(${u.id}, 'kelola'); return false;">${u.name}</a></td>
                <td title="${u.email}">${u.email}</td>
                <td title="${u.position || 'Anggota'}">${u.position || 'Anggota'}</td>
                <td>${u.memberNumber || '-'}</td>
                <td>${u.gender === 'MALE' ? 'Laki-laki' : u.gender === 'FEMALE' ? 'Perempuan' : '-'}</td>
                <td title="${formatIndoDate(u.joinDate)}">${formatIndoDate(u.joinDate)}</td>
                <td class="action-cell">
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-start;">
                        <button onclick="openEditPositionModal(${u.id}, '${u.name}', '${u.position || 'Anggota'}')" class="btn-primary btn-small">Edit Jabatan</button>
                        <button onclick="openEditMemberNumberModal(${u.id}, '${u.name}', '${u.memberNumber || 'N/A'}')" class="btn-primary btn-small">Edit No Anggota</button>
                        ${!isMe ? `<button onclick="revokeMember(${u.id})" class="btn-danger btn-small">Cabut Keanggotaan</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    // 5. RENDER TOMBOL PAGINASI (Hanya jika data > 50)
    paginationArea.innerHTML = '';
    if (totalPages > 1) {
        paginationArea.innerHTML = `
            <button ${currentPage === 0 ? 'disabled' : ''} onclick="currentPage--; filterAndSortActiveMembers()" class="btn-secondary btn-small">« Prev</button>
            <span style="margin: 0 15px; font-weight: bold;">Halaman ${currentPage + 1} dari ${totalPages}</span>
            <button ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="currentPage++; filterAndSortActiveMembers()" class="btn-secondary btn-small">Next »</button>
        `;
    }
}


function renderPaginationButtons(pageData) {
    const controls = document.getElementById('paginationControls');
    controls.innerHTML = '';

    if (pageData.totalPages <= 1) return;

    // Tombol Previous
    const prevBtn = document.createElement('button');
    prevBtn.innerText = "« Prev";
    prevBtn.className = "btn-secondary btn-small";
    prevBtn.disabled = pageData.first;
    prevBtn.onclick = () => handlePagination(currentPage - 1);
    controls.appendChild(prevBtn);

    // Info Halaman
    const pageInfo = document.createElement('span');
    pageInfo.innerText = ` Halaman ${pageData.number + 1} dari ${pageData.totalPages} `;
    pageInfo.style.fontWeight = "bold";
    controls.appendChild(pageInfo);

    // Tombol Next
    const nextBtn = document.createElement('button');
    nextBtn.innerText = "Next »";
    nextBtn.className = "btn-secondary btn-small";
    nextBtn.disabled = pageData.last;
    nextBtn.onclick = () => handlePagination(currentPage + 1);
    controls.appendChild(nextBtn);
}

function handleSearchAndSort(newKeyword, newSortBy, newSortDirection) {
    if (newKeyword !== null) { currentKeyword = newKeyword; }
    if (newSortBy) { currentSortBy = newSortBy; }
    if (newSortDirection) { currentSortDirection = newSortDirection; }

    currentPage = 0;
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        filterAndSortActiveMembers();
    } else {
        document.getElementById('pimpinanMessage').innerText = "Error: Organisasi ID tidak ditemukan.";
    }
}

function handlePagination(pageNumber) {
    currentPage = pageNumber;
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        filterAndSortActiveMembers();
    }
}

function openEditPositionModal(targetUserId, targetName, currentPosition) {
    const modalHtml = `
        <div id="positionModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 102;">
            <div style="background: white; width: 400px; margin: 100px auto; padding: 25px; border-radius: 8px;">
                <h4>Edit Jabatan: ${targetName}</h4>
                <p>Jabatan Saat Ini: <b>${currentPosition}</b></p>
                
                <form id="positionForm">
                    <label for="newPosition">Jabatan Baru</label>
                    <input type="text" id="newPosition" value="${currentPosition}" required style="width: 100%; padding: 8px; margin-bottom: 15px;">
                    <input type="hidden" id="modalTargetUserId" value="${targetUserId}">
                    
                    <button type="submit">Simpan Jabatan</button>
                    <button type="button" onclick="closePositionModal()" style="background-color: #6c757d;">Batal</button>
                    <p id="positionModalMessage" style="margin-top: 10px; color: red;"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('main-content-area').insertAdjacentHTML('afterend', modalHtml);
    document.getElementById('positionForm').addEventListener('submit', handlePositionSubmit);
}

function closePositionModal() {
    const modal = document.getElementById('positionModal');
    if (modal) modal.remove();
}

function handlePositionSubmit(event) {
    event.preventDefault();
    const targetUserId = document.getElementById('modalTargetUserId').value;
    const newPosition = document.getElementById('newPosition').value;
    const pimpinanId = localStorage.getItem("CURRENT_USER_ID");
    const message = document.getElementById("positionModalMessage");

    message.innerText = `Menyimpan jabatan...`;
    message.style.color = "black";

    fetch(`/api/users/${pimpinanId}/position/${targetUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: newPosition })
    })
        .then(res => {
            if (!res.ok) throw new Error("Gagal update jabatan");
            return res.json();
        })
        .then(() => {
            showToast("Jabatan berhasil diperbarui", "success");
            // JANGAN render manual dari response, tapi panggil ulang data segar
            loadPimpinanDashboard(GLOBAL_USER);
            closePositionModal();
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat mengubah jabatan.";
        });
}

function openEditMemberNumberModal(targetUserId, targetName, currentMemberNumber) {
    const modalHtml = `
        <div id="memberNumberModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 103;">
            <div style="background: white; width: 400px; margin: 100px auto; padding: 25px; border-radius: 8px;">
                <h4>Edit Nomor Anggota: ${targetName}</h4>
                <p>Nomor Anggota Saat Ini: <b>${currentMemberNumber}</b></p>
                
                <form id="memberNumberForm">
                    <label for="newMemberNumber">Nomor Anggota Baru</label>
                    <input type="text" id="newMemberNumber" value="${currentMemberNumber === 'N/A' ? '' : currentMemberNumber}" required style="width: 100%; padding: 8px; margin-bottom: 15px;">
                    <input type="hidden" id="modalTargetUserIdNo" value="${targetUserId}">
                    
                    <button type="submit">Simpan No Anggota</button>
                    <button type="button" onclick="closeMemberNumberModal()" style="background-color: #6c757d;">Batal</button>
                    <p id="memberNumberModalMessage" style="margin-top: 10px; color: red;"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('main-content-area').insertAdjacentHTML('afterend', modalHtml);
    document.getElementById('memberNumberForm').addEventListener('submit', handleMemberNumberSubmit);
}

function closeMemberNumberModal() {
    const modal = document.getElementById('memberNumberModal');
    if (modal) modal.remove();
}

function handleMemberNumberSubmit(event) {
    event.preventDefault();
    const targetUserId = document.getElementById('modalTargetUserIdNo').value;
    const newMemberNumber = document.getElementById('newMemberNumber').value;
    const pimpinanId = localStorage.getItem("CURRENT_USER_ID");
    const message = document.getElementById("memberNumberModalMessage");

    message.innerText = `Menyimpan nomor anggota...`;
    message.style.color = "black";

    fetch(`/api/users/${pimpinanId}/member-number/${targetUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberNumber: newMemberNumber })
    })
        .then(res => {
            if (!res.ok) throw new Error("Gagal update nomor anggota");
            return res.json();
        })
        .then(() => {
            showToast("Nomor anggota berhasil diperbarui", "success");
            // Panggil ulang dashboard untuk sinkronisasi ulang tabel
            loadPimpinanDashboard(GLOBAL_USER);
            closeMemberNumberModal();
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat mengubah nomor anggota.";
        });
}

function loadHandoverPage() {
    updatePageTitle("Serah Terima Jabatan");
    history.pushState({ section: 'handover' }, "", "#handover");
    const container = document.getElementById('main-content-area');

    // Filter anggota aktif selain diri sendiri
    const candidates = CURRENT_ACTIVE_MEMBERS.filter(m => m.id != GLOBAL_USER.id && m.memberStatus === 'ACTIVE');

    if (candidates.length === 0) {
        container.innerHTML = `<h3>Tidak ada anggota aktif yang tersedia untuk menjadi pengganti.</h3>
                               <button onclick="loadPimpinanDashboard(GLOBAL_USER)" class="btn-secondary">Kembali</button>`;
        return;
    }

    const options = candidates.map(c => `<option value="${c.id}">${c.name} - ${c.position || 'Anggota'}</option>`).join('');

    container.innerHTML = `
        <div class="header-with-action">
            <h3>Serah Terima Jabatan Pimpinan Utama</h3>
            <p>Gunakan halaman ini untuk mengalihkan seluruh tanggung jawab pimpinan kepada anggota lain.</p>
        </div>
        <hr>
        <div class="card-section" style="max-width: 600px; margin: 20px 0;">
            <form id="handoverFormPage">
                <div class="form-group">
                    <label>Pilih Anggota Pengganti:</label>
                    <select id="targetLeaderId" class="form-control" required style="width:100%; padding:10px; margin-top:5px;">
                        <option value="">-- Cari Nama Anggota --</option>
                        ${options}
                    </select>
                </div>
                
                <div class="form-group" style="margin-top:20px;">
                    <label>Pesan Amanah Untuk Pimpinan Baru:</label>
                    <textarea id="handoverNote" rows="4" placeholder="Tuliskan pesan atau arahan singkat untuk pimpinan selanjutnya..."></textarea>
                </div>

                <div class="warning-box" style="background:#fff5f5; color:#c53030; padding:15px; border-radius:8px; border-left:4px solid #e53e3e; margin:20px 0;">
                    <strong>PENTING:</strong> Setelah menekan tombol konfirmasi, Anda akan otomatis turun menjadi <b>Anggota Biasa</b> dan kehilangan semua akses menu Kelola.
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-warning">Konfirmasi & Serah Terima</button>
                    <button type="button" onclick="loadPimpinanDashboard(GLOBAL_USER)" class="btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('handoverFormPage').addEventListener('submit', (e) => {
        e.preventDefault();
        const targetId = document.getElementById('targetLeaderId').value;
        const targetName = candidates.find(c => c.id == targetId).name;

        customConfirm(`Apakah Anda benar-benar yakin ingin menyerahkan jabatan pimpinan kepada ${targetName}?`, () => {
            fetch(`/api/users/${GLOBAL_USER.id}/handover/${targetId}`, { method: 'PUT' })
                .then(res => {
                    if (res.ok) {
                        showToast("Jabatan berhasil diserahterimakan.", "success");
                        setTimeout(() => window.location.reload(), 1500);
                    }
                });
        });
    });
}

function confirmHandover(targetId, targetName) {
    customConfirm(`⚠️ PERINGATAN: Anda akan menyerahkan jabatan Pimpinan kepada ${targetName}. Anda akan turun jabatan menjadi Anggota Biasa dan kehilangan akses Kelola. Lanjutkan?`, () => {
        const pimpinanId = GLOBAL_USER.id;
        fetch(`/api/users/${pimpinanId}/handover/${targetId}`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    showToast("Serah terima jabatan berhasil! Mengalihkan ke dashboard anggota...", "success");
                    setTimeout(() => location.reload(), 2000); // Reload untuk update role UI
                }
            });
    });
}

function revokeMember(userId) {
    const modalHtml = `
        <div id="revokeModal" class="confirm-overlay">
            <div class="confirm-box" style="width: 450px;">
                <h4 style="color: #d9534f;">Cabut Akses Anggota</h4>
                <p>Berikan alasan resmi pencabutan keanggotaan ini:</p>
                <textarea id="revokeReasonInput" rows="4" 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;"
                    placeholder="Masukkan alasan..."></textarea>
                <div class="confirm-buttons">
                    <button id="btnConfirmRevoke" class="btn-danger">Ya, Cabut</button>
                    <button onclick="document.getElementById('revokeModal').remove()" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('btnConfirmRevoke').onclick = () => {
        const reason = document.getElementById('revokeReasonInput').value;
        if (!reason.trim()) {
            showToast("Alasan wajib diisi!", "error");
            return;
        }

        fetch(`/api/users/${userId}/revoke?reason=${encodeURIComponent(reason)}`, { method: 'POST' })
            .then(res => {
                if (res.ok) {
                    showToast("Keanggotaan dicabut.", "success");
                    document.getElementById('revokeModal').remove();
                    loadPimpinanDashboard(GLOBAL_USER);
                }
            });
    };
}


function loadEditOrganizationPage() {
    updatePageTitle("Kelola Organisasi");
    const currentOrgId = GLOBAL_USER.organization ? GLOBAL_USER.organization.id : null;

    if (window.location.hash !== '#kelola-org') {
        history.pushState({ section: 'kelola-org' }, "Kelola Organisasi", "#kelola-org");
    }

    const container = document.getElementById('main-content-area');
    const org = GLOBAL_USER.organization;

    if (!org) {
        showToast("Anda belum terikat dengan organisasi manapun.", "error");
        return;
    }

    container.innerHTML = `
        <div class="header-with-action">
            <h3>Kelola Profil Organisasi</h3>
            <p>Perbarui informasi publik organisasi Anda di sini.</p>
        </div>
        <hr>
        <form id="fullOrgEditForm" class="profile-edit-form">
            <div class="grid-2-col">
                <div class="form-group">
                    <label>Nama Organisasi</label>
                    <input type="text" id="editOrgName" value="${org.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Periode Kepengurusan</label>
                    <input type="text" id="editOrgPeriod" value="${org.period || ''}" placeholder="Contoh: 2024/2025">
                </div>
                <div class="form-group">
                    <label>Tanggal Berdiri</label>
                    <input type="date" id="editOrgDate" value="${org.establishedDate || ''}" max="9999-12-31">
                </div>
                <div class="form-group">
                    <label>Bidang</label>
                    <input type="text" id="editOrgField" value="${org.field || ''}" placeholder="Pendidikan, Sosial, dll.">
                </div>
                <div class="form-group">
                    <label>Lingkup</label>
                    <input type="text" id="editOrgScope" value="${org.scope || ''}" placeholder="Nasional, Kampus, dll.">
                </div>
            </div>

            <div class="form-group">
                <label>Deskripsi Singkat</label>
                <textarea id="editOrgDesc" rows="3">${org.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label>Kriteria Keanggotaan (Aturan/Syarat)</label>
                <textarea id="editOrgRequirement" rows="4" placeholder="Sebutkan syarat calon anggota, misal: Minimal Semester 3, Memiliki laptop, dll.">${org.membershipRequirement || ''}</textarea>
            </div>

            <div class="form-group">
                <label>Visi & Misi</label>
                <textarea id="editOrgVision" rows="5">${org.visionMission || ''}</textarea>
            </div>

            <div class="grid-2-col">
                <div class="form-group">
                    <label>Alamat Kantor</label>
                    <input type="text" id="editOrgAddress" value="${org.address || ''}">
                </div>
                <div class="form-group">
                    <label>Tautan (Website/Sosmed)</label>
                    <input type="url" id="editOrgLink" value="${org.externalLink || ''}" placeholder="https://...">
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-success">Simpan Perubahan</button>
                <button type="button" onclick="goBackFromProfile()" class="btn-secondary">Batal</button>
            </div>

            <div class="danger-zone" style="margin-top: 50px; border: 1px solid #feb2b2; padding: 20px; border-radius: 8px; background: #fff5f5;">
                <h4 style="color: #c53030;">Zona Bahaya: Pembubaran Organisasi</h4>
                <p>Jika organisasi sudah tidak aktif, Anda dapat mengajukan penghapusan ke Admin.</p>
                <button onclick="openRequestDeleteOrgModal()" class="btn-danger">Ajukan Hapus Organisasi</button>
            </div>
        </form>
    `;

    document.getElementById('fullOrgEditForm').addEventListener('submit', handleFullOrgUpdate);
}

function handleFullOrgUpdate(event) {
    event.preventDefault();
    const orgId = GLOBAL_USER.organization.id;
    const pimpinanId = GLOBAL_USER.id;

    const updatedData = {
        name: document.getElementById('editOrgName').value,
        period: document.getElementById('editOrgPeriod').value,
        establishedDate: document.getElementById('editOrgDate').value,
        field: document.getElementById('editOrgField').value,
        scope: document.getElementById('editOrgScope').value,
        description: document.getElementById('editOrgDesc').value,
        visionMission: document.getElementById('editOrgVision').value,
        address: document.getElementById('editOrgAddress').value,
        externalLink: document.getElementById('editOrgLink').value,
        membershipRequirement: document.getElementById('editOrgRequirement').value,
        status: "ACTIVE"
    };

    //  Ganti ke 'PUT' atau 'PATCH' sesuai yang Anda definisikan di Controller Java
    fetch(`/api/organizations/${orgId}?pimpinanId=${pimpinanId}`, {
        method: 'PUT', // Jika masih error 405, ganti menjadi 'PATCH'
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
        .then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Gagal memperbarui data organisasi.");
            }
            return res.json();
        })
        .then(updatedOrg => {
            GLOBAL_USER.organization = updatedOrg;
            showToast("Profil organisasi berhasil diperbarui!", "success");
            // Segarkan sidebar untuk melihat perubahan nama (jika ada)
            renderSidebar(GLOBAL_USER);
            navigateTo('orgProfile-' + orgId, () => loadOrganizationProfile(orgId));
        })
        .catch(err => {
            console.error(err);
            showToast("Error: " + err.message, "error");
        });
}

function openRequestDeleteOrgModal() {
    const modalHtml = `
        <div id="deleteOrgModal" class="confirm-overlay">
            <div class="confirm-box">
                <h4>Ajukan Penghapusan Organisasi</h4>
                <p>Berikan alasan kuat mengapa organisasi ini harus dihapus dari sistem:</p>
                <textarea id="deleteOrgReason" rows="4" style="width:100%; margin:15px 0; padding:10px;"></textarea>
                <div class="confirm-buttons">
                    <button onclick="submitDeleteRequest()" class="btn-danger">Kirim Permintaan</button>
                    <button onclick="document.getElementById('deleteOrgModal').remove()" class="btn-secondary">Batal</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitDeleteRequest() {
    const reason = document.getElementById('deleteOrgReason').value;
    if (!reason.trim()) return showToast("Alasan wajib diisi!", "error");

    const orgId = GLOBAL_USER.organization.id;
    const pimpinanId = GLOBAL_USER.id;

    fetch(`/api/organizations/${orgId}/request-delete?pimpinanId=${pimpinanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason })
    })
        .then(async res => {
            const data = await res.json();
            if (res.ok) {
                //  GANTI HANYA DENGAN PESAN INI
                showToast("Permintaan penghapusan berhasil dikirim ke Admin.", "success");
                document.getElementById('deleteOrgModal').remove();

                // Opsional: Muat ulang profil tanpa memicu toast "berhasil diperbarui"
                loadOrganizationProfile(orgId);
            } else {
                showToast(data.message || "Gagal mengirim permintaan", "error");
            }
        })
        .catch(err => showToast("Gagal: " + err.message, "error"));
}

function loadActive(orgId) {
    const tableBody = document.querySelector("#activeTable tbody");
    const pimpinanMsg = document.getElementById('pimpinanMessage');
    const paginationControls = document.getElementById('paginationControls');

    if (!tableBody) return;

    const size = 20;
    const endpoint = `/api/users/organization/${orgId}/active/search?keyword=${currentKeyword}&page=${currentPage}&size=${size}&sortBy=${currentSortBy}&sortDirection=${currentSortDirection}`;

    tableBody.innerHTML = `<tr><td colspan="4">Loading data (${currentPage + 1})...</td></tr>`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat daftar anggota aktif');
            return res.json();
        })
        .then(pageData => {
            const users = pageData.content;
            const startIndex = pageData.number * pageData.size;

            if (pimpinanMsg) {
                pimpinanMsg.innerText = `Anggota Aktif (Total: ${pageData.totalElements})`;
            }

            tableBody.innerHTML = '';

            if (users.length === 0 && pageData.totalElements === 0) {
                tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Data tidak ditemukan.</td></tr>`;
                paginationControls.innerHTML = '';
                return;
            }

            users.forEach((u, index) => { 
                const rowNumber = startIndex + index + 1;
                const isMe = GLOBAL_USER.id != u.id;
                let handoverBtn = (!isMe) ? `<button onclick="confirmHandover(${u.id}, '${u.name}')" class="btn-warning btn-small">Tunjuk Pimpinan</button>` : '';
                let revokeBtn = (!isMe) ? `<button onclick="revokeMember(${u.id})" class="btn-danger btn-small">Cabut</button>` : '';
                const genderDisp = u.gender === 'MALE' ? 'Laki-laki' : u.gender === 'FEMALE' ? 'Perempuan' : '-';

                tableBody.innerHTML += `
                    <tr>
                        <td>${rowNumber}.</td>
                        <td><a href="#" onclick="viewMemberProfile(${u.id}, 'kelola'); return false;">${u.name}</a></td>
                        <td>${u.email}</td>
                        <td>${u.position || 'Anggota'}</td>
                        <td>${u.joinDate || 'N/A'}</td>
                        <td>${u.memberNumber || 'N/A'}</td>
                        <td>${genderDisp}</td>
                        <td class="action-cell"> 
                            <button onclick="openEditPositionModal(${u.id}, '${u.name}', '${u.position || 'Anggota Biasa'}')" class="btn-primary btn-small">Edit Jabatan</button>
                            <button onclick="openEditMemberNumberModal(${u.id}, '${u.name}', '${u.memberNumber || 'N/A'}')" class="btn-primary btn-small">Edit No</button>

                            ${isMe ? `<button onclick="revokeMember(${u.id})" class="btn-danger btn-small">Cabut Anggota</button>` : ''}
                            <div style="display:flex; gap:5px;">
                                <button onclick="openEditPositionModal(${u.id}, ...)" class="btn-primary btn-small">Jabatan</button>
                                ${handoverBtn}  
                                ${revokeBtn}
                            </div>
                        </td>
                    </tr>
                `;
            });

            renderPaginationButtons(pageData);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            document.querySelector("#activeTable tbody").innerHTML = `<tr><td colspan="4" style="color: red;">${err.message}</td></tr>`;
        });
}


// #########################################################################
// ### [09] ADMIN SYSTEM DASHBOARD                                       ###
// #########################################################################
// Kontrol admin sistem: CRUD Organisasi dan Penetapan Pimpinan.

function loadAdminDashboard(user) {
    const container = document.getElementById('main-content-area');
    preventDefault(null); // Fix bug event handler

    container.innerHTML = `
        <h3>Area Admin: Sistem Struktura</h3>
        <p id="adminMessage" style="margin-bottom: 15px;"></p>

        <div class="card-section" style="margin-top: 20px;">
            <h4>Kelola Organisasi & Tetapkan Pimpinan</h4>
            <table id="orgListTable" class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nama Organisasi<th>Jumlah Anggota</th></th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody><tr><td colspan="4">Memuat daftar organisasi...</td></tr></tbody>
            </table>
        </div>
        
        <div id="assignPimpinanModal" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100;">
            <div style="background: white; width: 400px; margin: 100px auto; padding: 20px; border-radius: 5px;">
                <h4>Tetapkan Pimpinan untuk Organisasi: <span id="modalOrgName"></span></h4>
                <p>Masukkan ID User yang akan dijadikan Pimpinan:</p>
                <input type="number" id="targetUserId" placeholder="ID User Target (Contoh: 1, 3, 5)" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
                <button onclick="submitAssignPimpinan()">Tetapkan Pimpinan</button>
                <button onclick="closeAssignPimpinanModal()">Batal</button>
                <p id="assignMessage" style="color:red; margin-top: 10px;"></p>
            </div>
        </div>
    `;

    loadOrganizationList();
}

function loadOrganizationList() {
    // FUNGSI INI DIGUNAKAN OLEH ADMIN DASHBOARD untuk memuat daftar org
    const tableBody = document.querySelector("#orgListTable tbody");
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="4">Memuat daftar organisasi untuk Admin...</td></tr>`;

    fetch('/api/organizations')
        .then(res => {
            if (!res.ok) throw new Error("Gagal memuat daftar organisasi.");
            return res.json();
        })
        .then(async organizations => {
            tableBody.innerHTML = '';
            for (const org of organizations) {
                // Fetch detail untuk mendapatkan memberCount
                const detailRes = await fetch(`/api/organizations/${org.id}/details`);
                const detailData = await detailRes.json();
                const memberCount = detailData.memberCount || 0;

                tableBody.innerHTML += `
                    <tr>
                        <td>${org.id}</td>
                        <td>
                            <a href="#" class="org-link-admin" onclick="loadOrganizationProfile(${org.id}, event)" 
                               style="color: #2b6cb0; font-weight: bold; text-decoration: none;">
                               ${org.name}
                            </a>
                        </td>
                        <td style="text-align:center;"><span class="badge-count">${memberCount} Anggota</span></td>
                        <td>${org.status}</td>
                        <td>
                            <div style="display:flex; gap:5px;">
                                <button onclick="openAssignPimpinanModal(${org.id}, '${org.name}')" class="btn-primary btn-small">Assign</button>
                                <button onclick="confirmDeleteOrg(${org.id}, '${org.name}', ${memberCount})" class="btn-danger btn-small">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(err => {
            tableBody.innerHTML = `<tr><td colspan="4" style="color: red;">[Error]: ${err.message}</td></tr>`;
        });
}

function handleCreateOrganization(event) {
    event.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const messageElement = document.getElementById("adminMessage");
    messageElement.innerText = "Membuat organisasi...";
    messageElement.style.color = "black";

    fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, description: description })
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal membuat organisasi.") });
            return res.json();
        })
        .then(org => {
            messageElement.style.color = "green";
            messageElement.innerText = `Organisasi "${org.name}" (ID: ${org.id}) berhasil dibuat.`;
            document.getElementById("createOrgForm").reset();
            loadOrganizationList(); // Refresh list
        })
        .catch(err => {
            messageElement.style.color = "red";
            messageElement.innerText = `[Gagal] ${err.message}`;
        });
}

function openAssignPimpinanModal(orgId, orgName) {
    currentOrgIdToAssign = orgId;
    const modal = document.getElementById("assignPimpinanModal");
    modal.style.display = 'block';

    modal.innerHTML = `
        <div style="background: white; width: 550px; margin: 80px auto; padding: 30px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); border-top: 5px solid #3182ce;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h4 style="margin:0; color: #2d3748; font-size: 1.25rem;">Tetapkan Pimpinan Baru</h4>
                <button onclick="closeAssignPimpinanModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#a0aec0;">&times;</button>
            </div>
            <p style="color: #718096; font-size:0.95rem; margin-bottom: 20px;">Organisasi: <b style="color: #2b6cb0;">${orgName}</b></p>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:8px; font-weight:600; color:#4a5568;">Cari Calon Pimpinan (Nama/Email):</label>
                <input type="text" id="searchUserAdmin" placeholder="Ketik minimal 3 huruf untuk mencari..." 
                       oninput="handleLiveSearchUser(this.value)" 
                       style="width: 100%; padding: 12px; border: 2px solid #edf2f7; border-radius: 10px; font-size: 1rem; outline:none; transition: border-color 0.2s;">
            </div>
            
            <div id="searchResultArea" style="max-height: 250px; overflow-y: auto; margin-top: 5px; border: 1px solid #e2e8f0; border-radius: 10px; display:none; background:#fff;">
                <ul id="userSuggestions" style="list-style:none; padding:0; margin:0;"></ul>
            </div>

            <div id="selectedUserPreview" style="display:none; margin-top:20px; padding:15px; background:#f0fff4; border:1px solid #c6f6d5; border-radius:10px; animation: slideDown 0.3s ease;">
                <p style="margin:0 0 5px 0; font-size:0.8rem; color:#38a169; text-transform:uppercase; font-weight:bold;">User Terpilih:</p>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div id="userInisial" style="width:40px; height:40px; border-radius:50%; background:#38a169; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;"></div>
                    <div>
                        <b id="displaySelectedName" style="color: #2d3748; font-size:1.1rem;"></b><br>
                        <small id="displaySelectedEmail" style="color: #718096;"></small>
                    </div>
                </div>
                <input type="hidden" id="targetUserId">
            </div>

            <div style="margin-top: 30px; display:flex; gap:12px;">
                <button id="btnSubmitAssign" onclick="submitAssignPimpinan()" class="btn-primary" disabled style="flex:2; padding: 12px; font-weight:bold;">✅ Konfirmasi Jabatan</button>
                <button onclick="closeAssignPimpinanModal()" class="btn-secondary" style="flex:1; padding: 12px;">Batal</button>
            </div>
            <p id="assignMessage" style="color:red; margin-top: 15px; font-size:0.9rem; text-align:center;"></p>
        </div>
    `;
}

async function handleLiveSearchUser(keyword) {
    const resultArea = document.getElementById('searchResultArea');
    const suggestionList = document.getElementById('userSuggestions');

    if (keyword.length < 3) {
        resultArea.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);

        // Cek apakah respon sukses (200 OK)
        if (!res.ok) {
            const errorMsg = await res.text();
            console.error("Server Error:", errorMsg);
            return;
        }

        const users = await res.json();

        // Pastikan 'users' adalah Array sebelum memproses
        if (!Array.isArray(users)) {
            console.error("Format data bukan array:", users);
            return;
        }

        suggestionList.innerHTML = '';
        resultArea.style.display = 'block';

        if (users.length === 0) {
            suggestionList.innerHTML = '<li style="padding:10px; color:#999;">User tidak ditemukan...</li>';
            return;
        }

        users.forEach(u => {
            suggestionList.innerHTML += `
                <li onclick="selectUserForAssign(${u.id}, '${u.name}', '${u.email}')" 
                    style="padding:10px; border-bottom:1px solid #eee; cursor:pointer; transition: 0.2s;">
                    <div style="font-weight:bold; color:#2d3748;">${u.name}</div>
                    <div style="font-size:0.8rem; color:#718096;">${u.email}</div>
                </li>`;
        });
    } catch (err) {
        console.error("Gagal cari user:", err);
    }
}

function selectUserForAssign(id, name, email) {
    document.getElementById('targetUserId').value = id;
    document.getElementById('displaySelectedName').innerText = name;
    document.getElementById('displaySelectedEmail').innerText = email;

    document.getElementById('selectedUserPreview').style.display = 'block';
    document.getElementById('searchResultArea').style.display = 'none';
    document.getElementById('searchUserAdmin').value = name;
    document.getElementById('btnSubmitAssign').disabled = false;
}

function closeAssignPimpinanModal() {
    document.getElementById("assignPimpinanModal").style.display = 'none';
    currentOrgIdToAssign = null;
}

function submitAssignPimpinan() {
    const targetUserId = document.getElementById("targetUserId").value;
    const orgId = currentOrgIdToAssign;
    const adminId = localStorage.getItem("CURRENT_USER_ID");
    const assignMessageElement = document.getElementById("assignMessage");

    if (!targetUserId || !orgId) {
        assignMessageElement.innerText = "ID User atau Organisasi tidak valid.";
        return;
    }

    assignMessageElement.innerText = "Memproses penetapan Pimpinan...";
    assignMessageElement.style.color = "black";

    fetch(`/api/organizations/${orgId}/assign-pimpinan/${targetUserId}?adminId=${adminId}`, {
        method: 'PUT'
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal menetapkan Pimpinan.") });
            return res.json();
        })
        .then(user => {
            assignMessageElement.style.color = "green";
            assignMessageElement.innerText = `User ${user.name} (ID: ${user.id}) berhasil ditetapkan sebagai PIMPINAN Organisasi ID ${orgId}.`;

            setTimeout(() => {
                closeAssignPimpinanModal();
                const adminMessage = document.getElementById("adminMessage");
                showToast("Pimpinan berhasil ditetapkan: ${user.name} untuk organisasi ${orgId}.", "success");
                adminMessage.style.color = "green";
                adminMessage.innerText = `Pimpinan berhasil ditetapkan: ${user.name} untuk organisasi ${orgId}.`;
                loadOrganizationList(); // Refresh list
            }, 1500);
        })
        .catch(err => {
            showToast("User ini sudah menjabat sebagai Pimpinan", "error");
            assignMessageElement.style.color = "red";
            assignMessageElement.innerText = `User ini sudah menjabat sebagai Pimpinan`;
        });
}

function confirmDeleteOrg(orgId, orgName) {
    customConfirm(`⚠️ Apakah Anda yakin ingin menghapus organisasi "${orgName}"? Tindakan ini permanen.`, () => {
        const adminId = GLOBAL_USER.id;
        fetch(`/api/organizations/${orgId}?adminId=${adminId}`, { method: 'DELETE' })
            .then(async res => {
                if (res.ok) {
                    showToast("Organisasi berhasil dihapus.", "success");
                    loadOrganizationList(); // Refresh tabel
                } else {
                    //  PERBAIKAN: Ambil hanya teks message-nya saja agar rapi
                    const errorMsg = responseData.message || "Terjadi kesalahan sistem";
                    showToast(errorMsg, "error");
                }
            })
            .catch(err => {
                showToast("Organisasi masih memiliki Anggota", "error");
            });
    });
}

// #########################################################################
// ### [10] INFO & HELP PAGES                                            ###
// #########################################################################
// Halaman informasi tambahan dan pusat bantuan.


function loadAboutPage() {
    updatePageTitle("Tentang Kami");
    const container = document.getElementById("main-content-area");
    const sideInfo = document.getElementById("side-info-area");
    const dashboardGrid = document.querySelector(".dashboard-grid");

    if (!container) return;
    history.pushState({ section: 'about' }, "Tentang Kami", "#about");

    //  Pastikan sidebar muncul dan layout grid normal 75/25
    if (sideInfo) sideInfo.style.display = 'block';
    if (dashboardGrid) dashboardGrid.style.gridTemplateColumns = '1fr 300px';

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease; width: 100%;">
            <div style="margin-bottom:30px;">
                <h2 style="font-size: 2rem; color: #2d3748; margin-bottom:10px;">Tentang Struktura</h2>
                <div style="width: 50px; height: 4px; background: #3182ce; border-radius:2px;"></div>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 30px; align-items: stretch; flex-wrap: nowrap;">
                <div class="card-section" style="flex: 2; margin: 0; padding: 25px; border-top: 4px solid #3182ce;">
                    <p style="line-height: 1.7; color: #4a5568; text-align: justify;">
                        <b>Struktura</b> adalah platform manajemen organisasi modern yang dirancang untuk meningkatkan efisiensi 
                        administrasi, transparansi program kerja, dan kolaborasi antar anggota secara digital. Aplikasi ini dibangun 
                        sebagai solusi manajemen terpadu di era digital 2025.
                    </p>
                </div>
                <div class="card-section" style="flex: 1; margin: 0; padding: 25px; background: #ebf8ff; border: 1px solid #bee3f8;">
                    <h4 style="color: #2b6cb0; margin-bottom: 10px;">Visi Kami</h4>
                    <p style="color: #2c5282; font-style: italic; font-size: 0.95rem;">"Menjadi standar aplikasi manajemen organisasi yang mengedepankan keamanan data dan kemudahan kolaborasi."</p>
                </div>
            </div>
            
            <div class="card-section" style="padding: 25px; display: flex; align-items: center; gap: 25px; border-left: 5px solid #3182ce;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #3182ce; color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; flex-shrink: 0;">
                    PV
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; color: #2d3748;">Pangeran Valerensco Rivaldi Hutabarat</h3>
                    <p style="margin: 5px 0; color: #3182ce; font-weight: 600;">Lead Developer - S1 Teknik Informatika</p>
                    <p style="margin: 0; color: #718096; font-size: 0.9rem;">Fokus pada pengembangan ekosistem digital organisasi menggunakan Java Spring Boot dan arsitektur Sistem Informasi modern.</p>
                </div>
            </div>
        </div>
    `;
}

function loadHelpPage() {
    updatePageTitle("Pusat Bantuan");
    const container = document.getElementById("main-content-area");
    const sideInfo = document.getElementById("side-info-area");
    const dashboardGrid = document.querySelector(".dashboard-grid");

    if (!container) return;
    history.pushState({ section: 'help' }, "Pusat Bantuan", "#help");

    if (sideInfo) sideInfo.style.display = 'block';
    if (dashboardGrid) dashboardGrid.style.gridTemplateColumns = '1fr 300px';

    container.innerHTML = `
        <div style="animation: fadeIn 0.5s ease;">
            <h2 style="margin-bottom: 25px; color: #2d3748;">Pusat Bantuan & Panduan</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div class="card-section" style="margin:0; border-left: 4px solid #38a169; background: #f0fff4;">
                    <b style="color: #22543d; display:block; margin-bottom:8px;">📋 Pendaftaran</b>
                    <p style="font-size: 0.9rem; color: #276749;">Cari organisasi aktif di menu 'Daftar Organisasi', lalu klik 'Gabung'. Pastikan data profil Anda sudah lengkap.</p>
                </div>
                <div class="card-section" style="margin:0; border-left: 4px solid #dd6b20; background: #fffaf0;">
                    <b style="color: #742a2a; display:block; margin-bottom:8px;">🚀 Program Kerja</b>
                    <p style="font-size: 0.9rem; color: #9c4221;">PIC dapat mengelola status proker mulai dari 'Planned' hingga 'Completed' setelah mendapatkan persetujuan pimpinan.</p>
                </div>
            </div>

            <div class="card-section" style="background: #f7fafc; border: 1px solid #e2e8f0;">
                <h3 style="margin-bottom: 15px; color: #2d3748;">📩 Hubungi Tim Admin</h3>
                <p style="color: #718096; font-size: 0.9rem; margin-bottom: 15px;">Punya kendala teknis? Kirimkan pesan langsung kepada administrator sistem.</p>
                <textarea id="helpMessageInput" placeholder="Tuliskan detail kendala Anda di sini..." 
                          style="width:100%; height:120px; padding:15px; border-radius:8px; border:1px solid #cbd5e0; margin-bottom:15px; font-family:inherit;"></textarea>
                <button onclick="submitHelpRequest()" class="btn-primary" style="width:100%; padding:12px; font-weight:bold;">Kirim Laporan Bantuan</button>
            </div>
        </div>
    `;
}

function submitHelpRequest() {
    const msg = document.getElementById("helpMessageInput").value;
    if (!msg.trim()) return showToast("Pesan tidak boleh kosong", "error");

    const userName = GLOBAL_USER.name;

    fetch(`/api/notifications/to-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `PESAN_BANTUAN dari ${userName}: ${msg}` })
    }).then(() => {
        showToast("Pesan bantuan telah dikirim ke Admin!", "success");
        document.getElementById("helpMessageInput").value = "";
    }).catch(err => showToast("Gagal mengirim pesan", "error"));
}

function loadNotificationPage(page = 0) {
    updatePageTitle("Pemberitahuan");
    if (window.location.hash !== '#notifications') {
        history.pushState({ section: 'notifications' }, "Pemberitahuan", "#notifications");
    }

    // 1. Tandai semua sudah dibaca di server
    fetch(`/api/notifications/user/${GLOBAL_USER.id}/read-all`, { method: 'PUT' })
        .then(() => {
            const badge = document.getElementById('notifBadge');
            if (badge) {
                badge.style.display = 'none';
                badge.textContent = '0';
            }
        });

    const container = document.getElementById('main-content-area');
    container.innerHTML = `<h3>Pemberitahuan</h3><hr><div id="notifList">Memuat...</div><div id="notifPagination" style="margin-top:20px; display:flex; gap:10px; align-items:center;"></div>`;

    // 2. Gunakan endpoint paged
    fetch(`/api/notifications/user/${GLOBAL_USER.id}/paged?page=${page}&size=10`)
        .then(res => res.json())
        .then(data => { // 'data' sekarang adalah objek Page dari Spring
            const list = document.getElementById('notifList');
            const notifications = data.content; // List notifikasi ada di field .content

            if (!notifications || notifications.length === 0) {
                list.innerHTML = '<p class="text-muted">Tidak ada pemberitahuan.</p>';
                document.getElementById('notifPagination').innerHTML = '';
                return;
            }

            list.innerHTML = notifications.map(n => {
                let displayMessage = n.message;
                let clickAction = '';
                let borderStyle = 'border-left: 4px solid #eee;';

                // --- LOGIKA KLIK KHUSUS ROLE ADMIN ---
                if (GLOBAL_USER.role === 'ADMIN') {
                    // Semua notifikasi Admin (Pesan Bantuan, Resign Pimpinan, Request Hapus, Org Baru) 
                    // akan diarahkan ke Dashboard Admin
                    clickAction = `onclick="navigateTo('dashboard', () => loadAdminDashboard(GLOBAL_USER))"`;
                    borderStyle = 'border-left: 4px solid #3182ce; cursor: pointer;'; // Warna biru Admin

                    // Membersihkan awalan kode pesan agar tampilan lebih rapi bagi Admin
                    displayMessage = displayMessage
                        .replace("PESAN_BANTUAN dari ", "📩 <b>Pesan Bantuan:</b> ")
                        .replace("RESIGN_PIMPINAN: ", "👤 <b>Pimpinan Ingin Resign:</b> ")
                        .replace("DELETE_REQUEST:", "⚠️ <b>Permintaan Hapus Org ID:</b> ")
                        .replace("ORGANISASI_BARU: ", "🏢 <b>Organisasi Baru:</b> ")
                        .replace("NEW_ORG_REQUEST:", "🆕 <b>Pendaftaran Baru Org ID:</b> ");
                } else {
                    // 1. Notifikasi Status Proker (Untuk PIC & Pengaju)
                    if (n.message.startsWith("PROKER_STATUS:")) {
                        const msgOnly = n.message.split(":")[1];
                        displayMessage = `<b>Update Proker:</b> ${msgOnly}`;
                        // Membawa Pengaju ke halaman program kerja untuk melihat status terbarunya
                        clickAction = `onclick="navigateTo('proker', () => loadProkerPage())"`;
                        borderStyle = 'border-left: 4px solid #ecc94b; cursor: pointer;'; // Kuning untuk info status
                    }

                    // 2. Notifikasi Pimpinan: Proker Selesai (Bisa diklik)
                    else if (n.message.startsWith("PROKER_FINISH:")) {
                        const parts = n.message.split(":");
                        displayMessage = `<b>Laporan Proker:</b> ${parts[2]} <br><small style="color:blue;">(Klik untuk lihat laporan hasil)</small>`;
                        clickAction = `onclick="navigateTo('proker', () => { loadProkerPage(); setTimeout(() => openProkerDetailModal(${parts[1]}), 500); })"`;
                        borderStyle = 'border-left: 4px solid #2d3748; cursor: pointer;'; // Abu gelap untuk selesai
                    }
                    // Deteksi Tipe Notifikasi untuk Warna Garis Samping
                    else if (n.message.startsWith("NEW_MEMBER_REQUEST:")) {
                        displayMessage = `<b>Permintaan Keanggotaan:</b> ${n.message.split(":")[1]} <br><small style="color:blue;">(Klik untuk proses)</small>`;
                        clickAction = `onclick="navigateTo('kelola', () => loadPimpinanDashboard(GLOBAL_USER))"`;
                        borderStyle = 'border-left: 4px solid #4299e1; cursor: pointer;'; // Biru
                    }
                    else if (n.message.startsWith("PROKER_NEW:")) {
                        const parts = n.message.split(":");
                        displayMessage = `<b>Pengajuan Proker Baru:</b> ${parts[2]} <br><small style="color:blue;">(Klik untuk lihat detail)</small>`;
                        clickAction = `onclick="navigateTo('proker', () => { loadProkerPage(); setTimeout(() => openProkerDetailModal(${parts[1]}), 500); })"`;
                        borderStyle = 'border-left: 4px solid #48bb78; cursor: pointer;'; // Hijau
                    }
                    else if (n.message.includes("PROKER_APPROVED") || n.message.includes("PROKER_REJECTED")) {
                        clickAction = `onclick="navigateTo('proker', () => loadProkerPage())"`;
                        borderStyle = 'border-left: 4px solid #ecc94b; cursor: pointer;'; // Kuning
                    }
                    else if (n.message.startsWith("NEW_RESIGN_REQUEST:")) {
                        displayMessage = `<b>Permintaan Keluar:</b> ${n.message.split(":")[1]} <br><small style="color:red;">(Segera proses di Kelola Anggota)</small>`;
                        // Klik notif langsung ke halaman Kelola Anggota
                        clickAction = `onclick="navigateTo('kelola', () => loadPimpinanDashboard(GLOBAL_USER))"`;
                        borderStyle = 'border-left: 4px solid #e53e3e; cursor: pointer;'; // Merah untuk resign
                    }
                    else if (n.message.startsWith("NEW_ORG_REQUEST:")) {
                        const orgId = n.message.split(":")[1];
                        displayMessage = `<b>Pendaftaran Baru:</b> ${n.message.split(":")[2]}`;
                        clickAction = `onclick="loadOrganizationProfile(${orgId}, event)"`;
                    } else if (n.message.startsWith("HANDOVER_INFO:")) {
                        const orgId = n.message.split(":")[1];
                        displayMessage = `<b>Pergantian Pimpinan:</b> Organisasi ID ${orgId}`;
                        clickAction = `onclick="loadOrganizationProfile(${orgId}, event)"`;
                    }
                }

                return `
                    <div class="card-section notif-item-card ${n.isRead ? '' : 'unread'}" ${clickAction} 
                        style="margin-bottom:12px; padding:15px; border-radius:10px; ${borderStyle} 
                                background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.3s ease;">
                        <p style="margin:0; font-size: 0.95rem; color: #333;">${displayMessage}</p>
                        <small style="color: #888;">${formatIndoDate(n.createdAt)}</small>
                    </div>
                `;
            }).join('');

            // 3. Render Tombol Pagination
            const paginContainer = document.getElementById('notifPagination');
            paginContainer.innerHTML = `
                <button class="btn-secondary" onclick="loadNotificationPage(${page - 1})" ${data.first ? 'disabled' : ''}>Prev</button>
                <span>Halaman ${page + 1} dari ${data.totalPages}</span>
                <button class="btn-secondary" onclick="loadNotificationPage(${page + 1})" ${data.last ? 'disabled' : ''}>Next</button>
            `;
        })
        .catch(err => console.error("Gagal memuat notifikasi", err));
}

function fetchUnreadNotifCount() {
    fetch(`/api/notifications/user/${GLOBAL_USER.id}/unread-count`)
        .then(res => res.json())
        .then(count => {
            const badge = document.getElementById('notifBadge');
            if (badge && count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            }
        });
}