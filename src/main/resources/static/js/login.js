// Fungsi login() dipanggil oleh onsubmit di login.html
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("error");
    
    errorElement.innerText = ""; // Clear previous error

    fetch("/api/users/login", { // ⬅️ Pastikan URL ini benar
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(async res => {
        if (!res.ok) {
            // Tangkap pesan error dari ResponseEntity<?> yang kita buat di Controller
            const errorMessage = await res.text(); 
            throw new Error(errorMessage || "Login gagal: Email atau Password salah.");
        }
        return res.json();
    })
    .then(user => {
        // SIMPAN SESSION SEDERHANA
        localStorage.setItem("CURRENT_USER_ID", user.id);
        localStorage.setItem("CURRENT_USER_ROLE", user.role);
        localStorage.setItem("CURRENT_USER_NAME", user.name);

        // Hanya simpan Organization ID jika user sudah terikat
        if (user.organization) {
            localStorage.setItem("CURRENT_ORG_ID", user.organization.id);
        } else {
            // Penting: Pastikan data lama di-clear jika user belum punya organisasi
            localStorage.removeItem("CURRENT_ORG_ID");
        }

        // REDIRECT ke Dashboard
        window.location.href = "/dashboard"; 
    })
    .catch(err => {
        // Tampilkan pesan error yang ditangkap dari Service/Controller
        errorElement.innerText = err.message || "Terjadi kesalahan saat login.";
    });
}