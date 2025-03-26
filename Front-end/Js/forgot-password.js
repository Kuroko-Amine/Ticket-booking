document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sendResetLink").addEventListener("click", async (event) => {
        event.preventDefault();
        const email = document.getElementById("forgotPasswordEmail").value;

        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (response.ok) {
                    alert("Password reset link sent! Check your email.");
                } else {
                    alert("Error: " + (data.message || "Failed to send reset link."));
                }
            } catch (error) {
                alert("Error: " + text);
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
});
