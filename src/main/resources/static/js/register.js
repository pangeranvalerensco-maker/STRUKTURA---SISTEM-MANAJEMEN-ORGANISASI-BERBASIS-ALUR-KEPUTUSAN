function registerUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const payload = {
        name: name,
        email: email,
        password: password,
        role: "ANGGOTA",            
        memberStatus: "NON_MEMBER" 
    };

    fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (res.ok) {
            showToast("Pendaftaran berhasil!", "success");
            setTimeout(() => { window.location.href = "/login"; }, 1500);
        } else {
            const errorData = await res.json();
            // Jika backend mengirim pesan error Enum, tampilkan di toast
            const errorMsg = errorData.message || Object.values(errorData)[0];
            showToast(errorMsg || "Gagal mendaftar", "error");
        }
    })
    .catch(err => {
        console.error("Error:", err);
        if (typeof showToast === "function") {
            showToast("Email sudah terdaftar.", "error");
        } else {
            alert("Kesalahan koneksi server");
        }
    });
}

const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.onsubmit = function(e) {
        e.preventDefault();
        registerUser();
    };
}