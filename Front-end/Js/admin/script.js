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

    // INITIAL RESPONSIVE CHECK
    if(window.innerWidth < 768) {
        sidebar.classList.add('hide');
    } else if(window.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }

    // WINDOW RESIZE EVENT
    window.addEventListener('resize', function() {
        if(this.innerWidth > 576) {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
            searchForm.classList.remove('show');
        }
    });

    // DARK MODE TOGGLE - FIXED
    const switchMode = document.getElementById('switch-mode');
    
    // Fix dark mode toggle
    switchMode.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        if(document.body.classList.contains('dark')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Check for saved dark mode preference
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark');
        switchMode.checked = true;
    }

    // Set active menu item based on current page
    function setActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        const sideMenuItems = document.querySelectorAll('#sidebar .side-menu li');
        
        sideMenuItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            const linkPage = link.getAttribute('href');
            
            if (currentPage === linkPage || 
                (currentPage === '' && linkPage === 'index.html') || 
                (currentPage === '/' && linkPage === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
    
    // Call this function to set the active menu item
    setActiveMenuItem();

    // DASHBOARD STATS FUNCTIONALITY
    async function fetchDashboardStats() {
        try {
            // Fetch all users
            const usersResponse = await fetch('http://localhost:8080/api/users');
            if (!usersResponse.ok) throw new Error('Failed to fetch users');
            const users = await usersResponse.json();

            // Fetch all matches
            const matchesResponse = await fetch('http://localhost:8080/api/matches');
            if (!matchesResponse.ok) throw new Error('Failed to fetch matches');
            const matches = await matchesResponse.json();

            // Calculate stats
            const totalAdmins = users.filter(user => user.role === 'ADMIN').length;
            const totalUsers = users.length;
            const totalMatches = matches.length;

            // Update the UI
            document.getElementById('total-admins').textContent = totalAdmins;
            document.getElementById('total-users').textContent = totalUsers;
            document.getElementById('total-matches').textContent = totalMatches;

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Set default values if fetch fails
            document.getElementById('total-admins').textContent = '0';
            document.getElementById('total-users').textContent = '0';
            document.getElementById('total-matches').textContent = '0';
        }
    }

    // Initial stats load
    fetchDashboardStats();

    // Auto-refresh stats every 60 seconds
    setInterval(fetchDashboardStats, 60000);

    // RECENT USERS FUNCTIONALITY
    const usersListContainer = document.getElementById('users-list');
    const refreshButton = document.getElementById('refresh-users');
    
    if (usersListContainer) {
        // Function to fetch and display the last two users
        async function fetchRecentUsers() {
            try {
                showLoading();
                
                const response = await fetch('http://localhost:8080/api/users');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const users = await response.json();
                
                if (users && users.length > 0) {
                    // Get the last two users (assuming the last ones are the most recently created)
                    const recentUsers = users.slice(-2).reverse(); // Get last 2 and reverse to show newest first
                    displayUsers(recentUsers);
                } else {
                    showNoUsers();
                }
                
            } catch (error) {
                console.error('Error fetching users:', error);
                showError('Failed to load user data. Please check your connection.');
            }
        }
        
        // Function to display loading state
        function showLoading() {
            usersListContainer.innerHTML = `
                <div class="loading">
                    <i class='bx bx-loader-alt bx-spin'></i>
                    <p>Loading user data...</p>
                </div>
            `;
        }
        
        // Function to display users information
        function displayUsers(users) {
            let usersHTML = '';
            
            users.forEach((user, index) => {
                const userInitials = getUserInitials(user.email);
                const roleClass = user.role === 'ADMIN' ? 'role-admin' : 'role-user';
                const joinDate = formatDate(user.createdAt || new Date());
                const isNewest = index === 0;
                
                usersHTML += `
                    <div class="user-card ${isNewest ? 'newest' : ''}">
                        <div class="user-main-info">
                            <div class="user-avatar">${userInitials}</div>
                            <div class="user-details">
                                <h4>${user.email}</h4>
                                <p></p>
                            </div>
                        </div>
                        <div class="user-meta">
                            <div class="meta-item">
                                <span class="label">Role</span>
                                <span class="role-badge ${roleClass}">${user.role}</span>
                            </div>
                            <div class="meta-item">
                                <span class="label">Joined</span>
                                <span class="join-date">${joinDate}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            usersListContainer.innerHTML = usersHTML;
        }
        
        // Function to show error message
        function showError(message) {
            usersListContainer.innerHTML = `
                <div class="error">
                    <i class='bx bx-error-circle'></i>
                    <p>${message}</p>
                </div>
            `;
        }
        
        // Function to show no users message
        function showNoUsers() {
            usersListContainer.innerHTML = `
                <div class="no-users">
                    <i class='bx bx-user-x'></i>
                    <p>No users found in the system.</p>
                </div>
            `;
        }
        
        // Helper function to get user initials
        function getUserInitials(firstName, lastName) {
            const first = firstName ? firstName.charAt(0).toUpperCase() : '';
            const last = lastName ? lastName.charAt(0).toUpperCase() : '';
            return first + last || 'U';
        }
        
        // Helper function to format date
        function formatDate(dateString) {
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (error) {
                return 'Unknown';
            }
        }
        
        // Refresh button functionality
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                fetchRecentUsers();
            });
        }
        
        // Initial load
        fetchRecentUsers();
        
        // Auto-refresh every 30 seconds
        setInterval(fetchRecentUsers, 30000);
    }
});