// File: home.js (FINAL FIX: Menghilangkan Syntax Error dan Konflik Fetch)

let homeCurrentPage = 0;
let homeCurrentKeyword = '';
let homeCurrentSortBy = 'name';
let homeCurrentSortDirection = 'ASC';

// FUNGSI KONTROL PAGINATION/SEARCH/SORT HOME
function handleHomeListSortAndSearch(newKeyword, newSortBy, newSortDirection) {
    if (newKeyword !== null) {
        homeCurrentKeyword = newKeyword;
    }
    if (newSortBy) {
        homeCurrentSortBy = newSortBy;
    }
    if (newSortDirection) {
        homeCurrentSortDirection = newSortDirection;
    }
    homeCurrentPage = 0;
    loadOrganizationList();
}

function handleHomeListPagination(pageNumber) {
    homeCurrentPage = pageNumber;
    loadOrganizationList();
}

document.addEventListener('DOMContentLoaded', () => {
    // Render Markup Search/Sort
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h3>🏛️ Daftar Organisasi Aktif</h3>
        <p>Anda dapat melihat struktur dan deskripsi organisasi di bawah ini. Untuk bergabung, silakan Login atau Daftar.</p>
        <hr>

        <div class="search-sort-controls" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="homeKeywordSearch" placeholder="Cari Nama Organisasi" style="padding: 5px;">
            
            <select id="homeSortBy" onchange="handleHomeListSortAndSearch(null, this.value)">
                <option value="name">Sort by Nama</option>
                <option value="description">Sort by Deskripsi</option>
            </select>
            
            <select id="homeSortDirection" onchange="handleHomeListSortAndSearch(null, null, this.value)">
                <option value="ASC">A-Z (Ascending)</option>
                <option value="DESC">Z-A (Descending)</option>
            </select>
            
            <button onclick="handleHomeListSortAndSearch(document.getElementById('homeKeywordSearch').value)">Search</button>
        </div>
        
        <div id="organizationListArea">
            </div>
        <div id="homePaginationControls" style="margin-top: 10px; text-align: center;"></div>
    `;

    // Tambahkan Event Listener untuk Enter
    const searchInput = document.getElementById('homeKeywordSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleHomeListSortAndSearch(this.value);
            }
        });
    }

    loadOrganizationList();
});


// FUNGSI INTI: Memuat Daftar Organisasi
function loadOrganizationList() {
    const orgListArea = document.getElementById('organizationListArea');
    const paginationControls = document.getElementById('homePaginationControls');

    if (!orgListArea) return;

    orgListArea.innerHTML = `<p>Memuat daftar organisasi...</p>`;
    paginationControls.innerHTML = '';

    // 🛑 KITA KEMBALI KE ENDPOINT SEARCH AGAR BACKEND BISA FILTER
    let endpoint = `/api/organizations/search`;

    // 1. BUAT QUERY PARAMETERS (Sesuai kebutuhan backend)
    let queryParams = [];

    const encodedKeyword = encodeURIComponent(homeCurrentKeyword);

    // 2. Tambahkan Keyword (Selalu dikirim, agar backend bisa pakai defaultValue="")
    queryParams.push(`keyword=${encodedKeyword}`);

    // 3. Tambahkan Pagination dan Sort (Wajib dikirim untuk Pageable/Sort)
    queryParams.push(`page=${homeCurrentPage}`);
    queryParams.push(`size=10`);
    queryParams.push(`sortBy=${homeCurrentSortBy}`);
    queryParams.push(`sortDirection=${homeCurrentSortDirection}`);

    // Gabungkan queryParams ke endpoint
    if (queryParams.length > 0) {
        endpoint += '?' + queryParams.join('&');
    }

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error(`Fetch Gagal. Status: ${res.status}.`);
            // Endpoint GET ALL mengembalikan List<Organization> (bukan Page<T>)
            return res.json();
        })
        .then(organizations => {
            // 🛑 Data yang diterima adalah ARRAY (List<Organization>), bukan PageData

            let htmlContent = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nama Organisasi</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (organizations.length === 0) {
                htmlContent += `<tr><td colspan="4">Tidak ada organisasi aktif yang ditemukan.</td></tr>`;
            } else {
                organizations.forEach(org => {
                    if (org.status === "ACTIVE") {
                        htmlContent += `
                                <tr>
                                    <td>
                                        <a href="#" class="org-link" onclick="loadOrgProfilePublic(${org.id}, event)">
                                            ${org.name}
                                        </a>
                                    </td>
                                    <td>${org.description || 'Tidak ada deskripsi'}</td>
                                    <td><span class="text-success">${org.status}</span></td>
                                    <td><span style="color: gray;">Login untuk Gabung</span></td>
                                </tr>   
                            `;
                    }
                });
            }

            htmlContent += `</tbody></table>`;
            orgListArea.innerHTML = htmlContent;

            // Hapus logika pagination, karena data adalah List
            paginationControls.innerHTML = '';
        })
        .catch(err => {
            orgListArea.innerHTML = `<p class="text-error">ERROR: Gagal memuat data. Periksa konsol browser atau backend API. ${err.message}</p>`;
        });
}

function loadOrgProfilePublic(orgId, event) {
    if (event) event.preventDefault();
    const container = document.querySelector('.container'); // Target container di home

    fetch(`/api/organizations/${orgId}/details`)
        .then(res => res.json())
        .then(data => {
            const org = data.organization;
            const members = data.members;

            container.innerHTML = `
                <div class="profile-header">
                    <h2>${org.name}</h2>
                    <p class="text-muted">${org.field || '-'} | ${org.scope || '-'}</p>
                    <button onclick="location.reload()" class="btn-secondary">⬅️ Kembali</button>
                </div>
                <div class="org-detail-grid">
                    <div class="detail-section">
                        <h4>Tentang</h4>
                        <p>${org.description || 'No description'}</p>
                        <p>📍 ${org.address || '-'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Visi Misi</h4>
                        <p>${org.visionMission || '-'}</p>
                    </div>
                </div>
                <h3>Struktur Anggota</h3>
                <table class="modern-table">
                    <thead><tr><th>Nama</th><th>Jabatan</th></tr></thead>
                    <tbody>
                        ${members.map(m => `
                            <tr>
                                <td><b class="member-link">${m.name}</b></td>
                                <td>${m.position || 'Anggota'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => alert("Gagal memuat profil"));
}

function loadOrgProfilePublic(orgId, event) {
    if(event) event.preventDefault();
    const container = document.querySelector('.container');
    
    fetch(`/api/organizations/${orgId}/details`)
        .then(res => res.json())
        .then(data => {
            const org = data.organization;
            const members = data.members;

            container.innerHTML = `
                <div class="profile-header">
                    <h2>${org.name}</h2>
                    <p class="text-muted">${org.field || '-'} | ${org.scope || '-'}</p>
                    <button onclick="location.reload()" class="btn-secondary">⬅️ Kembali</button>
                </div>
                <div class="org-detail-grid">
                    <div class="detail-section">
                        <h4>Tentang</h4>
                        <p>${org.description || 'Tidak ada deskripsi'}</p>
                        <p>📍 <b>Alamat:</b> ${org.address || '-'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Visi & Misi</h4>
                        <p>${org.visionMission || '-'}</p>
                    </div>
                </div>
                <hr>
                <h3>Daftar Anggota (${data.memberCount})</h3>
                <table class="data-table">
                    <thead><tr><th>Nama</th><th>Jabatan</th></tr></thead>
                    <tbody>
                        ${members.map(m => `
                            <tr>
                                <td><b>${m.name}</b></td>
                                <td>${m.position || 'Anggota'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(err => showToast("Gagal memuat profil organisasi", "error"));
}