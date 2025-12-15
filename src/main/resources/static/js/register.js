document.getElementById('registerForm').addEventListener('submit', function(event) {
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
    .then(res => {
        if (res.ok) {
            // Pendaftaran sukses, redirect ke login
            message.style.color = "green";
            message.innerText = "Pendaftaran berhasil! Silakan login.";
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } else {
            // Pendaftaran gagal (misalnya email sudah ada)
            return res.text().then(text => { throw new Error(text) });
        }
    })
    .catch(err => {
        // Tampilkan pesan error dari backend
        message.style.color = "red";
        message.innerText = err.message || "Terjadi kesalahan saat pendaftaran.";
    });
});