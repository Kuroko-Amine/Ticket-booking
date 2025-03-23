document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });

    document.getElementById("sp").addEventListener("click", (event) => {
        event.preventDefault();
        registerUser();
    });

    document.getElementById("si").addEventListener("click", (event) => {
        event.preventDefault();
        loginUser();
    });
});

async function registerUser() {
    const name = document.querySelector(".sign-up input[placeholder='Name']").value;
    const email = document.querySelector(".sign-up input[placeholder='Email']").value;
    const password = document.querySelector(".sign-up input[placeholder='Password']").value;

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                alert("Registration successful! Please check your email to verify your account.");
                window.location.href = "/html/login.html";
            } else {
                alert("Error: " + (data.message || "Registration failed"));
            }
        } catch (error) {
            alert("Error: " + text);
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function loginUser() {
    const email = document.querySelector(".sign-in input[placeholder='Email']").value;
    const password = document.querySelector(".sign-in input[placeholder='Password']").value;

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Login successful!");
                window.location.href = "/html/dashboard.html";
            } else {
                alert("Invalid credentials!");
            }
        } catch (error) {
            alert("Error: " + text);
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/html/login.html";
    }
}

function logoutUser() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "/html/login.html";
}

async function fetchUserData() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error:", error);
    }
}