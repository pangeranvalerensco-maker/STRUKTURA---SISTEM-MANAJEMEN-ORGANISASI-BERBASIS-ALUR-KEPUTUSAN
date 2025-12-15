function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login gagal");
        return res.json();
    })
    .then(user => {
        // SIMPAN SESSION SEDERHANA
        localStorage.setItem("CURRENT_USER_ID", user.id);
        localStorage.setItem("CURRENT_USER_ROLE", user.role);

        if (user.organization) {
            localStorage.setItem("CURRENT_ORG_ID", user.organization.id);
        }

        // REDIRECT
        window.location.href = "/dashboard";
    })
    .catch(err => {
        document.getElementById("error").innerText = "Email atau password salah";
    });
}
