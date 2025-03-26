document.getElementById("resetPasswordButton").addEventListener("click", async (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword })
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                alert("Password reset successful! You can now log in.");
                window.location.href = "/html/login.html";
            } else {
                alert("Error: " + (data.message || "Failed to reset password."));
            }
        } catch (error) {
            alert("Error: " + text);
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
    
});
