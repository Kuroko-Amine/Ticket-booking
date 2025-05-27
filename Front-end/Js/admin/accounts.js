// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // SIDEBAR TOGGLE
    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    menuBar.addEventListener('click', function() {
        sidebar.classList.toggle('hide');
    });

    // SEARCH BAR TOGGLE (for mobile)
    const searchButton = document.querySelector('#content nav form .form-input button');
    const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
    const searchForm = document.querySelector('#content nav form');

    searchButton.addEventListener('click', function(e) {
        if(window.innerWidth < 576) {
            e.preventDefault();
            searchForm.classList.toggle('show');
            if(searchForm.classList.contains('show')) {
                searchButtonIcon.classList.replace('bx-search', 'bx-x');
            } else {
                searchButtonIcon.classList.replace('bx-x', 'bx-search');
            }
        }
    });

    if(window.innerWidth < 768) {
        sidebar.classList.add('hide');
    } else if(window.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }

    window.addEventListener('resize', function() {
        if(this.innerWidth > 576) {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
            searchForm.classList.remove('show');
        }
    });

    const switchMode = document.getElementById('switch-mode');
    switchMode.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        if(document.body.classList.contains('dark')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark');
        switchMode.checked = true;
    }

    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const userSearch = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');

    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            resetUserForm();
            userModal.style.display = 'block';
        });
    }

    if (userModal) {
        const closeUserModal = userModal.querySelector('.close-modal');
        if (closeUserModal) {
            closeUserModal.addEventListener('click', function() {
                userModal.style.display = 'none';
            });
        }
        window.addEventListener('click', function(e) {
            if (e.target === userModal) {
                userModal.style.display = 'none';
            }
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userPassword = document.getElementById('user-password').value;
            const userConfirmPassword = document.getElementById('user-confirm-password').value;
            if (userPassword !== userConfirmPassword) {
                showToast('Passwords do not match!', 'error');
                return;
            }
            userModal.style.display = 'none';
            resetUserForm();
            showToast('Form submitted (not yet wired to backend)');
        });
    }

    function resetUserForm() {
        if (userForm) {
            userForm.reset();
            document.querySelector('#user-modal .submit-btn').textContent = 'Add User';
            document.getElementById('user-modal-title').textContent = 'Add New User';
        }
    }

    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', filterUsers);
    }

    function filterUsers() {
        const searchTerm = userSearch.value.toLowerCase();
        const role = roleFilter.value.toLowerCase();
        const rows = document.querySelectorAll('.users-table tbody tr');
        rows.forEach(row => {
            const userName = row.querySelector('.user-info p').textContent.toLowerCase();
            const userEmail = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const userRole = row.querySelector('.role').textContent.toLowerCase();
            const matchesSearch = userName.includes(searchTerm) || userEmail.includes(searchTerm);
            const matchesRole = role === '' || userRole.includes(role);
            row.style.display = matchesSearch && matchesRole ? '' : 'none';
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async function loadUsers() {
        try {
            const res = await fetch('http://localhost:8080/api/users');
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await res.json();
            const tbody = document.querySelector('.users-table tbody');
            tbody.innerHTML = '';
            
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="user-info">
                            
                            <div>
                                <p>${user.name || 'N/A'}</p>
                                
                            </div>
                        </div>
                    </td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="role ${user.role ? user.role.toLowerCase() : ''}">${user.role || 'N/A'}</span></td>
                    <td><span class="status active">Active</span></td>
                    <td>
                        <div class="actions">
                            <button onclick="promoteUser(${user.id})"><i class='bx bx-up-arrow'></i></button>
                            <button onclick="deleteUser(${user.id})"><i class='bx bx-trash'></i></button>
                        </div>
                    </td>`;
                tbody.appendChild(tr);
            });
        } catch (err) {
            showToast('Error loading users: ' + err.message, 'error');
        }
    }

    window.promoteUser = async function(userId) {
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/promote`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (res.ok) {
                showToast('User promoted successfully');
                await loadUsers();
            } else {
                const error = await res.json();
                throw new Error(error.message || 'Failed to promote user');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    window.deleteUser = async function(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                showToast('User deleted successfully');
                await loadUsers();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    // Update the form submission handler
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                role: document.getElementById('user-role').value,
                password: document.getElementById('user-password').value,
                status: document.getElementById('user-status').value
            };

            const confirmPassword = document.getElementById('user-confirm-password').value;
            
            if (userData.password !== confirmPassword) {
                showToast('Passwords do not match!', 'error');
                return;
            }

            try {
                const res = await fetch('http://localhost:8080/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (res.ok) {
                    showToast('User created successfully');
                    userModal.style.display = 'none';
                    resetUserForm();
                    await loadUsers();
                } else {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to create user');
                }
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // Enhanced toast notification function
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '<i class="bx bx-check-circle"></i>' : ''}
                ${type === 'error' ? '<i class="bx bx-error-circle"></i>' : ''}
                ${type === 'warning' ? '<i class="bx bx-error"></i>' : ''}
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="bx bx-x"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    loadUsers();
});
