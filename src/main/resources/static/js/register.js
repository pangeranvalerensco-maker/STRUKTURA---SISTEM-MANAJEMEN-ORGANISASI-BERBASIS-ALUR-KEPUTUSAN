document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    message.innerText = ""; // Clear previous message

    fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
        .then(async res => {
            if (res.ok) {
                // Pendaftaran sukses, redirect ke login
                message.style.color = "green";
                message.innerText = "Pendaftaran berhasil! Silakan login.";
                showToast("Pendaftaran berhasil! Silakan login.", "success"); // Tambahkan ini
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                const errorData = await res.json();
                // Jika error validasi, errorData berisi { "email": "Format tidak valid", "name": "Minimal 3 huruf" }
                // Kita ambil pesan pertama saja untuk ditampilkan di toast
                const firstError = Object.values(errorData)[0];
                showToast(firstError || "Gagal mendaftar", "error");
            }
        })
        .catch(err => {
            // Tampilkan pesan error dari backend
            message.style.color = "red";
            message.innerText = err.message || "Terjadi kesalahan saat pendaftaran.";
        });
});