let currentPage = 0;
let currentSortBy = 'name';
let currentSortDirection = 'ASC';
let currentKeyword = '';

const userId = localStorage.getItem("CURRENT_USER_ID");
// Hapus role dan orgId dari localStorage fetch di sini, karena kita akan ambil data lengkap dari API

function handleOrgListSortAndSearch(newKeyword, newSortBy, newSortDirection) {
    if (newKeyword !== null) {
        orgCurrentKeyword = newKeyword;
    }
    if (newSortBy) {
        orgCurrentSortBy = newSortBy;
    }
    if (newSortDirection) {
        orgCurrentSortDirection = newSortDirection;
    }
    orgCurrentPage = 0; // Reset ke halaman 0 saat ada perubahan
    const user = { memberStatus: localStorage.getItem('CURRENT_USER_STATUS'), organization: { id: localStorage.getItem('CURRENT_ORG_ID') } }; 
    // Perlu ambil data user yang lebih lengkap jika dibutuhkan, namun untuk rendering cukup ini.
    loadOrgList(user);
}

function handleOrgListPagination(pageNumber) {
    orgCurrentPage = pageNumber;
    const user = { memberStatus: localStorage.getItem('CURRENT_USER_STATUS'), organization: { id: localStorage.getItem('CURRENT_ORG_ID') } }; 
    loadOrgList(user);
}

// FUNGSI INTI: Memuat Daftar Organisasi dengan Search/Sort/Page
function loadOrgList(user) {
    const encodedKeyword = encodeURIComponent(orgCurrentKeyword);
    const endpoint = `/api/organizations/search?keyword=${encodedKeyword}&page=${orgCurrentPage}&size=10&sortBy=${orgCurrentSortBy}&sortDirection=${orgCurrentSortDirection}`;
    
    const tableBody = document.querySelector("#organizationList tbody");
    const container = document.getElementById('main-content-area');

    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="3">Memuat data Organisasi...</td></tr>`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error("Gagal memuat daftar organisasi.");
            return res.json();
        })
        .then(pageData => {
            tableBody.innerHTML = '';
            
            const organizations = pageData.content;
            
            organizations.forEach(org => {
                if (org.status === "ACTIVE") { 
                    let actionButton = '';
                    
                    // Logika Aksi: Tetap sama (hanya NON_MEMBER yang bisa mengajukan)
                    if (user.memberStatus === "NON_MEMBER") {
                        actionButton = `<button onclick="requestJoin(${org.id}, '${org.name}')">Ajukan Gabung</button>`;
                    } else if (user.memberStatus === "PENDING" && user.organization && user.organization.id === org.id) {
                        actionButton = `<span class="text-warning">Menunggu Persetujuan</span>`;
                    } else if (user.memberStatus === "ACTIVE" && user.organization && user.organization.id === org.id) {
                        actionButton = `<span class="text-success">Anggota Aktif</span>`;
                    } else {
                        actionButton = `<span style="color: gray;">Tidak Ada Aksi</span>`;
                    }

                    tableBody.innerHTML += `
                        <tr>
                            <td>${org.name}</td>
                            <td>${org.description || 'Tidak ada deskripsi'}</td>
                            <td>${actionButton}</td>
                        </tr>
                    `;
                }
            });
            
            // LOGIKA PAGINATION (Organisasi)
            const paginationControls = document.getElementById('orgPaginationControls');
            paginationControls.innerHTML = '';
            
            if (pageData.totalPages > 1) {
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
            container.innerHTML += `<p class="text-error">Gagal memuat daftar organisasi: ${err.message}</p>`;
        });
}

// ================== INIT DASHBOARD ==================
document.addEventListener('DOMContentLoaded', () => {
    renderHeaderAuth();
    const mainContainer = document.querySelector('.container');
    mainContainer.innerHTML = `
        <div class="dashboard-grid">
            <div class="main-content" id="main-content-area">
                <h3>Memuat data...</h3>
            </div>
            <div class="side-info" id="side-info-area">
                </div>
        </div>
    `;

    // 1. Ambil data user lengkap
    fetch(`/api/users/${userId}`)
        .then(res => {
            if (!res.ok) {
                // Jika user tidak ditemukan, paksa logout
                logout();
                throw new Error("User not found");
            }
            return res.json();
        })
        .then(user => {
            const sideInfoArea = document.getElementById("side-info-area");
            const orgName = user.organization ? user.organization.name : 'Belum Ada';

            // 1. Tampilkan Sidebar Info
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
                <li><a href="#" onclick="loadDefaultLanding(event, user)">Dashboard Utama</a></li>
            </ul>
        </div>
    `;

            // 2. Tambahkan Menu Berdasarkan Role
            const mainMenu = document.getElementById("main-menu");

            // Menu Universal: DAFTAR ORGANISASI
            mainMenu.innerHTML += `<li><a href="#" onclick="loadOrganizationListDashboard(event, user)">Daftar Organisasi</a></li>`;

            if (user.role === "ADMIN") {
                mainMenu.innerHTML += `<li><a href="#" onclick="loadAdminDashboard(user, event)">Kelola Admin</a></li>`;
            } else if (user.role === "PIMPINAN") {
                mainMenu.innerHTML += `<li><a href="#" onclick="loadPimpinanDashboard(user, event)">Kelola Anggota</a></li>`;
            }

            // 3. Muat Konten Default Landing Page (Status Anggota/Admin)
            loadDefaultLanding(null, user); // Panggil fungsi landing default saat pertama kali dimuat
        })
        .catch(err => {
            document.getElementById("main-content-area").innerHTML =
                `<p class="text-error">Gagal memuat data. ${err.message}. Silakan <a href="#" onclick="logout()">Login ulang</a>.</p>`;
        });
});


// ================== ANGGOTA NON_MEMBER Dashboard (Fitur Join) ==================
// ANGGOTA (NON_MEMBER): Melihat daftar organisasi dan mengajukan gabung.
function loadNonMemberDashboard(user) {
    const container = document.getElementById('main-content-area');
    container.innerHTML = `
        <h3>Status Keanggotaan: ${user.memberStatus}</h3>
        <p>Anda belum bergabung dengan organisasi manapun. Silakan pilih organisasi di bawah ini untuk mengajukan permintaan gabung.</p>
        
        <hr>
        
        <h4>Daftar Organisasi Aktif</h4>
        <table id="organizationList">
            <thead>
                <tr>
                    <th>Nama Organisasi</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <p id="joinMessage" style="color: green; margin-top: 15px;"></p>
    `;

    // Fetch daftar organisasi aktif
    fetch("/api/organizations")
        .then(res => res.json())
        .then(organizations => {
            const tableBody = document.querySelector("#organizationList tbody");
            organizations.forEach(org => {
                // Hanya tampilkan organisasi yang statusnya ACTIVE
                if (org.status === "ACTIVE") {
                    tableBody.innerHTML += `
                        <tr>
                            <td>${org.name}</td>
                            <td>${org.description || 'Tidak ada deskripsi'}</td>
                            <td>
                                <button onclick="requestJoin(${org.id}, '${org.name}')">Ajukan Gabung</button>
                            </td>
                        </tr>
                    `;
                }
            });
        })
        .catch(err => {
            container.innerHTML += `<p style="color: red;">Gagal memuat daftar organisasi.</p>`;
        });
}

function requestJoin(organizationId, organizationName) {
    const message = document.getElementById("joinMessage");

    message.innerText = `Mengajukan ke ${organizationName}...`;

    fetch(`/api/users/${userId}/join/${organizationId}`, {
        method: "POST"
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text || "Gagal mengajukan gabung.") });
            }
            return res.json();
        })
        .then(user => {
            message.style.color = "green";
            message.innerText = `Berhasil mengajukan ke ${organizationName}! Status Anda kini PENDING.`;
            // Refresh setelah berhasil join untuk memuat dashboard PENDING
            setTimeout(() => location.reload(), 2000);
        })
        .catch(err => {
            message.style.color = "red";
            message.innerText = err.message || "Terjadi error tak terduga saat join.";
        });
}


// ================== ANGGOTA PENDING Dashboard ==================
// ANGGOTA (PENDING): Hanya menampilkan status menunggu.
function loadPendingDashboard(user) {
    // 🛑 PERBAIKAN: Targetkan HANYA area konten utama (#main-content-area), BUKAN .container
    const container = document.getElementById('main-content-area'); 
    container.innerHTML = `
        <h3>Status Keanggotaan: ${user.memberStatus}</h3>
        <p>Pengajuan Anda untuk bergabung dengan organisasi <b>${user.organization.name}</b> sedang di proses oleh pimpinan. Mohon menunggu persetujuan.</p>
    `;
}
// ================== ANGGOTA ACTIVE Dashboard ==================
// ANGGOTA (ACTIVE): Sudah diterima.
function loadActiveDashboard(user) {
    // 🛑 PERBAIKAN: Targetkan HANYA area konten utama (#main-content-area), BUKAN .container
    const container = document.getElementById('main-content-area'); 
    container.innerHTML = `
        <h3>Selamat! Anda Anggota Aktif</h3>
        <p>Organisasi Anda: <b>${user.organization.name}</b></p>
        <p>Tanggal Bergabung: ${user.joinDate || 'N/A'}</p>
        <p>Nomor Anggota: ${user.memberNumber || 'Belum di-set'}</p>
    `;
}


// ================== DASHBOARD PIMPINAN (Penyempurnaan) ==================
// ================== DASHBOARD PIMPINAN (Penyempurnaan) ==================
function loadPimpinanDashboard(user) {
    const orgId = user.organization.id;
    const container = document.getElementById('main-content-area');
    
    container.innerHTML = `
        <h3>Manajemen Anggota Organisasi: ${user.organization.name}</h3>
        <p id="pimpinanMessage" style="margin-bottom: 15px;"></p>
        <hr>
        
        <div class="card-section">
            <h4>Permintaan Gabung (PENDING)</h4>
            <table id="pendingTable" class="data-table">
                <thead><tr><th>Nama</th><th>Email</th><th>Aksi</th></tr></thead>
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
                    <tr><th>Nama</th><th>Email</th><th>Tanggal Gabung</th><th>No. Anggota</th></tr>
                </thead>
                <tbody><tr><td colspan="4">Memuat...</td></tr></tbody>
            </table>
            <div id="paginationControls" style="margin-top: 10px; text-align: center;"></div>
        </div>
    `;
    
    loadPending(orgId);
    // Panggil loadActive di akhir agar data tampil
    loadActive(orgId); 

    // Tambahkan event listener untuk input search (untuk memicu saat Enter)
    document.getElementById('keywordSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearchAndSort(this.value);
        }
    });
}

// Fungsi untuk memuat daftar PENDING
function loadPending(orgId) {
    fetch(`/api/users/organization/${orgId}/pending`)
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat daftar pending');
            return res.json();
        })
        .then(users => {
            const tableBody = document.querySelector("#pendingTable tbody");
            tableBody.innerHTML = ''; // Kosongkan

            if (users.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">Tidak ada pengajuan PENDING.</td></tr>`;
                return;
            }
            users.forEach(u => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>
                            <button onclick="approve(${u.id})">Approve</button>
                            <button onclick="reject(${u.id})">Reject</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            document.querySelector("#pendingTable tbody").innerHTML = `<tr><td colspan="3" style="color: red;">${err.message}</td></tr>`;
        });
}

// Fungsi untuk memuat daftar ACTIVE (Kini menggunakan Search & Sort)
function loadActive(orgId) {
    const tableBody = document.querySelector("#activeTable tbody");
    const encodedKeyword = encodeURIComponent(currentKeyword);
    const endpoint = `/api/users/organization/${orgId}/active/search?keyword=${currentKeyword}&page=${currentPage}&size=10&sortBy=${currentSortBy}&sortDirection=${currentSortDirection}`;

    tableBody.innerHTML = `<tr><td colspan="4">Loading data (${currentPage + 1})...</td></tr>`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat daftar anggota aktif');
            return res.json();
        })
        .then(pageData => { // pageData kini adalah objek Page<User> dari Spring
            tableBody.innerHTML = ''; // Kosongkan
            const users = pageData.content;

            // Tampilkan informasi Pagination (Opsional)
            const paginationInfo = `Halaman ${pageData.number + 1} dari ${pageData.totalPages} | Total Anggota: ${pageData.totalElements}`;
            document.getElementById('pimpinanMessage').innerText = paginationInfo; // Tampilkan di tempat pesan

            if (users.length === 0 && pageData.totalElements > 0) {
                tableBody.innerHTML = `<tr><td colspan="4">Anggota tidak ditemukan pada halaman ini.</td></tr>`;
                return;
            }
            if (users.length === 0 && pageData.totalElements === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">Belum ada anggota ACTIVE.</td></tr>`;
                return;
            }

            users.forEach(u => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.joinDate || 'N/A'}</td>
                        <td>${u.memberNumber || 'N/A'}</td>
                    </tr>
                `;
            });

            if (pageData.totalPages > 1) {
                if (!pageData.first) {
                    paginationControls.innerHTML += `<button onclick="handlePagination(${currentPage - 1})">Prev</button> `;
                }
                
                // Tampilkan info halaman
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

// FUNGSI BARU: Mengatur Parameter dan Memuat Ulang Anggota Aktif
function handleSearchAndSort(newKeyword, newSortBy, newSortDirection) {
    // 1. Update Parameter Global
    if (newKeyword !== null) {
        currentKeyword = newKeyword;
    }
    if (newSortBy) {
        currentSortBy = newSortBy;
    }
    if (newSortDirection) {
        currentSortDirection = newSortDirection;
    }
    
    // 2. Reset ke halaman 0 dan muat ulang
    currentPage = 0; 
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        loadActive(orgId); 
    } else {
        document.getElementById('pimpinanMessage').innerText = "Error: Organisasi ID tidak ditemukan.";
    }
}


// FUNGSI BARU: Mengatur Pindah Halaman
function handlePagination(pageNumber) {
    currentPage = pageNumber;
    const orgId = localStorage.getItem("CURRENT_ORG_ID");
    if (orgId) {
        loadActive(orgId);
    }
}

// Fungsi Aksi Approve/Reject
function approve(targetUserId) {
    const approverId = localStorage.getItem("CURRENT_USER_ID");
    const messageElement = document.getElementById("pimpinanMessage");
    messageElement.innerText = "Memproses Approve...";

    fetch(`/api/users/${approverId}/approve/${targetUserId}`, {
        method: "PUT"
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal Approve.") });
            messageElement.style.color = "green";
            messageElement.innerText = `Anggota ID ${targetUserId} berhasil di-Approve.`;
            setTimeout(() => location.reload(), 1500); // Refresh setelah sukses
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

    fetch(`/api/users/${approverId}/reject/${targetUserId}`, {
        method: "PUT"
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text || "Gagal Reject.") });
            messageElement.style.color = "green";
            messageElement.innerText = `Anggota ID ${targetUserId} berhasil di-Reject.`;
            setTimeout(() => location.reload(), 1500); // Refresh setelah sukses
        })
        .catch(err => {
            messageElement.style.color = "red";
            messageElement.innerText = err.message;
        });
}

// Variabel global untuk Assign Pimpinan
let currentOrgIdToAssign = null;

// ================== DASHBOARD ADMIN (BARU) ==================
function loadAdminDashboard(user) {
    const container = document.getElementById('main-content-area'); // ⬅️ TARGET BARU
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


// Fungsi untuk memuat daftar Organisasi
function loadOrganizationListDashboard(event, user) {
    if (event) event.preventDefault();
    const container = document.getElementById('main-content-area');
    
    // Reset parameter search global ke default untuk pencarian organisasi
    // (Ini menghindari konflik dengan pengaturan terakhir Pimpinan/Admin)
    const orgCurrentKeyword = ''; 
    const orgCurrentSortBy = 'name';
    const orgCurrentSortDirection = 'ASC';
    
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
        <table id="organizationList">
            <thead>
                <tr>
                    <th>Nama Organisasi</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody><tr><td colspan="3">Memuat...</td></tr></tbody>
        </table>
        <p id="dashboardJoinMessage" style="margin-top: 15px;"></p>
        <div id="orgPaginationControls" style="margin-top: 10px; text-align: center;"></div>
    `;

    // Tambahkan Event Listener untuk memicu search saat Enter
    document.getElementById('orgKeywordSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleOrgListSortAndSearch(this.value);
        }
    });

    // Panggil fungsi baru untuk memuat daftar organisasi
    loadOrgList(user, 0, orgCurrentKeyword, orgCurrentSortBy, orgCurrentSortDirection);
}


// Fungsi untuk membuat Organisasi
function handleCreateOrganization(event) {
    event.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const messageElement = document.getElementById("adminMessage");
    messageElement.innerText = "Membuat organisasi...";
    messageElement.style.color = "black";

    fetch('/api/organizations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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


// Fungsi Modal Assign Pimpinan
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

    // Panggil endpoint PUT /api/organizations/{orgId}/assign-pimpinan/{userId}?adminId={adminId}
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

            // Setelah sukses, tutup modal dan tampilkan notifikasi di dashboard utama
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

// FUNGSI BARU: Mengisi area otentikasi header
function renderHeaderAuth() {
    const authArea = document.getElementById('auth-area');
    const isLoggedIn = localStorage.getItem("CURRENT_USER_ID") !== null;

    if (isLoggedIn) {
        const userName = localStorage.getItem("CURRENT_USER_NAME") || "Akun Anda";
        authArea.innerHTML = `
            <span>Selamat datang, ${userName}</span>
            <button onclick="logout()">Logout</button> 
        `;
    } else {
        authArea.innerHTML = `
            <a href="/login">Login</a>
            <a href="/register" style="border: 1px solid white;">Daftar</a>
        `;
    }
}

function loadDefaultLanding(event, user) {
    if (event) event.preventDefault();
    const mainContentArea = document.getElementById("main-content-area");

    // Clear content sebelum memuat ulang
    mainContentArea.innerHTML = ''; 

    // Muat konten berdasarkan Role/Status (logika yang sudah ada di bawah)
    if (user.role === "ADMIN") {
        // Panggil fungsi Admin yang sudah ada
        loadAdminDashboard(user);
    } else if (user.role === "PIMPINAN") {
        // Panggil fungsi Pimpinan yang sudah ada
        loadPimpinanDashboard(user);
    } else { 
        // Anggota: Tampilkan Status Keanggotaan
        if (user.memberStatus === "NON_MEMBER") {
            loadNonMemberDashboard(user);
        } else if (user.memberStatus === "PENDING") {
            loadPendingDashboard(user);
        } else if (user.memberStatus === "ACTIVE") {
            loadActiveDashboard(user);
        }
    }
}

// File: dashboard.js (Fungsi Baru: Akses Daftar Organisasi dari dalam Dashboard)
function loadOrganizationListDashboard(event, user) {
    if (event) event.preventDefault();
    const container = document.getElementById('main-content-area');

    container.innerHTML = `
        <h3>Daftar Organisasi Aktif</h3>
        <p>Anda dapat melihat daftar organisasi. Status Anda: <b>${user.memberStatus}</b>.</p>
        
        <hr>
        
        <table id="organizationList">
            <thead>
                <tr>
                    <th>Nama Organisasi</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody><tr><td colspan="3">Memuat...</td></tr></tbody>
        </table>
        <p id="dashboardJoinMessage" style="margin-top: 15px;"></p>
    `;

    // Fetch daftar organisasi aktif
    fetch("/api/organizations")
        .then(res => res.json())
        .then(organizations => {
            const tableBody = document.querySelector("#organizationList tbody");
            tableBody.innerHTML = '';
            
            organizations.forEach(org => {
                if (org.status === "ACTIVE") { 
                    let actionButton = '';
                    
                    // Logika Aksi: Hanya Anggota NON_MEMBER yang bisa mengajukan
                    if (user.memberStatus === "NON_MEMBER") {
                        actionButton = `<button onclick="requestJoin(${org.id}, '${org.name}')">Ajukan Gabung</button>`;
                    } else if (user.memberStatus === "PENDING" && user.organization && user.organization.id === org.id) {
                        actionButton = `<span class="text-warning">Menunggu Persetujuan</span>`;
                    } else if (user.memberStatus === "ACTIVE" && user.organization && user.organization.id === org.id) {
                        actionButton = `<span class="text-success">Anggota Aktif</span>`;
                    } else {
                        actionButton = `<span style="color: gray;">Tidak Ada Aksi</span>`;
                    }

                    tableBody.innerHTML += `
                        <tr>
                            <td>${org.name}</td>
                            <td>${org.description || 'Tidak ada deskripsi'}</td>
                            <td>${actionButton}</td>
                        </tr>
                    `;
                }
            });
        })
        .catch(err => {
            container.innerHTML += `<p class="text-error">Gagal memuat daftar organisasi: ${err.message}</p>`;
        });
}