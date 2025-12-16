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
    if(searchInput) {
        searchInput.addEventListener('keypress', function(e) {
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