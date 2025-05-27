function showToast(message, type = 'success') {
    // Remove any existing toasts
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
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove the toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotPasswordForm");
    const resetBtn = document.getElementById("sendResetLink");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotPasswordEmail").value;

        if (!email) {
            showToast("Please enter a valid email address", "error");
            return;
        }

        // Show loading state
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        resetBtn.disabled = true;

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
                    showToast("Password reset link sent! Check your email.");
                    setTimeout(() => {
                        window.location.href = "/html/login.html";
                    }, 2000);
                } else {
                    showToast(data.message || "Failed to send reset link", "error");
                }
            } catch (error) {
                showToast(text || "An error occurred", "error");
            }
        } catch (error) {
            showToast(error.message || "Network error occurred", "error");
        } finally {
            resetBtn.innerHTML = 'Send Reset Link';
            resetBtn.disabled = false;
        }
    });
});