// File: dashboard.js (ROMBAK TOTAL & PERBAIKAN BUG)

let currentPage = 0; // Untuk Pimpinan: Anggota Aktif
let currentSortBy = 'name';
let currentSortDirection = 'ASC';
let currentKeyword = '';

let orgCurrentPage = 0; // Untuk Semua Role: Daftar Organisasi
let orgCurrentKeyword = '';
let orgCurrentSortBy = 'name';
let orgCurrentSortDirection = 'ASC';

const userId = localStorage.getItem("CURRENT_USER_ID");
let GLOBAL_USER = {}; // 🛑 VARIABEL GLOBAL USER LENGKAP

// =========================================================================
// === INIT & CORE ROUTING =================================================
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.container');
    mainContainer.innerHTML = `
        <div class="dashboard-grid">
            <div class="main-content" id="main-content-area"><h3>Memuat data...</h3></div>
            <div class="side-info" id="side-info-area"></div>
        </div>
    `;

    // 1. Ambil data user lengkap
    fetch(`/api/users/${userId}`)
        .then(res => {
            if (!res.ok) { logout(); throw new Error("User not found"); }
            return res.json();
        })
        .then(user => {
            GLOBAL_USER = user; // 🛑 SIMPAN DATA LENGKAP DI GLOBAL

            // Simpan status dan email yang benar ke localStorage
            localStorage.setItem("CURRENT_USER_STATUS", user.memberStatus);
            localStorage.setItem("CURRENT_USER_NAME", user.name);
            localStorage.setItem("CURRENT_USER_EMAIL", user.email); // 🛑 FIX: Email tersimpan!

            renderSidebar(user); // Render sidebar dengan data user
            loadDefaultLanding(null, user); // Muat konten default
        })
        .catch(err => {
            document.getElementById("main-content-area").innerHTML =
                `<p class="text-error">Gagal memuat data. ${err.message}. Silakan <a href="#" onclick="logout()">Login ulang</a>.</p>`;
        });
});

function renderSidebar(user) {
    const sideInfoArea = document.getElementById("side-info-area");
    const orgName = user.organization ? user.organization.name : 'Belum Ada';

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
                <li><a href="#" onclick="loadDefaultLanding(event, GLOBAL_USER)">Dashboard Utama</a></li>
                <li><a href="#" onclick="loadOrgListPage(event, GLOBAL_USER)">Daftar Organisasi</a></li> 
            </ul>
        </div>
    `;

    const mainMenu = document.getElementById("main-menu");
    if (user.role === "ADMIN") {
        mainMenu.innerHTML += `<li><a href="#" onclick="loadAdminDashboard(GLOBAL_USER, event)">Kelola Admin</a></li>`;
    } else if (user.role === "PIMPINAN") {
        mainMenu.innerHTML += `<li><a href="#" onclick="loadPimpinanDashboard(GLOBAL_USER, event)">Kelola Anggota</a></li>`;
    }
}

// -------------------------------------------------------------------------
// === HANDLER UTAMA (Routing Sidebar) =====================================
// -------------------------------------------------------------------------
// =========================================================================
// === FUNGSI PROFIL & EDIT PROFIL =========================================
// =========================================================================

function preventDefault(event) {
    // Fungsi universal untuk mencegah refresh halaman
    if (event) {
        event.preventDefault();
    }
}

function loadProfilePage(event) {
    preventDefault(event); // Mencegah reload halaman
    const user = GLOBAL_USER; // Ambil data user lengkap (Wajib dari GLOBAL_USER)
    const container = document.getElementById('main-content-area');

    // Format data untuk tampilan
    const formattedBirthDate = user.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID') : 'N/A';
    const genderDisplay = user.gender ? (user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan') : 'N/A';

    container.innerHTML = `
        <h3>Profil Saya</h3>
        <p>Lihat dan kelola informasi akun Anda di sini.</p>
        <hr>

        <div class="card-section profile-details">
            <table class="data-table">
                <tr><th>Nama</th><td>${user.name || 'N/A'}</td></tr>
                <tr><th>Email</th><td>${user.email || 'N/A'}</td></tr>
                <tr><th>Role</th><td>${user.role || 'N/A'}</td></tr>
                
                <tr><th>Status Keanggotaan</th><td>${user.memberStatus || 'N/A'}</td></tr>
                ${user.organization ? `<tr><th>Organisasi</th><td>${user.organization.name}</td></tr>` : ''}
                
                <tr style="border-top: 1px solid #ccc;"><th>Jenis Kelamin</th><td>${genderDisplay}</td></tr>
                <tr><th>Tanggal Lahir</th><td>${formattedBirthDate}</td></tr>
                
                ${user.position ? `<tr><th>Jabatan</th><td>${user.position}</td></tr>` : ''}
                ${user.memberNumber ? `<tr><th>No. Anggota</th><td>${user.memberNumber}</td></tr>` : ''}
            </table>
            <button onclick="loadEditProfileForm(GLOBAL_USER)" class="btn-primary">Edit Profil</button>
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
                <input type="date" id="editBirthDate" value="${birthDateValue}">
            </div>
            
            <p id="editMessage"></p> <div>
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
            birthDate: birthDate
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
            messageElement.innerText = `[Error]: ${err.message}`;
        });
}

function loadDefaultLanding(event, user) {
    preventDefault(event);
    const mainContentArea = document.getElementById("main-content-area");

    if (user.role === "ADMIN") {
        loadAdminDashboard(user);
    } else if (user.role === "PIMPINAN") {
        loadPimpinanDashboard(user);
    } else {
        // 🛑 KONSEP BARU: ANGGOTA MELIHAT STATUS KEANGGOTAAN
        loadUserStatusSummary(user);
    }
}


// =========================================================================
// === IMPLEMENTASI KONTEN BARU ============================================
// =========================================================================

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

// 3. Daftar Organisasi (Dipanggil dari Sidebar)
function loadOrgListPage(event, user) {
    preventDefault(event);
    // 🛑 KITA GUNAKAN loadOrganizationListDashboard yang sudah ada sebagai logic utamanya
    loadOrganizationListDashboard(event, user);
}

// =========================================================================
// === FUNGSI KHUSUS UNTUK ADMIN ===========================================
// =========================================================================

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
        .then(organizations => {
            tableBody.innerHTML = '';
            organizations.forEach(org => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${org.id}</td>
                        <td>${org.name}</td>
                        <td>${org.status}</td>
                        <td>
                            <button onclick="openAssignPimpinanModal(${org.id}, '${org.name}')">Assign Pimpinan</button>
                        </td>
                    </tr>
                `;
            });

        })
        .catch(err => {
            tableBody.innerHTML = `<tr><td colspan="4" style="color: red;">[Error]: ${err.message}</td></tr>`;
        });
}

function loadAdminDashboard(user) {
    const container = document.getElementById('main-content-area');
    preventDefault(null); // Fix bug event handler

    container.innerHTML = `
        <h3>Area Admin: Sistem Struktura</h3>
        <p id="adminMessage" style="margin-bottom: 15px;"></p>
        <hr>
        
        <div class="card-section">
            <h4>Buat Organisasi Baru</h4>
            <form id="createOrgForm">
                <input type="text" id="orgName" placeholder="Nama Organisasi" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
                <textarea id="orgDescription" placeholder="Deskripsi Singkat (Opsional)" style="width: 100%; padding: 8px; margin-bottom: 10px;"></textarea>
                <button type="submit">Buat Organisasi</button>
            </form>
        </div>

        <div class="card-section" style="margin-top: 20px;">
            <h4>Kelola Organisasi & Tetapkan Pimpinan</h4>
            <table id="orgListTable" class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nama Organisasi</th><th>Status</th><th>Aksi</th></tr>
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

    document.getElementById('createOrgForm').addEventListener('submit', handleCreateOrganization);
    loadOrganizationList();
}


let currentOrgIdToAssign = null; // Variabel global untuk Modal

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
    document.getElementById("modalOrgName").innerText = orgName;
    document.getElementById("assignPimpinanModal").style.display = 'block';
    document.getElementById("targetUserId").value = '';
    document.getElementById("assignMessage").innerText = '';
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
                adminMessage.style.color = "green";
                adminMessage.innerText = `Pimpinan berhasil ditetapkan: ${user.name} untuk organisasi ${orgId}.`;
                loadOrganizationList(); // Refresh list
            }, 1500);
        })
        .catch(err => {
            assignMessageElement.style.color = "red";
            assignMessageElement.innerText = `[Gagal] ${err.message}`;
        });
}

// =========================================================================
// === FUNGSI KHUSUS UNTUK PIMPINAN ========================================
// =========================================================================

function loadPimpinanDashboard(user) {
    preventDefault(null); // Fix bug event handler
    const orgId = user.organization.id;
    const container = document.getElementById('main-content-area');

    container.innerHTML = `
        <h3>Manajemen Anggota Organisasi: ${user.organization.name}</h3>
        <p id="pimpinanMessage" style="margin-bottom: 15px;"></p>
        <hr>
        
        <div class="card-section">
            <h4>Permintaan Gabung (PENDING)</h4>
            <table id="pendingTable" class="data-table">
                <thead><tr><th>Nama</th><th>Email</th><th>Alasan Gabung</th><th>Aksi</th></tr></thead>
                <tbody><tr><td colspan="3">Memuat...</td></tr></tbody>
            </table>
        </div>

        <div class="card-section" style="margin-top: 20px;">
            <h4>Anggota Aktif (ACTIVE)</h4>
            
            <div class="search-sort-controls" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" id="keywordSearch" placeholder="Cari Nama/Email" style="padding: 5px;">
                
                <select id="sortBy" onchange="handleSearchAndSort(null, this.value)">
                    <option value="name">Sort by Nama</option>
                    <option value="email">Sort by Email</option>
                    <option value="position">Sort by Jabatan</option> // 🛑 TAMBAHKAN INI
                    <option value="joinDate">Sort by Tanggal Gabung</option>
                </select>
                
                <select id="sortDirection" onchange="handleSearchAndSort(null, null, this.value)">
                    <option value="ASC">A-Z (Ascending)</option>
                    <option value="DESC">Z-A (Descending)</option>
                </select>
                
                <button onclick="handleSearchAndSort(document.getElementById('keywordSearch').value)">Search</button>
            </div>
                <table id="activeTable" class="data-table">
                    <thead>
                        <tr><th>No</th><th>Nama</th><th>Email</th><th>Jabatan</th><th>Tanggal Gabung</th><th>No Anggota</th><th>Jenis Kelamin</th><th>Aksi</th></tr> 
                    </thead>
                    <tbody><tr><td colspan="5">Memuat...</td></tr></tbody>
                </table>
            <div id="paginationControls" style="margin-top: 10px; text-align: center;"></div>
        </div>
    `;

    loadPending(orgId);
    loadActive(orgId);

    document.getElementById('keywordSearch').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearchAndSort(this.value);
        }
    });
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
                tableBody.innerHTML = `<tr><td colspan="4">Tidak ada permintaan Bergabung</td></tr>`; // 🛑 Ganti colspan menjadi 4
                return;
            }
            users.forEach(u => {
                const reason = u.applicationReason || 'Tidak ada alasan spesifik.';
                tableBody.innerHTML += `
                    <tr>
                        <td>${u.name}</td>
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
            document.querySelector("#pendingTable tbody").innerHTML = `<tr><td colspan="4" style="color: red;">${err.message}</td></tr>`; // 🛑 Ganti colspan menjadi 4
        });
}

function loadActive(orgId) {
    const tableBody = document.querySelector("#activeTable tbody");
    const endpoint = `/api/users/organization/${orgId}/active/search?keyword=${currentKeyword}&page=${currentPage}&size=10&sortBy=${currentSortBy}&sortDirection=${currentSortDirection}`;

    tableBody.innerHTML = `<tr><td colspan="4">Loading data (${currentPage + 1})...</td></tr>`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat daftar anggota aktif');
            return res.json();
        })
        .then(pageData => {
            tableBody.innerHTML = '';
            const users = pageData.content;

            const startIndex = pageData.number * pageData.size;

            const paginationInfo = `Halaman ${pageData.number + 1} dari ${pageData.totalPages} | Total Anggota: ${pageData.totalElements}`;
            document.getElementById('pimpinanMessage').innerText = paginationInfo;

            if (users.length === 0 && pageData.totalElements === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">Belum ada anggota ACTIVE.</td></tr>`;
                return;
            }

            users.forEach((u, index) => { // Gunakan index dari forEach
                const rowNumber = startIndex + index + 1; // 🛑 NOMOR URUT

                tableBody.innerHTML += `
                    <tr>
                        <td>${rowNumber}.</td>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.position || 'Anggota'}</td>
                        <td>${u.joinDate || 'N/A'}</td>
                        <td>${u.memberNumber || 'N/A'}</td>
                        <td>${u.gender === 'MALE' ? 'Laki-laki' : u.gender === 'FEMALE' ? 'Perempuan' : 'N/A'}</td>
                        <td class="action-cell"> 
                            <button onclick="openEditPositionModal(${u.id}, '${u.name}', '${u.position || 'Anggota Biasa'}')" class="btn-primary">Edit Jabatan</button>
                            <button onclick="openEditMemberNumberModal(${u.id}, '${u.name}', '${u.memberNumber || 'N/A'}')" class="btn-primary">Edit No Anggota</button>
                        </td>
                    </tr>
                `;
            });
            // Logic Pagination Controls
            const paginationControls = document.getElementById('paginationControls');
            paginationControls.innerHTML = '';
            if (pageData.totalPages > 1) {
                if (!pageData.first) {
                    paginationControls.innerHTML += `<button onclick="handlePagination(${currentPage - 1})">Prev</button> `;
                }
                paginationControls.innerHTML += `<span>Halaman ${pageData.number + 1} dari ${pageData.totalPages}</span>`;
                if (!pageData.last) {
                    paginationControls.innerHTML += ` <button onclick="handlePagination(${currentPage + 1})">Next</button>`;
                }
            }
        })
        .catch(err => {
            document.querySelector("#activeTable tbody").innerHTML = `<tr><td colspan="4" style="color: red;">${err.message}</td></tr>`;
        });
}

function handleSearchAndSort(newKeyword, newSortBy, newSortDirection) {
    if (newKeyword !== null) { currentKeyword = newKeyword; }
    if (newSortBy) { currentSortBy = newSortBy; }
    if (newSortDirection) { currentSortDirection = newSortDirection; }

    currentPage = 0;
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        loadActive(orgId);
    } else {
        document.getElementById('pimpinanMessage').innerText = "Error: Organisasi ID tidak ditemukan.";
    }
}

function handlePagination(pageNumber) {
    currentPage = pageNumber;
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        loadActive(orgId);
    }
}

function approve(targetUserId) {
    const approverId = localStorage.getItem("CURRENT_USER_ID");
    const messageElement = document.getElementById("pimpinanMessage");
    messageElement.innerText = "Memproses Approve...";

    fetch(`/api/users/${approverId}/approve/${targetUserId}`, { method: "PUT" })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal Approve.") });
            messageElement.style.color = "green";
            messageElement.innerText = `Anggota ID ${targetUserId} berhasil di-Approve.`;
            setTimeout(() => location.reload(), 1500);
        })
        .catch(err => {
            messageElement.style.color = "red";
            messageElement.innerText = err.message;
        });
}

function reject(targetUserId) {
    const approverId = localStorage.getItem("CURRENT_USER_ID");
    const messageElement = document.getElementById("pimpinanMessage");
    messageElement.innerText = "Memproses Reject...";

    fetch(`/api/users/${approverId}/reject/${targetUserId}`, { method: "PUT" })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal Reject.") });
            messageElement.style.color = "green";
            messageElement.innerText = `Anggota ID ${targetUserId} berhasil di-Reject.`;
            setTimeout(() => location.reload(), 1500);
        })
        .catch(err => {
            messageElement.style.color = "red";
            messageElement.innerText = err.message;
        });
}

// =========================================================================
// === FUNGSI KHUSUS UNTUK ANGGOTA (STATUS VIEWS) ==========================
// =========================================================================

function loadPendingDashboard(user) {
    // 🛑 PERBAIKAN: Targetkan HANYA area konten utama (#main-content-area)
    const container = document.getElementById('main-content-area');
    container.innerHTML = `
        <h3>Status Keanggotaan: ${user.memberStatus}</h3>
        <p>Pengajuan Anda untuk bergabung dengan organisasi <b>${user.organization.name}</b> sedang di proses oleh pimpinan. Mohon menunggu persetujuan.</p>
    `;
}

function loadActiveDashboard(user) {
    // 🛑 PERBAIKAN: Targetkan HANYA area konten utama (#main-content-area)
    const container = document.getElementById('main-content-area');
    container.innerHTML = `
        <h3>Selamat! Anda Anggota Aktif</h3>
        <p>Organisasi Anda: <b>${user.organization.name}</b></p>
        <p>Tanggal Bergabung: ${user.joinDate || 'N/A'}</p>
        <p>Nomor Anggota: ${user.memberNumber || 'Belum di-set'}</p>
    `;
}

function requestJoin(organizationId, organizationName) {
    const message = document.getElementById("dashboardJoinMessage") || document.getElementById("joinMessage");
    const userId = localStorage.getItem("CURRENT_USER_ID");

    message.innerText = `Mengajukan ke ${organizationName}...`;
    message.style.color = "black";

    fetch(`/api/users/${userId}/join/${organizationId}`, { method: "POST" })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text || "Gagal mengajukan gabung.") });
            }
            return res.json();
        })
        .then(user => {
            // Update GLOBAL_USER dan localStorage setelah sukses
            GLOBAL_USER = user;
            localStorage.setItem("CURRENT_USER_STATUS", user.memberStatus);

            message.style.color = "green";
            message.innerText = `Berhasil mengajukan ke ${organizationName}! Status Anda kini PENDING.`;

            // Muat ulang dashboard untuk menampilkan status PENDING
            setTimeout(() => loadDefaultLanding(null, GLOBAL_USER), 2000);
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat join.";
        });
}

// =========================================================================
// === FUNGSI UNIVERSAL (DAFTAR ORGANISASI) ================================
// =========================================================================

function loadOrganizationListDashboard(event, user) {
    preventDefault(event);
    const container = document.getElementById('main-content-area');

    // Markup HTML untuk Kontrol Search & Sort
    container.innerHTML = `
        <h3>Daftar Organisasi Aktif</h3>
        <p>Anda dapat melihat daftar organisasi. Status Anda: <b>${user.memberStatus}</b>.</p>
        
        <hr>

        <div class="search-sort-controls" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="orgKeywordSearch" placeholder="Cari Nama Organisasi" style="padding: 5px;">
            
            <select id="orgSortBy" onchange="handleOrgListSortAndSearch(null, this.value)">
                <option value="name">Sort by Nama</option>
                <option value="description">Sort by Deskripsi</option>
            </select>
            
            <select id="orgSortDirection" onchange="handleOrgListSortAndSearch(null, null, this.value)">
                <option value="ASC">A-Z (Ascending)</option>
                <option value="DESC">Z-A (Descending)</option>
            </select>
            
            <button onclick="handleOrgListSortAndSearch(document.getElementById('orgKeywordSearch').value)">Search</button>
        </div>
        <table id="organizationList" class="data-table">
            <thead>
                <tr>
                    <th>Nama Organisasi</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody><tr><td colspan="3">Memuat...</td></tr></tbody>
        </table>
        <p id="dashboardJoinMessage" style="margin-top: 15px;"></p>
        <div id="orgPaginationControls" style="margin-top: 10px; text-align: center;"></div>
    `;

    document.getElementById('orgKeywordSearch').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleOrgListSortAndSearch(this.value);
        }
    });

    loadOrgList(user);
}

function loadOrgList(user) {
    const encodedKeyword = encodeURIComponent(orgCurrentKeyword);

    const endpoint = `/api/organizations/search?keyword=${encodedKeyword}&page=${orgCurrentPage}&size=10&sortBy=${orgCurrentSortBy}&sortDirection=${orgCurrentSortDirection}`;

    const tableBody = document.querySelector("#organizationList tbody");
    const paginationControls = document.getElementById('orgPaginationControls');

    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="3">Memuat data Organisasi...</td></tr>`;
    if (paginationControls) paginationControls.innerHTML = '';

    fetch(endpoint)
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text || "Gagal memuat daftar organisasi.") });
            }
            return res.json();
        })
        .then(organizations => {
            tableBody.innerHTML = '';

            const listToRender = organizations.content || organizations;

            if (listToRender.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">Tidak ada organisasi yang ditemukan.</td></tr>`;
                return;
            }

            listToRender.forEach(org => {
                if (org.status === "ACTIVE") {
                    let actionButton = `<span style="color: gray;">Tidak Ada Aksi</span>`;
                    let memberStatusDisplay = `<span style="color: gray;">NON_MEMBER</span>`; // Default status

                    const isMemberOfOrg = user.organization && user.organization.id === org.id;

                    if (user.memberStatus === "NON_MEMBER") {
                        // Jika NON_MEMBER, selalu tampilkan tombol Ajukan Gabung (di kolom Aksi)
                        actionButton = `<button onclick="openJoinModal(${org.id}, '${org.name}')" class="btn-success">Ajukan Gabung</button>`;
                        memberStatusDisplay = `<span style="color: gray;">NON_MEMBER</span>`;
                    } else if (isMemberOfOrg) {
                        // Jika sudah ACTIVE/PENDING di organisasi ini
                        memberStatusDisplay = user.memberStatus; // Tampilkan status asli
                        if (user.memberStatus === "PENDING") {
                            actionButton = `<span class="text-warning">Menunggu Persetujuan</span>`;
                        } else if (user.memberStatus === "ACTIVE") {
                            actionButton = `<span class="text-success">Anggota Aktif</span>`;
                        }
                    } else {
                        // Anggota ACTIVE/PENDING di ORG LAIN, dan melihat ORG ini
                        memberStatusDisplay = `<span style="color: gray;">NON_MEMBER</span>`; // Statusnya NON_MEMBER di organisasi yang sedang dilihat ini
                        actionButton = `<span style="color: gray;">Tidak Ada Aksi</span>`; // Tidak bisa gabung lagi
                    }
                    
                    // 🛑 Jika user ACTIVE/PENDING di ORG LAIN, status tetap NON_MEMBER di org ini.
                    
                    tableBody.innerHTML += `
                        <tr>
                            <td>${org.name}</td>
                            <td>${org.description || 'Tidak ada deskripsi'}</td>
                            <td>${memberStatusDisplay}</td> <td>${actionButton}</td>
                        </tr>
                    `;
                }
            });

            // Logic Pagination Controls
            if (organizations.totalPages && organizations.totalPages > 1) {
                const pageData = organizations;

                if (!pageData.first) {
                    paginationControls.innerHTML += `<button onclick="handleOrgListPagination(${pageData.number - 1})">Prev</button> `;
                }
                paginationControls.innerHTML += `<span>Halaman ${pageData.number + 1} dari ${pageData.totalPages}</span>`;
                if (!pageData.last) {
                    paginationControls.innerHTML += ` <button onclick="handleOrgListPagination(${pageData.number + 1})">Next</button>`;
                }
            }
        })
        .catch(err => {
            document.getElementById('main-content-area').innerHTML += `<p class="text-error">Gagal memuat daftar organisasi: ${err.message}</p>`;
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

// 🛑 MODAL MARKUP (Tambahkan di bagian body dashboard.html atau pastikan diletakkan di luar area konten utama)
// Catatan: Jika Anda tidak bisa menambahkannya di dashboard.html, kita harus menambahkannya ke loadOrganizationListDashboard.
// Untuk saat ini, kita akan tambahkan logic modal di loadOrganizationListDashboard

// 🛑 FUNGSI BARU: Membuka Modal
function openJoinModal(organizationId, organizationName) {
    const modalHtml = `
        <div id="joinModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 101;">
            <div style="background: white; width: 450px; margin: 100px auto; padding: 25px; border-radius: 8px;">
                <h4>Ajukan Gabung: ${organizationName}</h4>
                <p>Jelaskan secara singkat alasan Anda ingin bergabung (Opsional).</p>
                
                <form id="joinForm">
                    <textarea id="joinReason" rows="4" placeholder="Alasan bergabung..." style="width: 100%; padding: 8px; margin-bottom: 15px;"></textarea>
                    <input type="hidden" id="modalOrgId" value="${organizationId}">
                    
                    <button type="submit">Kirim Pengajuan</button>
                    <button type="button" onclick="closeJoinModal()" style="background-color: #6c757d;">Batal</button>
                    <p id="joinModalMessage" style="margin-top: 10px; color: red;"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('main-content-area').insertAdjacentHTML('afterend', modalHtml);
    document.getElementById('joinForm').addEventListener('submit', handleJoinSubmit);
}

function closeJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) modal.remove();
}

// 🛑 FUNGSI BARU: Mengirim Pengajuan Gabung dengan Alasan
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

// File: dashboard.js (Tambahkan di bagian bawah)

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
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal mengubah jabatan.") });
            message.style.color = "green";
            message.innerText = `Jabatan berhasil diubah!`;

            // Muat ulang daftar anggota aktif
            setTimeout(() => {
                closePositionModal();
                const orgId = GLOBAL_USER.organization.id;
                loadActive(orgId);
            }, 1500);
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
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal mengubah nomor anggota.") });
            message.style.color = "green";
            message.innerText = `Nomor anggota berhasil diubah!`;

            setTimeout(() => {
                closeMemberNumberModal();
                const orgId = GLOBAL_USER.organization.id;
                loadActive(orgId);
            }, 1500);
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat mengubah nomor anggota.";
        });
}