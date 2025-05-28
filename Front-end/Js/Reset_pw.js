// Toast notification function (same as before)
function showToast(message, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <div class="toast-progress"></div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const errorElement = document.getElementById("error-message");
    const resetBtn = document.getElementById("resetBtn");

    // Get token from URL
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
        showError("Invalid reset link - missing token parameter");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            showError("Passwords don't match!");
            return;
        }

        // Show loading state
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        resetBtn.disabled = true;

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        token: token,
                        newPassword: newPassword,
                    }),
                }
            );

            // Clone the response to read it twice if needed
            const responseClone = response.clone();
            
            // Try parsing as JSON first
            try {
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || result.message || "Password reset failed");
                }

                // Store the new JWT token if available
                if (result.token) {
                    localStorage.setItem("token", result.token);
                }

                showToast(result.message || "Password reset successfully!");
                setTimeout(() => {
                    window.location.href = "/html/login.html";
                }, 1500);
            } catch (jsonError) {
                // If JSON parsing fails, fall back to text
                const text = await responseClone.text();
                throw new Error(text || "Password reset failed");
            }
        } catch (error) {
            console.error("Reset error:", error);
            showError(error.message);
            showToast(error.message, "error");
        } finally {
            resetBtn.innerHTML = 'Reset Password';
            resetBtn.disabled = false;
        }
    });

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }

    function hideError() {
        errorElement.style.display = "none";
    }
});