document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;
    
    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }
    
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        // Save user preference
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Login dropdown
    const loginIcon = document.querySelector('.login i');
    const dropdown = document.querySelector('.dropdown');
    
    loginIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
        dropdown.classList.remove('show');
    });
    
    // Card click behavior
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on buy button
            if (!e.target.closest('.buy button')) {
                console.log('Navigating to match details');
                // window.location.href = '/match-details.html';
            }
        });
    });
});