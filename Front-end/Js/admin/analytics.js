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

    // Initialize Analytics with real backend data
    initRealTimeAnalytics();
    
    // Initialize Performance Metrics
    initPerformanceMetrics();
});

// Global variables for charts and performance metrics
let engagementChart = null;
let userRoleChart = null;
let updateInterval = null;
let performanceUpdateInterval = null;
let isLoading = false;

// Initialize Real-Time Analytics System
function initRealTimeAnalytics() {
    console.log('🚀 Initializing Real-Time Analytics System...');
    
    // Initialize charts
    initEngagementChart();
    initUserRoleChart();
    
    // Load initial data
    loadRealAnalyticsData();
    
    // Set up real-time updates every 15 seconds
    updateInterval = setInterval(() => {
        loadRealAnalyticsData();
        console.log('📊 Real analytics data refreshed');
    }, 15000);
    
    // Set up time filter
    setupTimeFilter();
    
    // Set up manual refresh button
    setupRefreshButton();
    
    console.log('✅ Real-Time Analytics System initialized');
}

// Initialize Performance Metrics System
function initPerformanceMetrics() {
    console.log('🚀 Initializing Performance Metrics System...');
    
    // Replace the existing metrics with our new ones
    replacePerformanceMetrics();
    
    // Load initial performance data
    loadPerformanceMetrics();
    
    // Set up real-time updates every 20 seconds for performance metrics
    performanceUpdateInterval = setInterval(() => {
        loadPerformanceMetrics();
        console.log('📊 Performance metrics refreshed');
    }, 20000);
    
    console.log('✅ Performance Metrics System initialized');
}

// Replace existing performance metrics with Total Users and Total Matches
function replacePerformanceMetrics() {
    const metricsGrid = document.querySelector('.metrics-grid');
    if (!metricsGrid) {
        console.error('Metrics grid not found');
        return;
    }
    
    // Clear existing metrics
    metricsGrid.innerHTML = '';
    
    // Add Total Users metric
    const totalUsersMetric = document.createElement('div');
    totalUsersMetric.className = 'metric';
    totalUsersMetric.setAttribute('data-metric', 'total-users');
    totalUsersMetric.innerHTML = `
        <div class="metric-value">0</div>
        <div class="metric-label">Total Users</div>
        <div class="metric-change neutral">0%</div>
    `;
    
    // Add Total Matches metric
    const totalMatchesMetric = document.createElement('div');
    totalMatchesMetric.className = 'metric';
    totalMatchesMetric.setAttribute('data-metric', 'total-matches');
    totalMatchesMetric.innerHTML = `
        <div class="metric-value">0</div>
        <div class="metric-label">Total Matches</div>
        <div class="metric-change neutral">0%</div>
    `;
    
    // Add metrics to grid
    metricsGrid.appendChild(totalUsersMetric);
    metricsGrid.appendChild(totalMatchesMetric);
    
    console.log('✅ Performance metrics replaced successfully');
}

// Load performance metrics data
async function loadPerformanceMetrics() {
    try {
        console.log('📡 Fetching performance metrics data...');
        
        // Show loading state for performance metrics
        showPerformanceLoading();
        
        // Fetch data from both endpoints simultaneously
        const [users, matches] = await Promise.all([
            fetchUsersFromBackend(),
            fetchMatchesFromBackend()
        ]);
        
        // Process performance data
        const performanceData = processPerformanceData(users, matches);
        
        // Update performance metrics
        updatePerformanceMetrics(performanceData);
        
        // Hide loading state
        hidePerformanceLoading();
        
        console.log('✅ Performance metrics loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading performance metrics:', error);
        showPerformanceError();
    }
}

// Update performance metrics in the UI
function updatePerformanceMetrics(data) {
    // Update Total Users
    const totalUsersElement = document.querySelector('.metric[data-metric="total-users"] .metric-value');
    const usersGrowthElement = document.querySelector('.metric[data-metric="total-users"] .metric-change');
    
    if (totalUsersElement) {
        animatePerformanceNumber(totalUsersElement, data.totalUsers);
    }
    
    if (usersGrowthElement) {
        updatePerformanceGrowthIndicator(usersGrowthElement, data.userGrowth);
    }
    
    // Update Total Matches
    const totalMatchesElement = document.querySelector('.metric[data-metric="total-matches"] .metric-value');
    const matchesGrowthElement = document.querySelector('.metric[data-metric="total-matches"] .metric-change');
    
    if (totalMatchesElement) {
        animatePerformanceNumber(totalMatchesElement, data.totalMatches);
    }
    
    if (matchesGrowthElement) {
        updatePerformanceGrowthIndicator(matchesGrowthElement, data.matchGrowth);
    }
    
    console.log(`📊 Performance metrics updated: ${data.totalUsers} users, ${data.totalMatches} matches`);
}

// Animate performance numbers
function animatePerformanceNumber(element, targetValue) {
    const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
    const duration = 1500;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic);
        
        // Format number with K suffix if needed
        if (currentValue >= 1000) {
            const kValue = (currentValue / 1000).toFixed(1);
            element.textContent = `${kValue}K`;
        } else {
            element.textContent = currentValue.toString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Update performance growth indicator
function updatePerformanceGrowthIndicator(element, growthValue) {
    const isPositive = growthValue > 0;
    const isNegative = growthValue < 0;
    const absValue = Math.abs(growthValue);
    
    // Update classes for styling
    element.className = 'metric-change';
    
    if (isPositive) {
        element.classList.add('positive');
        element.textContent = `+${absValue}%`;
    } else if (isNegative) {
        element.classList.add('negative');
        element.textContent = `-${absValue}%`;
    } else {
        element.classList.add('neutral');
        element.textContent = '0%';
    }
}

// Show loading state for performance metrics
function showPerformanceLoading() {
    const metricValues = document.querySelectorAll('.metric .metric-value');
    metricValues.forEach(element => {
        element.style.opacity = '0.5';
    });
}

// Hide loading state for performance metrics
function hidePerformanceLoading() {
    const metricValues = document.querySelectorAll('.metric .metric-value');
    metricValues.forEach(element => {
        element.style.opacity = '1';
    });
}

// Show error state for performance metrics
function showPerformanceError() {
    hidePerformanceLoading();
    console.error('Failed to load performance metrics');
    
    // You can add visual error indicators here if needed
    const metricValues = document.querySelectorAll('.metric .metric-value');
    metricValues.forEach(element => {
        element.textContent = 'Error';
        element.style.color = '#e74c3c';
    });
    
    // Reset after 3 seconds
    setTimeout(() => {
        metricValues.forEach(element => {
            element.textContent = '0';
            element.style.color = '';
        });
    }, 3000);
}

// Load real analytics data from backend (including performance metrics)
async function loadRealAnalyticsData(period = 'daily') {
    if (isLoading) return;
    
    try {
        isLoading = true;
        console.log(`📡 Fetching real analytics data for period: ${period}`);
        
        // Show loading state
        showLoadingState();
        
        // Fetch data from both endpoints simultaneously
        const [users, matches] = await Promise.all([
            fetchUsersFromBackend(),
            fetchMatchesFromBackend()
        ]);
        
        // Process real user data
        const analyticsData = processRealUserData(users, period);
        
        // Update charts with real data
        updateEngagementChart(analyticsData.engagement, period);
        updateUserRoleChart(analyticsData.roles);
        
        // Hide loading state
        hideLoadingState();
        
        console.log('✅ Real analytics data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading real analytics data:', error);
        showErrorState();
    } finally {
        isLoading = false;
    }
}

// Fetch users from your backend
async function fetchUsersFromBackend() {
    try {
        const response = await fetch('http://localhost:8080/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        console.log(`👥 Fetched ${users.length} users from backend`);
        return users;
        
    } catch (error) {
        console.error('Error fetching users from backend:', error);
        throw error;
    }
}

// Fetch matches from your backend
async function fetchMatchesFromBackend() {
    try {
        const response = await fetch('http://localhost:8080/api/matches', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const matches = await response.json();
        console.log(`⚽ Fetched ${matches.length} matches from backend`);
        return matches;
        
    } catch (error) {
        console.error('Error fetching matches from backend:', error);
        // Return empty array if matches endpoint fails
        return [];
    }
}

// Process performance data for total users and total matches
function processPerformanceData(users, matches) {
    const totalUsers = users.length;
    const totalMatches = matches.length;
    
    // Calculate user growth (last 7 days vs previous 7 days)
    const userGrowth = calculateUserGrowth(users);
    
    // Calculate match growth (last 7 days vs previous 7 days)
    const matchGrowth = calculateMatchGrowth(matches);
    
    return {
        totalUsers,
        totalMatches,
        userGrowth,
        matchGrowth
    };
}

// Calculate user growth percentage
function calculateUserGrowth(users) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    
    // Users in last 7 days
    const recentUsers = users.filter(user => {
        const createdDate = parseUserDate(user);
        return createdDate && createdDate >= sevenDaysAgo;
    }).length;
    
    // Users in previous 7 days (7-14 days ago)
    const previousUsers = users.filter(user => {
        const createdDate = parseUserDate(user);
        return createdDate && createdDate >= fourteenDaysAgo && createdDate < sevenDaysAgo;
    }).length;
    
    // Calculate growth percentage
    if (previousUsers === 0) {
        return recentUsers > 0 ? 100 : 0;
    }
    
    const growth = ((recentUsers - previousUsers) / previousUsers) * 100;
    return Math.round(growth * 10) / 10; // Round to 1 decimal place
}

// Calculate match growth percentage
function calculateMatchGrowth(matches) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    
    // Matches in last 7 days
    const recentMatches = matches.filter(match => {
        const createdDate = parseMatchDate(match);
        return createdDate && createdDate >= sevenDaysAgo;
    }).length;
    
    // Matches in previous 7 days (7-14 days ago)
    const previousMatches = matches.filter(match => {
        const createdDate = parseMatchDate(match);
        return createdDate && createdDate >= fourteenDaysAgo && createdDate < sevenDaysAgo;
    }).length;
    
    // Calculate growth percentage
    if (previousMatches === 0) {
        return recentMatches > 0 ? 100 : 0;
    }
    
    const growth = ((recentMatches - previousMatches) / previousMatches) * 100;
    return Math.round(growth * 10) / 10; // Round to 1 decimal place
}

// Parse match creation date from various possible fields
function parseMatchDate(match) {
    const possibleDateFields = ['createdAt', 'dateCreated', 'matchDate', 'created'];
    
    for (const field of possibleDateFields) {
        if (match[field]) {
            const date = new Date(match[field]);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    return null;
}

// Process real user data to create analytics
function processRealUserData(users, period) {
    const now = new Date();
    
    // Calculate real engagement data based on user registration dates
    const engagementData = calculateRealEngagement(users, period);
    
    // Calculate role distribution
    const roleData = calculateRoleDistribution(users);
    
    return {
        engagement: engagementData,
        roles: roleData
    };
}

// Calculate real user engagement based on registration dates
function calculateRealEngagement(users, period) {
    const now = new Date();
    let labels = [];
    let data = [];
    
    switch (period) {
        case 'daily':
            // Last 7 days
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = calculateDailyRegistrations(users);
            break;
            
        case 'weekly':
            // Last 6 weeks
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
            data = calculateWeeklyRegistrations(users);
            break;
            
        case 'monthly':
            // Last 12 months
            labels = getLastMonthsLabels(12);
            data = calculateMonthlyRegistrations(users);
            break;
    }
    
    return { labels, data };
}

// Calculate daily user registrations for the last 7 days
function calculateDailyRegistrations(users) {
    const dailyData = [0, 0, 0, 0, 0, 0, 0]; // 7 days
    const now = new Date();
    
    users.forEach(user => {
        const createdDate = parseUserDate(user);
        if (createdDate) {
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= 0 && daysDiff < 7) {
                const dayIndex = 6 - daysDiff; // Reverse order (most recent = Sunday)
                dailyData[dayIndex]++;
            }
        }
    });
    
    return dailyData;
}

// Calculate weekly user registrations for the last 6 weeks
function calculateWeeklyRegistrations(users) {
    const weeklyData = [0, 0, 0, 0, 0, 0]; // 6 weeks
    const now = new Date();
    
    users.forEach(user => {
        const createdDate = parseUserDate(user);
        if (createdDate) {
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            const weeksDiff = Math.floor(daysDiff / 7);
            
            if (weeksDiff >= 0 && weeksDiff < 6) {
                const weekIndex = 5 - weeksDiff; // Reverse order (most recent = Week 6)
                weeklyData[weekIndex]++;
            }
        }
    });
    
    return weeklyData;
}

// Calculate monthly user registrations for the last 12 months
function calculateMonthlyRegistrations(users) {
    const monthlyData = new Array(12).fill(0); // 12 months
    const now = new Date();
    
    users.forEach(user => {
        const createdDate = parseUserDate(user);
        if (createdDate) {
            const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                             (now.getMonth() - createdDate.getMonth());
            
            if (monthsDiff >= 0 && monthsDiff < 12) {
                const monthIndex = 11 - monthsDiff; // Reverse order (most recent = last month)
                monthlyData[monthIndex]++;
            }
        }
    });
    
    return monthlyData;
}

// Parse user creation date from various possible fields
function parseUserDate(user) {
    const possibleDateFields = ['createdAt', 'joinDate', 'registrationDate', 'dateCreated'];
    
    for (const field of possibleDateFields) {
        if (user[field]) {
            const date = new Date(user[field]);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    // If no valid date found, return null
    return null;
}

// Get labels for the last N months
function getLastMonthsLabels(count) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(months[date.getMonth()]);
    }
    
    return labels;
}

// Calculate role distribution from real user data
function calculateRoleDistribution(users) {
    const roleCounts = {
        'USER': 0,
        'ADMIN': 0,
        'MODERATOR': 0,
        'GUEST': 0
    };
    
    users.forEach(user => {
        const role = user.role || 'USER';
        if (roleCounts.hasOwnProperty(role)) {
            roleCounts[role]++;
        } else {
            roleCounts['USER']++; // Default to USER for unknown roles
        }
    });
    
    return {
        labels: Object.keys(roleCounts).filter(role => roleCounts[role] > 0),
        data: Object.values(roleCounts).filter(count => count > 0)
    };
}

// Initialize Engagement Chart
function initEngagementChart() {
    const engagementCtx = document.getElementById('engagementChart');
    if (!engagementCtx) {
        console.error('Engagement chart canvas not found');
        return;
    }
    
    engagementChart = new Chart(engagementCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'User Registrations',
                data: [],
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: "'Poppins', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Poppins', sans-serif",
                        size: 12
                    },
                    callbacks: {
                        label: function(context) {
                            return `Registrations: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Math.floor(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Initialize User Role Chart
function initUserRoleChart() {
    const roleCtx = document.getElementById('trafficChart'); // Reusing the traffic chart canvas
    if (!roleCtx) {
        console.error('Role chart canvas not found');
        return;
    }
    
    userRoleChart = new Chart(roleCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',   // USER - Green
                    'rgba(231, 76, 60, 0.8)',    // ADMIN - Red
                    'rgba(52, 152, 219, 0.8)',   // MODERATOR - Blue
                    'rgba(241, 196, 15, 0.8)'    // GUEST - Yellow
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(231, 76, 60, 1)',
                    'rgba(52, 152, 219, 1)',
                    'rgba(241, 196, 15, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: "'Poppins', sans-serif",
                        size: 12
                    },
                    bodyFont: {
                        family: "'Poppins', sans-serif",
                        size: 12
                    },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update Engagement Chart with real data
function updateEngagementChart(data, period) {
    if (!engagementChart) return;
    
    engagementChart.data.labels = data.labels;
    engagementChart.data.datasets[0].data = data.data;
    
    // Update chart title based on period
    const chartTitle = period === 'daily' ? 'Daily User Registrations' : 
                      period === 'weekly' ? 'Weekly User Registrations' : 
                      'Monthly User Registrations';
    
    engagementChart.data.datasets[0].label = chartTitle;
    engagementChart.update('active');
}

// Update User Role Chart with real data
function updateUserRoleChart(data) {
    if (!userRoleChart) return;
    
    userRoleChart.data.labels = data.labels;
    userRoleChart.data.datasets[0].data = data.data;
    userRoleChart.update('active');
}

// Update metrics cards with real data (including performance metrics)
function updateRealMetricsCards(metrics, performanceData) {
    // Performance Metrics - Total Users
    const totalUsersElement = document.querySelector('.analytics-metric[data-metric="total-users"] .metric-value');
    const usersGrowthElement = document.querySelector('.analytics-metric[data-metric="total-users"] .metric-growth');
    
    if (totalUsersElement) {
        animateNumber(totalUsersElement, performanceData.totalUsers);
    }
    
    if (usersGrowthElement) {
        updateGrowthIndicator(usersGrowthElement, performanceData.userGrowth);
    }
    
    // Performance Metrics - Total Matches
    const totalMatchesElement = document.querySelector('.analytics-metric[data-metric="total-matches"] .metric-value');
    const matchesGrowthElement = document.querySelector('.analytics-metric[data-metric="total-matches"] .metric-growth');
    
    if (totalMatchesElement) {
        animateNumber(totalMatchesElement, performanceData.totalMatches);
    }
    
    if (matchesGrowthElement) {
        updateGrowthIndicator(matchesGrowthElement, performanceData.matchGrowth);
    }
    
    // Update last updated timestamp
    updateLastUpdated();
}

// Update growth indicator with color and icon
function updateGrowthIndicator(element, growthValue) {
    const isPositive = growthValue > 0;
    const isNegative = growthValue < 0;
    const isNeutral = growthValue === 0;
    
    // Update classes for styling
    element.className = 'metric-growth';
    
    if (isPositive) {
        element.classList.add('positive');
        element.innerHTML = `<i class="bx bx-trending-up"></i> +${Math.abs(growthValue)}%`;
    } else if (isNegative) {
        element.classList.add('negative');
        element.innerHTML = `<i class="bx bx-trending-down"></i> -${Math.abs(growthValue)}%`;
    } else {
        element.classList.add('neutral');
        element.innerHTML = `<i class="bx bx-minus"></i> 0%`;
    }
}

// Update last updated timestamp
function updateLastUpdated() {
    const lastUpdatedElement = document.querySelector('.analytics-last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdatedElement.textContent = `Last updated: ${timeString}`;
    }
}

// Animate number changes
function animateNumber(element, targetValue, suffix = '') {
    const startValue = parseFloat(element.textContent.replace(/[^\d.]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        // Format number based on suffix
        let displayValue;
        if (suffix === '%') {
            displayValue = Math.round(currentValue);
        } else if (targetValue < 10) {
            displayValue = Math.round(currentValue * 10) / 10; // 1 decimal place
        } else {
            displayValue = Math.round(currentValue);
        }
        
        element.textContent = displayValue.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Setup time filter functionality
function setupTimeFilter() {
    const timeFilter = document.getElementById('analytics-time-filter');
    if (!timeFilter) return;
    
    timeFilter.addEventListener('change', function() {
        const selectedPeriod = this.value;
        console.log(`📅 Time filter changed to: ${selectedPeriod}`);
        
        // Load new data
        loadRealAnalyticsData(selectedPeriod);
    });
}

// Setup manual refresh button
function setupRefreshButton() {
    const refreshButton = document.getElementById('analytics-refresh');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', function() {
        if (isLoading) return;
        
        console.log('🔄 Manual refresh triggered');
        
        // Add loading animation to button
        const originalContent = this.innerHTML;
        this.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
        this.disabled = true;
        
        // Get current period
        const timeFilter = document.getElementById('analytics-time-filter');
        const currentPeriod = timeFilter ? timeFilter.value : 'daily';
        
        // Load data
        loadRealAnalyticsData(currentPeriod).finally(() => {
            // Restore button
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
            }, 1000);
        });
    });
}

// Show loading state
function showLoadingState() {
    const loadingElements = document.querySelectorAll('.analytics-loading');
    loadingElements.forEach(element => {
        element.style.display = 'flex';
    });
    
    const metricElements = document.querySelectorAll('.analytics-metric .metric-value');
    metricElements.forEach(element => {
        element.style.opacity = '0.5';
    });
}

// Hide loading state
function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.analytics-loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
    
    const metricElements = document.querySelectorAll('.analytics-metric .metric-value');
    metricElements.forEach(element => {
        element.style.opacity = '1';
    });
}

// Show error state
function showErrorState() {
    hideLoadingState();
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'analytics-error';
    errorMessage.innerHTML = `
        <i class="bx bx-error-circle"></i>
        <p>Failed to load analytics data. Please check your connection.</p>
        <button onclick="loadRealAnalyticsData()" class="retry-btn">Retry</button>
    `;
    
    // Add to analytics container
    const analyticsContainer = document.querySelector('.analytics-container');
    if (analyticsContainer) {
        // Remove existing error messages
        const existingError = analyticsContainer.querySelector('.analytics-error');
        if (existingError) {
            existingError.remove();
        }
        
        analyticsContainer.appendChild(errorMessage);
    }
}

// Cleanup function for when leaving the page
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
        console.log('🧹 Analytics update interval cleared');
    }
    
    if (performanceUpdateInterval) {
        clearInterval(performanceUpdateInterval);
        console.log('🧹 Performance metrics update interval cleared');
    }
});

// Export functions for global access
window.loadRealAnalyticsData = loadRealAnalyticsData;
window.loadPerformanceMetrics = loadPerformanceMetrics;

console.log('✅ Real-Time Analytics with Performance Metrics loaded successfully');