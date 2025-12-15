// File: home.js

// Navigasi (Logout sudah di auth-init.js, kita hanya butuh ini)
// ... (Hapus function logout jika masih ada di sini) ...

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
    // 1. Tambahkan Kontrol Search/Sort di atas tabel
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
    document.getElementById('homeKeywordSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleHomeListSortAndSearch(this.value);
        }
    });

    loadOrganizationList();
});


// FUNGSI INTI: Memuat Daftar Organisasi dengan Search/Sort/Page (untuk Public/Home)
function loadOrganizationList() {
    const orgListArea = document.getElementById('organizationListArea');
    const encodedKeyword = encodeURIComponent(homeCurrentKeyword);
    
    // Endpoint Publik
    const endpoint = `/api/organizations/search?keyword=${encodedKeyword}&page=${homeCurrentPage}&size=10&sortBy=${homeCurrentSortBy}&sortDirection=${homeCurrentSortDirection}`;
    
    orgListArea.innerHTML = `<p>Memuat daftar organisasi...</p>`;
    
    fetch(endpoint)
        .then(res => {
             if (!res.ok) throw new Error("Gagal memuat daftar organisasi.");
             return res.json();
        })
        .then(pageData => {
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

            pageData.content.forEach(org => {
                if (org.status === "ACTIVE") { 
                    htmlContent += `
                        <tr>
                            <td>${org.name}</td>
                            <td>${org.description || 'Tidak ada deskripsi'}</td>
                            <td><span class="text-success">${org.status}</span></td>
                            <td>
                                <span style="color: gray;">Login untuk Gabung</span>
                            </td>
                        </tr>
                    `;
                }
            });

            htmlContent += `</tbody></table>`;
            orgListArea.innerHTML = htmlContent;
            
            // LOGIKA PAGINATION (Home)
            const paginationControls = document.getElementById('homePaginationControls');
            paginationControls.innerHTML = '';
            
            if (pageData.totalPages > 1) {
                if (!pageData.first) {
                    paginationControls.innerHTML += `<button onclick="handleHomeListPagination(${pageData.number - 1})">Prev</button> `;
                }
                paginationControls.innerHTML += `<span>Halaman ${pageData.number + 1} dari ${pageData.totalPages}</span>`;
                if (!pageData.last) {
                    paginationControls.innerHTML += ` <button onclick="handleHomeListPagination(${pageData.number + 1})">Next</button>`;
                }
            }
        })
        .catch(err => {
            orgListArea.innerHTML = `<p class="text-error">Gagal memuat daftar organisasi. ${err.message}</p>`;
        });
}