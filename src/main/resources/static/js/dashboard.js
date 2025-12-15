const userId = localStorage.getItem("CURRENT_USER_ID");
const role = localStorage.getItem("CURRENT_USER_ROLE");
const orgId = localStorage.getItem("CURRENT_ORG_ID");

if (!userId) {
    window.location.href = "login.html";
}

const content = document.getElementById("content");

if (role === "PIMPINAN") {
    loadPimpinanDashboard();
} else if (role === "ANGGOTA") {
    loadAnggotaDashboard();
} else {
    content.innerHTML = "<p>Role tidak dikenali</p>";
}

// ================== DASHBOARD PIMPINAN ==================
function loadPimpinanDashboard() {
    content.innerHTML = `
        <h3>Pending Members</h3>
        <table id="pendingTable">
            <tr>
                <th>Nama</th>
                <th>Aksi</th>
            </tr>
        </table>

        <h3>Active Members</h3>
        <table id="activeTable">
            <tr>
                <th>Nama</th>
            </tr>
        </table>
    `;

    loadPending();
    loadActive();
}

function loadPending() {
    fetch(`/api/users/pending/${orgId}`)
        .then(res => res.json())
        .then(users => {
            const table = document.getElementById("pendingTable");
            users.forEach(u => {
                table.innerHTML += `
                    <tr>
                        <td>${u.name}</td>
                        <td>
                            <button onclick="approve(${u.id})">Approve</button>
                            <button onclick="reject(${u.id})">Reject</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function approve(targetUserId) {
    fetch(`/api/users/${userId}/approve/${targetUserId}`, {
        method: "PUT"
    }).then(() => location.reload());
}

function reject(targetUserId) {
    fetch(`/api/users/${userId}/reject/${targetUserId}`, {
        method: "PUT"
    }).then(() => location.reload());
}

function loadActive() {
    fetch(`/api/users/active/${orgId}`)
        .then(res => res.json())
        .then(users => {
            const table = document.getElementById("activeTable");
            users.forEach(u => {
                table.innerHTML += `
                    <tr>
                        <td>${u.name}</td>
                    </tr>
                `;
            });
        });
}

// ================== DASHBOARD ANGGOTA ==================
function loadAnggotaDashboard() {
    content.innerHTML = `
        <h3>Status Keanggotaan</h3>
        <p id="status"></p>
        <button onclick="join()">Ajukan Gabung</button>
    `;

    fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            document.getElementById("status").innerText =
                "Status: " + user.memberStatus;
        });
}

function join() {
    fetch(`/api/users/${userId}/join/${orgId}`, {
        method: "POST"
    }).then(() => location.reload());
}

// ================== LOGOUT ==================
function logout() {
    localStorage.clear();
    window.location.href = "/login";
}
