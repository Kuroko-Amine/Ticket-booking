document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "http://localhost:8080/api/matches";
  let editingMatchId = null;
  let matchesCache = [];
  let isLoading = false;

  // Toast notification system
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        ${type === "success" ? '<i class="bx bx-check-circle"></i>' : ""}
        ${type === "error" ? '<i class="bx bx-error-circle"></i>' : ""}
        ${type === "loading" ? '<i class="bx bx-loader-circle bx-spin"></i>' : ""}
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="bx bx-x"></i>
      </button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    if (type !== "loading") {
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 5000);
    }
    return toast;
  }

  // Fetch matches with caching and error handling
  async function fetchMatches() {
    if (isLoading) return;
    isLoading = true;
    const loadingToast = showToast("Loading matches...", "loading");

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch matches");
      matchesCache = await response.json();
      renderMatches(matchesCache);
      loadingToast.remove();
    } catch (error) {
      loadingToast.remove();
      showToast(error.message, "error");
      console.error("Error loading matches:", error);
    } finally {
      isLoading = false;
    }
  }

  // Render matches with search and filter capabilities
  function renderMatches(matches) {
    const grid = document.querySelector(".matches-grid");
    if (!grid) {
      console.error(".matches-grid not found in DOM");
      return;
    }

    const searchTerm = document.getElementById("match-search")?.value.toLowerCase() || "";
    const sportType = document.getElementById("sport-filter")?.value || "";

    const filteredMatches = matches.filter(match => {
      const matchesSearch = 
        match.team1?.toLowerCase().includes(searchTerm) ||
        match.team2?.toLowerCase().includes(searchTerm) ||
        match.venue?.toLowerCase().includes(searchTerm);
      const matchesSport = !sportType || match.sportType === sportType;
      return matchesSearch && matchesSport;
    });

    grid.innerHTML = "";

    if (filteredMatches.length === 0) {
      grid.innerHTML = '<div class="no-matches">No matches found</div>';
      return;
    }

    filteredMatches.forEach(match => {
      const matchDate = new Date(match.matchDate);
      const formattedDate = matchDate.toLocaleString("en-US", {
        weekday: "short", 
        day: "numeric", 
        month: "short", 
        year: "numeric",
        hour: "2-digit", 
        minute: "2-digit"
      });

      const card = document.createElement("div");
      card.className = "match-card";
      card.innerHTML = `
        <div class="match-card-inner">
          <div class="match-image-container">
            <img src="${API_BASE_URL}/${match.id}/photo?${Date.now()}" 
                 alt="${match.team1} vs ${match.team2}" 
                 class="match-image"
                 onerror="this.onerror=null;this.src='/images/fallback.jpg'">
            <div class="sport-badge">${match.sportType}</div>
          </div>
          <div class="match-details">
            <div class="teams">${match.team1} vs ${match.team2}</div>
            <div class="match-info">
              <span class="match-date"><i class='bx bx-calendar'></i> ${formattedDate}</span>
              <span class="match-price"><i class='bx bx-euro'></i> ${match.ticketPrice}</span>
            </div>
            <div class="match-stadium"><i class='bx bx-map'></i> ${match.venue}</div>
            <div class="tickets-available">
              <i class='bx bx-chair'></i> ${match.venueCapacity} seats available
            </div>
            <div class="match-actions">
              <button class="edit-btn" data-id="${match.id}">
                <i class='bx bx-edit'></i> Edit
              </button>
              <button class="delete-btn" data-id="${match.id}">
                <i class='bx bx-trash'></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Add event listeners to the new buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => editMatch(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteMatch(parseInt(btn.dataset.id)));
    });
  }

  // Handle match form submission
  async function submitMatch(event) {
    event.preventDefault();
    if (isLoading) return;

    // Get the submit button from modal footer
    const submitBtn = document.querySelector("#add-match-modal .submit-btn");
    if (!submitBtn) {
      console.error("Submit button not found");
      return;
    }

    const form = event.target;
    const imageFile = document.getElementById("image-upload")?.files[0];

    // Validate required fields
    const requiredFields = [
      "sport-type", "home-team", "away-team", 
      "match-date", "stadium", "ticket-price", "total-tickets"
    ];
    
    let isValid = true;
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add("error");
        isValid = false;
      } else {
        field.classList.remove("error");
      }
    });

    if (!isValid) {
      showToast("Please fill all required fields", "error");
      return;
    }

    isLoading = true;
    submitBtn.disabled = true;
    const loadingToast = showToast(editingMatchId ? "Updating match..." : "Adding match...", "loading");

    try {
      const matchData = {
        sportType: document.getElementById("sport-type").value,
        team1: document.getElementById("home-team").value,
        team2: document.getElementById("away-team").value,
        matchDate: document.getElementById("match-date").value,
        venue: document.getElementById("stadium").value,
        ticketPrice: parseFloat(document.getElementById("ticket-price").value),
        venueCapacity: parseInt(document.getElementById("total-tickets").value),
        description: document.getElementById("match-description").value || "Match info",
        imageUrl: document.getElementById("match-image").value || "",
        hotMatch: document.getElementById("trending-match")?.value === "true",
        ticketAvailability: document.getElementById("ticket-availability")?.value || "available"
      };

      const method = editingMatchId ? "PUT" : "POST";
      const url = editingMatchId ? `${API_BASE_URL}/${editingMatchId}` : API_BASE_URL;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData)
      });

      if (!response.ok) throw new Error("Failed to save match");
      const savedMatch = await response.json();

      // Handle image upload if file was selected
      if (imageFile) {
        await uploadMatchPhoto(savedMatch.id, imageFile);
      }

      // Update cache and UI
      if (editingMatchId) {
        matchesCache = matchesCache.map(m => m.id === savedMatch.id ? savedMatch : m);
      } else {
        matchesCache.unshift(savedMatch);
      }

      renderMatches(matchesCache);
      form.reset();
      editingMatchId = null;
      document.getElementById("add-match-modal").style.display = "none";
      showToast(editingMatchId ? "Match updated successfully" : "Match added successfully");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Error saving match:", error);
    } finally {
      isLoading = false;
      submitBtn.disabled = false;
      loadingToast.remove();
    }
  }

  // Upload match photo
  async function uploadMatchPhoto(matchId, imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${matchId}/photo`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Photo upload failed");
    } catch (error) {
      throw error;
    }
  }

  // Edit match function
  async function editMatch(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error("Match not found");
      const match = await response.json();

      // Populate form fields
      document.getElementById("sport-type").value = match.sportType;
      document.getElementById("home-team").value = match.team1;
      document.getElementById("away-team").value = match.team2;
      document.getElementById("match-date").value = match.matchDate.slice(0, 16);
      document.getElementById("stadium").value = match.venue;
      document.getElementById("ticket-price").value = match.ticketPrice;
      document.getElementById("total-tickets").value = match.venueCapacity;
      document.getElementById("match-description").value = match.description || "";
      document.getElementById("match-image").value = match.imageUrl || "";
      
      if (document.getElementById("trending-match")) {
        document.getElementById("trending-match").value = match.hotMatch ? "true" : "false";
      }
      if (document.getElementById("ticket-availability")) {
        document.getElementById("ticket-availability").value = match.ticketAvailability || "available";
      }

      // Show existing photo if available
      if (match.hasPhoto) {
        const imagePreview = document.getElementById("image-preview");
        const previewContainer = document.querySelector(".image-preview-container");
        if (imagePreview && previewContainer) {
          imagePreview.src = `${API_BASE_URL}/${match.id}/photo?${Date.now()}`;
          previewContainer.style.display = "block";
        }
      }

      editingMatchId = id;
      document.getElementById("add-match-modal").style.display = "block";
    } catch (error) {
      showToast(error.message, "error");
      console.error("Error loading match:", error);
    }
  }

  // Delete match function
  async function deleteMatch(id) {
    if (!confirm("Are you sure you want to delete this match? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete match");
      
      matchesCache = matchesCache.filter(m => m.id !== id);
      renderMatches(matchesCache);
      showToast("Match deleted successfully");
    } catch (error) {
      showToast(error.message, "error");
      console.error("Error deleting match:", error);
    }
  }

  // Initialize dark mode
  function initDarkMode() {
    const switchMode = document.getElementById("switch-mode");
    if (switchMode) {
      // Set initial state
      if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark");
        switchMode.checked = true;
      }

      // Add event listener
      switchMode.addEventListener("change", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "enabled" : "disabled");
      });
    }
  }

  // Initialize image upload functionality
  function initImageUpload() {
    const uploadBtn = document.getElementById("upload-btn");
    const imageUpload = document.getElementById("image-upload");
    const fileName = document.getElementById("file-name");
    const imagePreview = document.getElementById("image-preview");
    const previewContainer = document.querySelector(".image-preview-container");

    if (uploadBtn && imageUpload) {
      uploadBtn.addEventListener("click", () => imageUpload.click());
      imageUpload.addEventListener("change", function() {
        if (this.files && this.files[0]) {
          // Validate file type
          const validTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!validTypes.includes(this.files[0].type)) {
            showToast("Please upload a valid image (JPEG, PNG, or WebP)", "error");
            this.value = "";
            return;
          }

          // Validate file size (max 5MB)
          if (this.files[0].size > 5 * 1024 * 1024) {
            showToast("Image size must be less than 5MB", "error");
            this.value = "";
            return;
          }

          fileName.textContent = this.files[0].name;
          const reader = new FileReader();
          reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewContainer.style.display = "block";
          };
          reader.readAsDataURL(this.files[0]);
        } else {
          fileName.textContent = "No file selected";
          previewContainer.style.display = "none";
        }
      });
    }
  }

  // Initialize search and filter functionality
  function initSearchFilter() {
    const matchSearch = document.getElementById("match-search");
    const sportFilter = document.getElementById("sport-filter");

    if (matchSearch) {
      let searchTimeout;
      matchSearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          renderMatches(matchesCache);
        }, 300);
      });
    }

    if (sportFilter) {
      sportFilter.addEventListener("change", () => {
        renderMatches(matchesCache);
      });
    }
  }

  // Initialize modal functionality
  function initModal() {
    const addMatchBtn = document.getElementById("add-match-btn");
    const addMatchModal = document.getElementById("add-match-modal");
    const closeModal = document.querySelector(".close-modal");

    if (addMatchBtn) {
      addMatchBtn.addEventListener("click", () => {
        editingMatchId = null;
        document.getElementById("match-form").reset();
        document.querySelector(".image-preview-container").style.display = "none";
        addMatchModal.style.display = "block";
      });
    }

    if (closeModal) {
      closeModal.addEventListener("click", () => {
        addMatchModal.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === addMatchModal) {
        addMatchModal.style.display = "none";
      }
    });
  }

  // Initialize the application
  function init() {
    initDarkMode();
    initImageUpload();
    initSearchFilter();
    initModal();
    
    document.getElementById("match-form").addEventListener("submit", submitMatch);
    fetchMatches();
  }

  // Start the application
  init();
});

       
    
    