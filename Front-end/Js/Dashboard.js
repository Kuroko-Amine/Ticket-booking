const API_URL = "http://localhost:8080/api"; // Change to your backend URL

// Function to get JWT Token from localStorage
function getAuthToken() {
    return localStorage.getItem("jwtToken"); // Ensure token is stored after login
}

// Function to fetch and display users
async function fetchUsers() {
    try {
        const token = getAuthToken();
        if (!token) {
            alert("You need to log in first.");
            window.location.href = "/html/login.html"; // Redirect if not logged in
            return;
        }

        // Fetch users from the backend
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Function to fetch the logged-in user's details
async function getCurrentUser() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        return await response.json();
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

// Function to display users in a table
async function displayUsers(users) {
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const tableBody = document.querySelector("#userTable tbody");
    tableBody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="admin" onclick="promoteUser('${user.email}')" 
                    ${!isAdmin || user.role === 'ADMIN' ? 'disabled' : ''}>
                    Promote to Admin
                </button>
                <button class="delete" onclick="deleteUser('${user.email}')"
                    ${!isAdmin ? 'disabled' : ''}>
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to promote a user to Admin
async function promoteUser(userEmail) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/auth/promote`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: userEmail })
        });

        if (!response.ok) throw new Error("Failed to promote user");

        alert("User promoted to admin!");
        fetchUsers();
    } catch (error) {
        console.error("Error promoting user:", error);
    }
}

// Function to delete a user
async function deleteUser(userEmail) {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return;

    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/auth/delete`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: userEmail })
        });

        if (!response.ok) throw new Error("Failed to delete user");

        alert("User deleted successfully.");
        fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Load users when the page loads
fetchUsers();
