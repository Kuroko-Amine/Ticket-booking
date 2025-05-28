// Load popup HTML from external file
document.addEventListener('DOMContentLoaded', function() {
    // Load popup content
    fetch('/html/pop-up.html')
        .then(response => {
            if (!response.ok) throw new Error('Popup HTML not found');
            return response.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            initializePopup();
        })
        .catch(err => {
            console.error('Error loading popup:', err);
            
            const fallbackPopup = `
                <div id="popupOverlay" class="popup-overlay">
                    <div class="contact-card">
                        <button class="close-btn" onclick="togglePopup()">&times;</button>
                        <h2>Contact Us</h2>
                        <p>Email us at: contact@footballtickets.com</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', fallbackPopup);
            initializePopup();
        })
        
        .then(html => {
        
            const hiddenHtml = html.replace('popup-overlay', 'popup-overlay hidden');
            document.body.insertAdjacentHTML('beforeend', hiddenHtml);
            initializePopup();
        }

    
    );

});

function initializePopup() {
    // Header contact icon
    document.getElementById('headerContactLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        togglePopup();
    });

    // Footer contact link
    document.getElementById('contactLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        togglePopup();
    });

    // Close when clicking outside
    document.getElementById('popupOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) togglePopup();
    });

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
            document.getElementById('popupOverlay')?.classList.remove('active');
        }
    });
}

function togglePopup() {
    const popup = document.getElementById('popupOverlay');
    if (!popup) {
        console.error('Popup element not found');
        return;
    }
    
    popup.classList.toggle('active');
    
    
    
    // Prevent body scroll when popup is open
    document.body.style.overflow = popup.classList.contains('active') ? 'hidden' : '';
}




