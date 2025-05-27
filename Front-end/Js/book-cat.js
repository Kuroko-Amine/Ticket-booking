// Global variables for match data
let currentMatchId = null
let baseMatchPrice = 0
let venueCapacity = 0
let currentMatchInfo = null

// Function to check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("authToken") !== null
}

// Function to get match ID from URL
function getMatchIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("matchId")
}

// Enhanced function to fetch match price and info from backend
async function fetchMatchInfo(matchId) {
  try {
    const token = localStorage.getItem("authToken")
    const headers = {
      "Content-Type": "application/json",
    }

    // Only add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`http://localhost:8080/api/matches/${matchId}/info`, {
      method: "GET",
      headers: headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const matchInfo = await response.json()

    // Handle the response which is now a Map/Object
    baseMatchPrice = matchInfo.price || 50 // Default price if not set
    venueCapacity = matchInfo.venueCapacity || 50000 // Default capacity

    // Store complete match info for sharing with payment page
    currentMatchInfo = {
      id: matchId,
      team1: matchInfo.team1,
      team2: matchInfo.team2,
      venue: matchInfo.venue,
      matchDate: matchInfo.matchDate,
      price: baseMatchPrice,
      venueCapacity: venueCapacity,
    }

    // Store match info in localStorage for payment page
    localStorage.setItem("currentMatchInfo", JSON.stringify(currentMatchInfo))

    console.log(`Match Info - Base Price: ${baseMatchPrice}, Capacity: ${venueCapacity}`)
    console.log("Full match info:", matchInfo)

    // Update page header with match details
    if (matchInfo.team1 && matchInfo.team2) {
      document.querySelector(".fixed-header h1").textContent =
        `${matchInfo.team1} vs ${matchInfo.team2} - Select Your Seats`
    }

    return matchInfo
  } catch (error) {
    console.error("Error fetching match info:", error)
    // Show user-friendly error message
    showErrorMessage("Unable to load match information. Using default pricing.")

    // Fallback values
    baseMatchPrice = 50
    venueCapacity = 50000
    currentMatchInfo = {
      id: matchId,
      team1: "Team A",
      team2: "Team B",
      venue: "Stadium",
      matchDate: new Date().toISOString(),
      price: baseMatchPrice,
      venueCapacity: venueCapacity,
    }

    localStorage.setItem("currentMatchInfo", JSON.stringify(currentMatchInfo))
    return { price: baseMatchPrice, venueCapacity: venueCapacity }
  }
}

// Function to show error messages to user
function showErrorMessage(message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        max-width: 300px;
    `
  errorDiv.textContent = message

  document.body.appendChild(errorDiv)

  // Remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv)
    }
  }, 5000)
}

// Function to calculate dynamic pricing based on seat position and category
function calculateSeatPrice(section, row, category) {
  let priceMultiplier = 1.0
  let rowMultiplier = 1.0
  let categoryMultiplier = 1.0

  // Category-based pricing (VIP to Economy)
  switch (category) {
    case "cat-01": // Premium/VIP
      categoryMultiplier = 3.5
      break
    case "cat-02": // VIP
      categoryMultiplier = 2.8
      break
    case "cat-03": // Standard Premium
      categoryMultiplier = 1.8
      break
    case "cat-04": // Standard
      categoryMultiplier = 1.4
      break
    case "cat-05": // Economy Plus
      categoryMultiplier = 1.1
      break
    case "cat-06": // Economy
      categoryMultiplier = 0.8
      break
    default:
      categoryMultiplier = 1.0
  }

  // Row-based pricing (front seats more expensive)
  if (typeof row === "string") {
    // Handle letter rows (A=1, B=2, etc.)
    if (row.match(/^[A-Z]$/)) {
      const rowNumber = row.charCodeAt(0) - 64 // A=1, B=2, etc.
      rowMultiplier = Math.max(0.7, 2.0 - rowNumber * 0.1)
    } else if (row.match(/^\d+$/)) {
      // Handle numeric rows
      const rowNumber = Number.parseInt(row)
      rowMultiplier = Math.max(0.6, 1.8 - rowNumber * 0.03)
    } else {
      // Handle complex row identifiers
      rowMultiplier = 1.0
    }
  } else if (typeof row === "number") {
    rowMultiplier = Math.max(0.6, 1.8 - row * 0.03)
  }

  // Section-based premium locations
  const premiumSections = ["104", "105", "108", "109", "110", "403", "404"]
  const midFieldSections = ["133", "134", "428", "429", "430", "431", "432", "433"]
  const cornerSections = ["101", "102", "116", "117", "118", "119", "120", "121"]

  if (premiumSections.includes(section)) {
    priceMultiplier = 1.5
  } else if (midFieldSections.includes(section)) {
    priceMultiplier = 1.3
  } else if (cornerSections.includes(section)) {
    priceMultiplier = 0.9
  }

  // Calculate final price
  const finalPrice = Math.round(baseMatchPrice * categoryMultiplier * rowMultiplier * priceMultiplier)

  // Add some randomization for realism (±5%)
  const randomFactor = 0.95 + Math.random() * 0.1
  return Math.round(finalPrice * randomFactor)
}

// Function to generate ticket features based on category and price
function generateTicketFeatures(category, price, section) {
  const features = []
  const amenities = []

  // Category-specific features
  switch (category) {
    case "cat-01":
      features.push("premium-access", "vip-lounge", "instant")
      amenities.push(
        { icon: "fa-crown", text: "VIP lounge access" },
        { icon: "fa-utensils", text: "Premium dining" },
        { icon: "fa-concierge-bell", text: "Concierge service" },
      )
      break
    case "cat-02":
      features.push("vip-access", "instant", "premium-food")
      amenities.push(
        { icon: "fa-glass-cheers", text: "Premium bar" },
        { icon: "fa-wifi", text: "Free WiFi" },
        { icon: "fa-parking", text: "VIP parking" },
      )
      break
    case "cat-03":
      features.push("instant", "good-view")
      amenities.push({ icon: "fa-eye", text: "Great sightlines" }, { icon: "fa-restroom", text: "Nearby facilities" })
      break
    case "cat-04":
      features.push("instant", "standard-view")
      amenities.push({ icon: "fa-chair", text: "Comfortable seating" })
      break
    case "cat-05":
      features.push("budget-friendly")
      amenities.push({ icon: "fa-tag", text: "Great value" })
      break
    case "cat-06":
      features.push("economy", "high-view")
      amenities.push({ icon: "fa-binoculars", text: "Panoramic view" }, { icon: "fa-wallet", text: "Budget option" })
      break
  }

  // Add random features for variety
  const randomFeatures = ["2-tickets", "4-tickets", "family-friendly", "accessible"]
  if (Math.random() > 0.7) {
    features.push(randomFeatures[Math.floor(Math.random() * randomFeatures.length)])
  }

  return { features, amenities }
}

// Function to generate rating based on price and category
function generateRating(category, price) {
  let baseRating = 3.0

  switch (category) {
    case "cat-01":
      baseRating = 4.5
      break
    case "cat-02":
      baseRating = 4.2
      break
    case "cat-03":
      baseRating = 3.8
      break
    case "cat-04":
      baseRating = 3.5
      break
    case "cat-05":
      baseRating = 3.2
      break
    case "cat-06":
      baseRating = 3.0
      break
  }

  // Add some randomization
  const rating = baseRating + (Math.random() * 0.8 - 0.4)
  const clampedRating = Math.max(2.0, Math.min(5.0, rating))

  const stars =
    "★".repeat(Math.floor(clampedRating)) +
    (clampedRating % 1 >= 0.5 ? "½" : "") +
    "☆".repeat(5 - Math.ceil(clampedRating))

  let scoreText = "Average"
  let color = "#FFA500"

  if (clampedRating >= 4.5) {
    scoreText = "Elite"
    color = "#006400"
  } else if (clampedRating >= 4.0) {
    scoreText = "Excellent"
    color = "#228B22"
  } else if (clampedRating >= 3.5) {
    scoreText = "Great"
    color = "#32CD32"
  } else if (clampedRating >= 3.0) {
    scoreText = "Good"
    color = "#FFA500"
  } else {
    scoreText = "Fair"
    color = "#FF6347"
  }

  return {
    stars: stars,
    score: `${clampedRating.toFixed(1)} ${scoreText}`,
    color: color,
  }
}

// Function to generate dynamic tickets based on stadium sections
function generateDynamicTickets() {
  const tickets = []
  const sections = document.querySelectorAll("[data-section]")

  sections.forEach((sectionElement) => {
    const section = sectionElement.getAttribute("data-section")
    const category = sectionElement.classList[0] // Get the category class

    // Generate random row for variety
    const rows = ["A", "B", "C", "D", "E", "1", "2", "3", "5", "8", "10", "12", "15", "18", "20", "22", "25"]
    const randomRow = rows[Math.floor(Math.random() * rows.length)]

    const price = calculateSeatPrice(section, randomRow, category)
    const { features, amenities } = generateTicketFeatures(category, price, section)
    const rating = generateRating(category, price)

    // Generate zone name
    let zone = "Standard"
    switch (category) {
      case "cat-01":
        zone = "Premium Level"
        break
      case "cat-02":
        zone = "VIP Level"
        break
      case "cat-03":
        zone = "Upper Level"
        break
      case "cat-04":
        zone = "Mid Level"
        break
      case "cat-05":
        zone = "Lower Level"
        break
      case "cat-06":
        zone = "Upper Deck"
        break
    }

    // Generate badges
    const badges = []
    if (price < baseMatchPrice) badges.push("Great Value")
    if (Math.random() > 0.8) badges.push("Limited Availability")
    if (category === "cat-01" || category === "cat-02") badges.push("Premium Experience")
    if (Math.random() > 0.9) badges.push("Recently Added")

    const ticket = {
      section: section,
      category: category,
      title: `Section ${section} - ${zone}`,
      price: price,
      priceFormatted: price.toLocaleString(),
      row: randomRow,
      zone: zone,
      features: features,
      amenities: amenities,
      rating: rating,
      badges: badges,
      soldOut: Math.random() > 0.95, // 5% chance of being sold out
    }

    tickets.push(ticket)
  })

  return tickets
}

// Function to handle hover effects for all seat categories
function setupSeatHoverEffects() {
  const categories = ["cat-01", "cat-02", "cat-03", "cat-04", "cat-05", "cat-06"]

  categories.forEach((category) => {
    const seats = document.querySelectorAll(`.${category}`)

    seats.forEach((seat) => {
      // Mouse enter - highlight all seats in this category
      seat.addEventListener("mouseenter", () => {
        seats.forEach((s) => {
          s.classList.add("hover-selected")
        })
      })

      // Mouse leave - remove highlight from all seats in this category
      seat.addEventListener("mouseleave", () => {
        seats.forEach((s) => {
          s.classList.remove("hover-selected")
        })
      })

      // Click handler - now includes showing specific section tickets
      seat.addEventListener("click", function () {
        // Remove any existing selected class from this category
        seats.forEach((s) => {
          s.classList.remove("selected")
        })

        // Add selected class to clicked seat
        this.classList.add("selected")

        // Get section number from ID (your IDs are like "section 434")
        const sectionNumber = this.id.replace("section ", "")

        // Hide all tickets
        document.querySelectorAll(".ticket-card").forEach((card) => {
          card.style.display = "none"
        })

        // Show only tickets for this specific section
        const sectionCards = document.querySelectorAll(`.ticket-card[data-section="${sectionNumber}"]`)

        if (sectionCards.length > 0) {
          sectionCards.forEach((card) => {
            card.style.display = "block"
          })
        } else {
          // Fallback: show all tickets if no specific section found
          document.querySelectorAll(".ticket-card").forEach((card) => {
            card.style.display = "block"
          })
        }

        // Scroll to tickets
        document.querySelector(".ticket-listings-container")?.scrollIntoView({
          behavior: "smooth",
        })
      })
    })
  })
}

// Add CSS for hover and selected states
const style = document.createElement("style")
style.textContent = `
    .cat-01.hover-selected { fill: #ff4d4d !important; }
    .cat-02.hover-selected { fill: #CDA4CD !important; }
    .cat-03.hover-selected { fill: #FFC000 !important; }
    .cat-04.hover-selected { fill: #87CEEB !important; }
    .cat-05.hover-selected { fill: #77DD77 !important; }
    .cat-06.hover-selected { fill: #FFBB66 !important; }
    
    .cat-01.selected { fill: #FF0000 !important; }
    .cat-02.selected { fill: #800080 !important; }
    .cat-03.selected { fill: #E1AD01 !important; }
    .cat-04.selected { fill: #4169E1 !important; }
    .cat-05.selected { fill: #32CD32 !important; }
    .cat-06.selected { fill: #FFA500 !important; }
    
    .error-message {
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
`
document.head.appendChild(style)

// Category filter functionality
function setupCategoryFilters() {
  const categoryColors = {
    "cat-01": "#ff6666",
    "cat-02": "#D8BFD8",
    "cat-03": "#FFD700",
    "cat-04": "#ADD8E6",
  }

  document.querySelectorAll("#category-filter").forEach((button) => {
    const category = button.dataset.category

    button.addEventListener("click", function () {
      const isActive = this.classList.toggle("active")
      const color = isActive ? categoryColors[category] : "#D9D9D9"

      // Highlight stadium sections
      document.querySelectorAll(`path.${category}, rect.${category}`).forEach((section) => {
        section.style.fill = color
      })

      // Show/hide tickets for this category
      if (isActive) {
        // Hide all first
        document.querySelectorAll(".ticket-card").forEach((card) => {
          card.style.display = "none"
        })
        // Show category tickets
        document.querySelectorAll(`.${category}-listing`).forEach((card) => {
          card.style.display = "block"
        })
      } else {
        // Show all if filter is inactive
        document.querySelectorAll(".ticket-card").forEach((card) => {
          card.style.display = "block"
        })
      }
    })
  })
}

// Initialize everything
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication first
  const token = localStorage.getItem("authToken")
  if (!token) {
    // If not authenticated, redirect to login with current page as redirect URL
    const currentUrl = window.location.href
    localStorage.setItem("redirectUrl", currentUrl)
    window.location.href = "/html/login.html"
    return
  }

  // Get match ID from URL
  currentMatchId = getMatchIdFromUrl()
  if (!currentMatchId) {
    alert("No match selected. Redirecting to home page.")
    window.location.href = "/html/home.html"
    return
  }

  // Show loading
  const loadingOverlay = document.querySelector(".loading-overlay")
  if (loadingOverlay) {
    loadingOverlay.style.display = "flex"
  }

  try {
    // Fetch match information
    await fetchMatchInfo(currentMatchId)

    // Generate dynamic tickets based on fetched price
    const dynamicTickets = generateDynamicTickets()

    // Populate ticket listings
    const ticketListings = document.querySelector(".ticket-listings")
    if (ticketListings) {
      ticketListings.innerHTML = ""

      dynamicTickets.forEach((ticket) => {
        ticketListings.appendChild(createTicketCard(ticket))
      })
    }

    // Setup interactions
    setupSeatHoverEffects()
    setupCategoryFilters()
    setupTicketSorting()

    // Update page title with match info
    const headerP = document.querySelector(".fixed-header p")
    if (headerP) {
      headerP.textContent = `Base Price: $${baseMatchPrice} | Venue Capacity: ${venueCapacity.toLocaleString()} seats`
    }
  } catch (error) {
    console.error("Error initializing page:", error)
    showErrorMessage("Error loading match information. Please try again.")
  } finally {
    // Hide loading
    if (loadingOverlay) {
      loadingOverlay.style.display = "none"
    }
  }

  // Setup other event listeners
  const resetFiltersBtn = document.querySelector(".reset-filters")
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      document.querySelectorAll(".category-filter").forEach((btn) => {
        btn.classList.remove("active")
        const category = btn.dataset.category
        document.querySelectorAll(`path.${category}, rect.${category}`).forEach((section) => {
          section.style.fill = "#D9D9D9"
        })
      })

      document.querySelectorAll(".ticket-card").forEach((card) => {
        card.style.display = "block"
      })
    })
  }

  const loginButton = document.querySelector(".login")
  const dropdown = document.querySelector(".dropdown")

  if (loginButton && dropdown) {
    loginButton.addEventListener("click", (e) => {
      e.stopPropagation()
      dropdown.classList.toggle("show")
    })

    document.addEventListener("click", () => {
      dropdown.classList.remove("show")
    })

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation()
    })
  }
})

// Rest of your existing functions (createTicketCard, setupTicketSorting, etc.)
function createTicketCard(ticket) {
  const card = document.createElement("div")
  card.className = `ticket-card ${ticket.category}-listing`
  card.dataset.section = ticket.section

  // Set the HTML content
  card.innerHTML = `
        <div class="ticket-header">
            <h3>${ticket.title}</h3>
            <div class="price">$${ticket.priceFormatted}${
              ticket.originalPrice ? ` <span class="original-price">$${ticket.originalPrice}</span>` : ""
            } <span>each</span></div>
        </div>
        <div class="ticket-details">
            ${
              ticket.row
                ? `
            <div class="detail-row">
                <span class="detail-label">Row:</span>
                <span class="detail-value">${ticket.row}</span>
            </div>`
                : ""
            }
            ${
              ticket.zone
                ? `
            <div class="detail-row">
                <span class="detail-label">Zone:</span>
                <span class="detail-value">${ticket.zone}</span>
            </div>`
                : ""
            }
            
            ${
              ticket.features
                ? `
            <div class="features">
                ${
                  ticket.features.includes("2-tickets")
                    ? `
                <span class="feature">
                    <i class="fas fa-ticket-alt"></i><i class="fas fa-ticket-alt"></i>
                    <span class="feature-text">2 tickets together</span>
                </span>`
                    : ""
                }
                ${
                  ticket.features.includes("instant")
                    ? `
                <span class="feature"><i class="fa fa-bolt"></i> Instant Download</span>`
                    : ""
                }
                ${
                  ticket.features.includes("vip-lounge")
                    ? `
                <span class="feature"><i class="fas fa-crown"></i> VIP Access</span>`
                    : ""
                }
            </div>`
                : ""
            }
            ${
              ticket.amenities
                ? `
                <div class="vip-perks">
                    ${ticket.amenities
                      .map(
                        (item) => `
                        <span class="perk-item">
                            <i class="fas ${item.icon}"></i> ${item.text}
                        </span>
                    `,
                      )
                      .join(" ")}
                </div>`
                : ""
            }
            ${
              ticket.rating
                ? `
            <div class="rating">
                <span class="stars">${ticket.rating.stars}</span>
                <span class="score" style="color:${ticket.rating.color}">${ticket.rating.score}</span>
            </div>`
                : ""
            }
            
            ${
              ticket.badges
                ? `
            <div class="badges">
                ${ticket.badges
                  .map(
                    (badge) => `
                    <span class="badge ${
                      badge.toLowerCase().includes("value")
                        ? "cheapest"
                        : badge.toLowerCase().includes("sold")
                          ? "sold"
                          : "warning"
                    }">
                        ${badge.toLowerCase().includes("value") ? `<i class='far fa-money-bill-alt'></i> ` : ""}
                        ${badge}
                    </span>
                `,
                  )
                  .join("")}
            </div>`
                : ""
            }
        </div>
    `

  if (ticket.soldOut) {
    card.classList.add("sold-out")
  } else {
    card.addEventListener("click", () => {
      showTicketPopup(ticket)
    })
  }

  return card
}

// Your existing functions for sorting, popup, etc. remain the same...
function setupTicketSorting() {
  const sortSelect = document.getElementById("sort-select")
  const quickFilters = document.querySelectorAll(".quick-filter")

  if (!sortSelect) return

  sortSelect.addEventListener("change", function () {
    sortTickets(this.value)
    quickFilters.forEach((btn) => btn.classList.remove("active"))
  })

  quickFilters.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.dataset.filter

      quickFilters.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      if (filter === "cheapest") {
        sortTickets("price-asc")
        sortSelect.value = "price-asc"
      } else if (filter === "best-rated") {
        sortTickets("rating-desc")
        sortSelect.value = "rating-desc"
      } else if (filter === "best-value") {
        sortTickets("value-desc")
        sortSelect.value = "price-asc"
      }
    })
  })

  // Sort function
  function sortTickets(sortBy) {
    const container = document.querySelector(".ticket-listings")
    const cards = Array.from(document.querySelectorAll(".ticket-card"))

    cards.sort((a, b) => {
      const priceA = Number.parseInt(a.querySelector(".price").textContent.replace(/[^0-9]/g, ""))
      const priceB = Number.parseInt(b.querySelector(".price").textContent.replace(/[^0-9]/g, ""))

      const ratingA = Number.parseFloat(a.querySelector(".score")?.textContent.split(" ")[0] || 0)
      const ratingB = Number.parseFloat(b.querySelector(".score")?.textContent.split(" ")[0] || 0)

      const sectionA = a.dataset.section
      const sectionB = b.dataset.section

      switch (sortBy) {
        case "price-asc":
          return priceA - priceB
        case "price-desc":
          return priceB - priceA
        case "rating-desc":
          return ratingB - ratingA
        case "section-asc":
          return sectionA.localeCompare(sectionB)
        case "value-desc":
          const valueA = ratingA / (priceA / 1000)
          const valueB = ratingB / (priceB / 1000)
          return valueB - valueA
        default:
          return 0
      }
    })

    cards.forEach((card) => container.appendChild(card))
  }
}

// Enhanced ticket popup with data linking
function showTicketPopup(ticket) {
  // Create popup container
  const popup = document.createElement("div")
  popup.className = "ticket-popup"
  popup.id = "ticketPopup"

  const pricePerTicket = ticket.price

  // Create popup content
  popup.innerHTML = `
        <div class="popup-content">
            <button class="close-popup">&times;</button>
            <div class="popup-header">
                <h3>${ticket.title}</h3>
                <div class="price-display">
                    <span class="price-per-ticket">$${ticket.priceFormatted} each</span>
                    ${ticket.originalPrice ? `<span class="original-price">$${ticket.originalPrice}</span>` : ""}
                </div>
            </div>
            
            <div class="popup-body">
                <div class="ticket-details-section">
                    <h4>Ticket Details</h4>
                    <div class="details-grid">
                        ${
                          ticket.section
                            ? `<div class="detail-item">
                            <span class="detail-label">Section:</span>
                            <span class="detail-value">${ticket.section}</span>
                        </div>`
                            : ""
                        }
                        
                        ${
                          ticket.row
                            ? `<div class="detail-item">
                            <span class="detail-label">Row:</span>
                            <span class="detail-value">${ticket.row}</span>
                        </div>`
                            : ""
                        }
                        
                        ${
                          ticket.zone
                            ? `<div class="detail-item">
                            <span class="detail-label">Zone:</span>
                            <span class="detail-value">${ticket.zone}</span>
                        </div>`
                            : ""
                        }
                        
                        <div class="detail-item">
                            <span class="detail-label">Quantity:</span>
                            <div class="quantity-selector">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" class="quantity-input" value="1" min="1" max="10">
                                <button class="quantity-btn plus">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="features-section">
                    <h4>Features & Amenities</h4>
                    <div class="features-grid">
                        ${
                          ticket.features
                            ? ticket.features
                                .map(
                                  (feature) => `
                            <div class="feature-item">
                                ${getFeatureIcon(feature)}
                                <span class="feature-text">${getFeatureText(feature)}</span>
                            </div>
                        `,
                                )
                                .join("")
                            : ""
                        }
                        
                        ${
                          ticket.amenities
                            ? ticket.amenities
                                .map(
                                  (amenity) => `
                            <div class="feature-item">
                                <i class="fas ${amenity.icon}"></i>
                                <span class="feature-text">${amenity.text}</span>
                            </div>
                        `,
                                )
                                .join("")
                            : ""
                        }
                    </div>
                </div>
                
                ${
                  ticket.badges
                    ? `
                <div class="badges-section">
                    <h4>Special Notes</h4>
                    <div class="popup-badges">
                        ${ticket.badges
                          .map(
                            (badge) => `
                            <span class="badge ${
                              badge.toLowerCase().includes("value")
                                ? "cheapest"
                                : badge.toLowerCase().includes("sold")
                                  ? "sold"
                                  : "warning"
                            }">
                                ${badge.toLowerCase().includes("value") ? `<i class='far fa-money-bill-alt'></i> ` : ""}
                                ${badge}
                            </span>
                        `,
                          )
                          .join("")}
                    </div>
                </div>`
                    : ""
                }
            </div>
            
            <div class="popup-footer">
                ${
                  ticket.soldOut
                    ? `
                    <div class="sold-out-message">
                        <i class="fas fa-times-circle"></i>
                        <span>These tickets are no longer available</span>
                    </div>
                `
                    : `
                    <div class="total-price">
                        <span>Total:</span>
                        <span class="calculated-price">$${ticket.priceFormatted}</span>
                    </div>
                    <button class="add-to-cart-btn">Continue to Payment</button>
                `
                }
            </div>
        </div>
    `

  const popupContainer = document.getElementById("ticketPopupContainer")
  if (popupContainer) {
    popupContainer.appendChild(popup)

    const quantityInput = popup.querySelector(".quantity-input")
    const minusBtn = popup.querySelector(".minus")
    const plusBtn = popup.querySelector(".plus")
    const totalPriceElement = popup.querySelector(".calculated-price")

    function updateTotalPrice() {
      const quantity = Number.parseInt(quantityInput.value)
      const totalPrice = pricePerTicket * quantity
      totalPriceElement.textContent = `$${totalPrice.toLocaleString()}`
    }

    minusBtn.addEventListener("click", () => {
      if (Number.parseInt(quantityInput.value) > 1) {
        quantityInput.value = Number.parseInt(quantityInput.value) - 1
        updateTotalPrice()
      }
    })

    plusBtn.addEventListener("click", () => {
      if (Number.parseInt(quantityInput.value) < 10) {
        quantityInput.value = Number.parseInt(quantityInput.value) + 1
        updateTotalPrice()
      }
    })

    quantityInput.addEventListener("change", () => {
      if (quantityInput.value < 1) quantityInput.value = 1
      if (quantityInput.value > 10) quantityInput.value = 10
      updateTotalPrice()
    })

    popup.querySelector(".close-popup").addEventListener("click", () => {
      popupContainer.removeChild(popup)
    })

    // Enhanced continue button with data linking
    popup.querySelector(".add-to-cart-btn").addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      const totalPrice = pricePerTicket * quantity

      // Store selected ticket details for payment page
      const selectedTicketData = {
        matchId: currentMatchId,
        matchInfo: currentMatchInfo,
        ticket: {
          section: ticket.section,
          category: ticket.category,
          title: ticket.title,
          price: pricePerTicket,
          priceFormatted: ticket.priceFormatted,
          row: ticket.row,
          zone: ticket.zone,
          features: ticket.features,
          amenities: ticket.amenities,
          rating: ticket.rating,
          badges: ticket.badges,
        },
        quantity: quantity,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString(),
      }

      // Store in localStorage for payment page
      localStorage.setItem("selectedTicketData", JSON.stringify(selectedTicketData))

      addToCart(ticket, quantity)
      popupContainer.removeChild(popup)
      showCartNotification(ticket.title, quantity)

      // Navigate to payment page with match ID
      window.location.href = `/html/paiement.html?matchId=${currentMatchId}`
    })
  }
}

function getFeatureIcon(feature) {
  const icons = {
    "corner-view": '<i class="fas fa-vector-square"></i>',
    "tactical-angle": '<i class="fas fa-chess-board"></i>',
    "club-perks": '<i class="fas fa-crown"></i>',
    "shaded-seats": '<i class="fas fa-umbrella-beach"></i>',
    "4-tickets":
      '<i class="fas fa-ticket-alt"></i><i class="fas fa-ticket-alt"></i><i class="fas fa-ticket-alt"></i><i class="fas fa-ticket-alt"></i>',
    "kid-friendly": '<i class="fas fa-child"></i>',
    "premium-corner-view": '<i class="fas fa-star"></i>',
    "comfortable-seating": '<i class="fas fa-couch"></i>',
    "fan-zone": '<i class="fas fa-users"></i>',
    "2-tickets": '<i class="fas fa-ticket-alt"></i><i class="fas fa-ticket-alt"></i>',
    instant: '<i class="fas fa-bolt"></i>',
    view: '<i class="fas fa-eye"></i>',
    "value-seats": '<i class="fas fa-coins"></i>',
    "panoramic-view": '<i class="fas fa-binoculars"></i>',
    "wide-perspective": '<i class="fas fa-expand"></i>',
  }

  return icons[feature] || '<i class="fas fa-check-circle"></i>'
}

function getFeatureText(feature) {
  const texts = {
    "corner-view": "Corner kick view",
    "tactical-angle": "Tactical perspective",
    "club-perks": "Club access & perks",
    "shaded-seats": "Shaded seats",
    "4-tickets": "4 tickets together",
    "kid-friendly": "Kid-friendly zone",
    "premium-corner-view": "Premium corner view",
    "comfortable-seating": "Extra comfortable seats",
    "fan-zone": "Loud fan atmosphere",
    "2-tickets": "2 tickets together",
    instant: "Instant download",
    view: "Clear unobstructed view",
    "value-seats": "Great value seats",
    "panoramic-view": "Panoramic stadium view",
    "wide-perspective": "Wide viewing angle",
  }

  return texts[feature] || feature.replace("-", " ")
}

function addToCart(ticket, quantity) {
  console.log(`Added ${quantity} of ${ticket.title} to cart`)
}

function showCartNotification(ticketTitle, quantity) {
  // Create a better notification
  const notification = document.createElement("div")
  notification.className = "cart-notification"
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-check-circle"></i>
      <div>
        <strong>Added to Cart!</strong><br>
        ${quantity} × ${ticketTitle}
      </div>
    </div>
  `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}
