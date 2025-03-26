document.addEventListener("DOMContentLoaded", function () {
    const resetPasswordForm = document.getElementById("resetPasswordForm");

    resetPasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch("http://localhost:8080/api/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Password reset successful! Redirecting to login.");
            window.location.href = "/html/login.html";
        } else {
            alert(data.message || "Error resetting password.");
        }
    });
});
