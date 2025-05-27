window.addEventListener('scroll', function() {
    const header = document.getElementById('stickyHeader');
    if (window.scrollY > 100) { // Show header after scrolling 100px
        header.classList.add('visible');
    } else {
        header.classList.remove('visible');
    }
});