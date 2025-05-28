document.addEventListener("DOMContentLoaded", () => {
  // Global variables for payment processing
  let matchInfo = null
  let selectedTicketData = null
  let userEmail = null
  let userName = null

  // DOM Elements
  const continueBtn = document.getElementById("continue")
  const submitBtn = document.getElementById("openPopup")
  const step1 = document.getElementById("step1")
  const step2 = document.getElementById("step2")
  const popup = document.getElementById("popup")
  const closePopup = document.getElementById("closePopup")
  const viewOrderBtn = document.getElementById("viewOrderBtn")
  const methodTabs = document.querySelectorAll(".method-tab")
  const monthSelect = document.getElementById("month")
  const yearSelect = document.getElementById("year")
  const nameInput = document.getElementById("full-name")
  const cardInput = document.getElementById("cardNumber")
  const countrySelect = document.getElementById("country")
  const stateField = document.getElementById("state")
  const addressForm = document.getElementById("addressForm")
  const paymentForm = document.getElementById("paymentForm")
  const themeToggleBtn = document.getElementById("themeToggle")

  // ==================== INITIALIZATION FUNCTIONS ====================
  async function initializePaymentPage() {
    try {
      // Get user info
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        userEmail = userData.email || userData.username
        userName =
          userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.username
        prefillUserInfo(userData)
      }

      // Get selected ticket data from localStorage (from booking page)
      const ticketDataStr = localStorage.getItem("selectedTicketData")
      if (ticketDataStr) {
        selectedTicketData = JSON.parse(ticketDataStr)
        matchInfo = selectedTicketData.matchInfo

        console.log("Loaded ticket data from booking page:", selectedTicketData)

        // Update payment page with selected ticket data
        updatePaymentSummaryFromTicketData()
        return
      }

      // Fallback: Get match ID from URL and load match details
      const urlParams = new URLSearchParams(window.location.search)
      const matchId = urlParams.get("matchId")

      if (matchId) {
        await loadMatchDetails(matchId)
      } else {
        displayError("No match or ticket data found. Please go back and select a ticket.")
      }
    } catch (error) {
      console.error("Error initializing payment page:", error)
      displayError("Error loading payment information. Please try again.")
    }
  }

  // Update payment summary using selected ticket data
  function updatePaymentSummaryFromTicketData() {
    if (!selectedTicketData || !selectedTicketData.matchInfo) {
      console.error("No ticket data available")
      return
    }

    const { matchInfo: match, ticket, quantity, totalPrice } = selectedTicketData

    try {
      // Format date
      const date = new Date(match.matchDate)
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      const formattedDate = date.toLocaleDateString("en-US", options)

      // Update match info
      document.getElementById("matchTeams").textContent = `${match.team1} vs ${match.team2}`
      document.getElementById("matchVenue").textContent = match.venue
      document.getElementById("matchDate").textContent = formattedDate

      // Update ticket details section
      updateTicketDetailsSection(ticket, quantity)

      // Calculate prices
      const subtotal = totalPrice
      const fees = Math.round(subtotal * 0.1) // 10% fees
      const total = subtotal + fees

      // Update price displays
      document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`
      document.getElementById("fees").textContent = `$${fees.toFixed(2)}`
      document.getElementById("total").textContent = `$${total.toFixed(2)}`
      document.getElementById("popup-amount").textContent = `$${total.toFixed(2)}`
      document.getElementById("payButtonText").textContent = `Pay $${total.toFixed(2)}`

      // Store final total for order processing
      selectedTicketData.finalTotal = total
      selectedTicketData.fees = fees
      selectedTicketData.subtotal = subtotal

      console.log("Payment summary updated with ticket data")
    } catch (error) {
      console.error("Error updating payment summary:", error)
      displayError("Error displaying ticket details")
    }
  }

  // Update ticket details section with selected ticket info
  function updateTicketDetailsSection(ticket, quantity) {
    // Create or update ticket details section
    let ticketDetailsSection = document.getElementById("ticketDetailsSection")

    if (!ticketDetailsSection) {
      // Create the section if it doesn't exist
      ticketDetailsSection = document.createElement("div")
      ticketDetailsSection.id = "ticketDetailsSection"
      ticketDetailsSection.className = "ticket-details-section"

      // Insert after match details
      const matchSection = document.querySelector(".match-details") || document.querySelector(".order-summary")
      if (matchSection) {
        matchSection.appendChild(ticketDetailsSection)
      }
    }

    ticketDetailsSection.innerHTML = `
      <h3>Selected Tickets</h3>
      <div class="selected-ticket-info">
        <div class="ticket-summary-card">
          <div class="ticket-header">
            <h4>${ticket.title}</h4>
            <span class="ticket-price">$${ticket.priceFormatted} × ${quantity}</span>
          </div>
          <div class="ticket-details-grid">
            <div class="detail-item">
              <span class="label">Section:</span>
              <span class="value">${ticket.section}</span>
            </div>
            <div class="detail-item">
              <span class="label">Row:</span>
              <span class="value">${ticket.row}</span>
            </div>
            <div class="detail-item">
              <span class="label">Zone:</span>
              <span class="value">${ticket.zone}</span>
            </div>
            <div class="detail-item">
              <span class="label">Category:</span>
              <span class="value">${getCategoryName(ticket.category)}</span>
            </div>
          </div>
          ${
            ticket.features && ticket.features.length > 0
              ? `
            <div class="ticket-features">
              <strong>Included Features:</strong>
              <div class="features-list">
                ${ticket.features
                  .map(
                    (feature) => `
                  <span class="feature-tag">${getFeatureText(feature)}</span>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `

    // Add some CSS for the ticket details
    if (!document.getElementById("ticketDetailsStyles")) {
      const style = document.createElement("style")
      style.id = "ticketDetailsStyles"
      style.textContent = `
        .ticket-details-section {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .selected-ticket-info .ticket-summary-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #ddd;
        }
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .ticket-header h4 {
          margin: 0;
          color: #333;
        }
        .ticket-price {
          font-weight: bold;
          color: #007bff;
          font-size: 1.1em;
        }
        .ticket-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
        }
        .detail-item .label {
          font-weight: 500;
          color: #666;
        }
        .detail-item .value {
          color: #333;
        }
        .ticket-features {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 8px;
        }
        .feature-tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.85em;
          border: 1px solid #bbdefb;
        }
      `
      document.head.appendChild(style)
    }
  }

  // Helper function to get category display name
  function getCategoryName(category) {
    const categoryNames = {
      "cat-01": "Premium Level",
      "cat-02": "VIP Level",
      "cat-03": "Upper Level",
      "cat-04": "Mid Level",
      "cat-05": "Lower Level",
      "cat-06": "Upper Deck",
    }
    return categoryNames[category] || "Standard"
  }

  // Helper function to get feature display text
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
      "premium-access": "Premium access",
      "vip-lounge": "VIP lounge access",
      "vip-access": "VIP access",
      "premium-food": "Premium food & beverage",
      "good-view": "Great sightlines",
      "standard-view": "Standard view",
      "budget-friendly": "Budget friendly",
      economy: "Economy seating",
      "high-view": "High elevation view",
      "family-friendly": "Family friendly",
      accessible: "Wheelchair accessible",
    }
    return texts[feature] || feature.replace("-", " ")
  }

  // Pre-fill user information
  function prefillUserInfo(userData) {
    if (userData.email) {
      const emailField = document.getElementById("email")
      if (emailField) {
        emailField.value = userData.email
      }
    }

    if (userData.firstName && userData.lastName) {
      const nameField = document.getElementById("full-name")
      if (nameField) {
        nameField.value = `${userData.firstName} ${userData.lastName}`
      }
    } else if (userData.username) {
      const nameField = document.getElementById("full-name")
      if (nameField) {
        nameField.value = userData.username
      }
    }
  }

  // ==================== FALLBACK MATCH LOADING (if no ticket data) ====================
  async function loadMatchDetails(matchId) {
    showLoadingState()

    try {
      // Try main endpoint first
      let matchData = await fetchMatchDetails(matchId)

      // If main endpoint fails, try the info endpoint
      if (!matchData) {
        matchData = await fetchMatchInfo(matchId)

        // Transform info data to match expected structure
        if (matchData) {
          matchData = {
            team1: matchData.team1,
            team2: matchData.team2,
            venue: matchData.venue,
            matchDate: matchData.matchDate,
            ticketPrice: matchData.price,
          }
        }
      }

      if (matchData) {
        matchInfo = matchData
        updateMatchDetails(matchData)
      } else {
        throw new Error("Could not load match details")
      }
    } catch (error) {
      console.error("Match loading error:", error)
      displayError("Failed to load match details. Please try again later.")
    } finally {
      hideLoadingState()
    }
  }

  async function fetchMatchDetails(matchId) {
    try {
      const response = await fetch(`http://localhost:8080/api/matches/${matchId}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.warn("Error fetching match details:", error)
      return null
    }
  }

  async function fetchMatchInfo(matchId) {
    try {
      const response = await fetch(`http://localhost:8080/api/matches/${matchId}/info`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.warn("Error fetching match info:", error)
      return null
    }
  }

  function updateMatchDetails(match) {
    try {
      // Validate required fields
      if (!match || !match.matchDate || (match.ticketPrice === undefined && match.price === undefined)) {
        throw new Error("Invalid match data")
      }

      // Format date
      const date = new Date(match.matchDate)
      if (isNaN(date.getTime())) throw new Error("Invalid date format")

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      const formattedDate = date.toLocaleDateString("en-US", options)

      // Update match info
      document.getElementById("matchTeams").textContent = `${match.team1 || "Team 1"} vs ${match.team2 || "Team 2"}`
      document.getElementById("matchVenue").textContent = match.venue || "Venue not specified"
      document.getElementById("matchDate").textContent = formattedDate

      // Calculate prices (fallback pricing if no ticket selected)
      const ticketPrice = match.ticketPrice !== undefined ? match.ticketPrice : match.price
      const quantity = 2 // Default quantity
      const subtotal = ticketPrice * quantity
      const fees = Math.round(subtotal * 0.1) // 10% fees
      const total = subtotal + fees

      // Update price displays
      document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`
      document.getElementById("fees").textContent = `$${fees.toFixed(2)}`
      document.getElementById("total").textContent = `$${total.toFixed(2)}`
      document.getElementById("popup-amount").textContent = `$${total.toFixed(2)}`
      document.getElementById("payButtonText").textContent = `Pay $${total.toFixed(2)}`
    } catch (error) {
      console.error("Error updating match details:", error)
      displayError("Error displaying match details")
    }
  }

  function showLoadingState() {
    document.getElementById("matchTeams").textContent = "Loading match details..."
    document.getElementById("matchVenue").textContent = "Loading..."
    document.getElementById("matchDate").textContent = "Loading..."
    document.getElementById("subtotal").textContent = "Loading..."
    document.getElementById("fees").textContent = "Loading..."
    document.getElementById("total").textContent = "Loading..."
    if (continueBtn) continueBtn.disabled = true
  }

  function hideLoadingState() {
    if (continueBtn) continueBtn.disabled = false
  }

  function displayError(message) {
    const matchTeamsElement = document.getElementById("matchTeams")
    if (matchTeamsElement) {
      matchTeamsElement.textContent = message
      matchTeamsElement.style.color = "#ff4d4d"
    }
    if (continueBtn) continueBtn.disabled = true
  }

  // ==================== PAYMENT FORM FUNCTIONS ====================
  function toggleTheme() {
    const html = document.documentElement
    const isDark = html.getAttribute("data-theme") === "dark"
    html.setAttribute("data-theme", isDark ? "light" : "dark")
    const icon = themeToggleBtn.querySelector("i")
    const label = themeToggleBtn.querySelector("span")
    if (isDark) {
      icon.classList.remove("fa-sun")
      icon.classList.add("fa-moon")
      label.textContent = "Dark Mode"
    } else {
      icon.classList.remove("fa-moon")
      icon.classList.add("fa-sun")
      label.textContent = "Light Mode"
    }
  }

  function updateStateField() {
    const isUS = countrySelect.value === "US"
    stateField.disabled = !isUS
    stateField.required = isUS
    stateField.placeholder = isUS ? "Enter State Name" : "Only Required For US"
    if (!isUS) stateField.value = ""
  }

  function detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, "")
    if (/^4/.test(cleaned)) return "visa"
    if (/^5[1-5]/.test(cleaned)) return "mastercard"
    if (/^3[47]/.test(cleaned)) return "amex"
    if (/^6(?:011|5)/.test(cleaned)) return "discover"
    return "unknown"
  }

  function updateCardIcons(cardNumber) {
    const cardType = detectCardType(cardNumber)
    const cardIcons = document.querySelectorAll(".card-icons img")
    cardIcons.forEach((icon) => icon.classList.remove("active"))
    if (cardType !== "unknown") {
      const activeIcon = document.querySelector(`.card-logo-${cardType}`)
      if (activeIcon) activeIcon.classList.add("active")
    }
  }

  function validateExpiry() {
    const selectedYear = Number.parseInt(yearSelect.value)
    const selectedMonth = Number.parseInt(monthSelect.value)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    if (!selectedYear || !selectedMonth) return true

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
      showError(monthSelect, "Cannot select past date")
      showError(yearSelect, "Cannot select past date")
      return false
    }
    return true
  }

  function showError(field, message) {
    const formGroup = field.closest(".form-group")
    let errorElement = formGroup.querySelector(".error-message")

    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "error-message"
      formGroup.appendChild(errorElement)
    }

    errorElement.textContent = message
    field.classList.add("error")
  }

  function clearError(field) {
    const formGroup = field.closest(".form-group")
    const errorElement = formGroup.querySelector(".error-message")
    if (errorElement) errorElement.remove()
    field.classList.remove("error")
  }

  function formatCardNumber(value) {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  function validateStep1() {
    const requiredFields = addressForm.querySelectorAll("[required]")
    let isValid = true
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        showError(field, "This field is required")
        isValid = false
      } else {
        clearError(field)
      }
    })
    return isValid
  }

  function validateStep2() {
    const requiredFields = paymentForm.querySelectorAll("[required]")
    let isValid = true
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        showError(field, "This field is required")
        isValid = false
      } else {
        clearError(field)
      }
    })
    if (!validateExpiry()) isValid = false
    return isValid
  }

  // ==================== DATABASE INTEGRATION ====================
  async function saveOrderToDatabase(orderData) {
    try {
      const token = localStorage.getItem("authToken")

      // Prepare booking request for backend
      const bookingRequest = {
        matchId: orderData.matchInfo.id,
        userEmail: orderData.userEmail,
        ticketDetails: {
          section: orderData.ticketData.ticket.section,
          category: orderData.ticketData.ticket.category,
          row: orderData.ticketData.ticket.row,
          zone: orderData.ticketData.ticket.zone,
          quantity: orderData.ticketData.quantity,
          pricePerTicket: orderData.ticketData.ticket.price,
          totalPrice: orderData.ticketData.finalTotal,
        },
        paymentDetails: {
          method: orderData.paymentMethod,
          cardLastFour: orderData.billingInfo.cardLastFour,
          billingAddress: {
            fullName: orderData.billingInfo.fullName,
            country: orderData.billingInfo.country,
            state: orderData.billingInfo.state,
            address: orderData.billingInfo.address || "",
            city: orderData.billingInfo.city || "",
            zipCode: orderData.billingInfo.zipCode || "",
          },
        },
        orderDate: orderData.timestamp,
        status: "confirmed",
      }

      console.log("Sending booking request to backend:", bookingRequest)

      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log("Booking saved successfully:", result)

      // Update order data with backend response
      orderData.backendOrderId = result.id
      orderData.confirmationNumber = result.confirmationNumber || orderData.confirmationNumber

      return result
    } catch (error) {
      console.error("Error saving order to database:", error)
      // Don't throw error - allow order to proceed with local storage
      
      return null
    }
  }

  // ==================== ORDER PROCESSING ====================
  async function processOrder() {
    try {
      // Get current form values for user name
      const currentUserName = nameInput.value || userName || "Unknown User"

      // Create comprehensive order data
      const orderData = {
        // Order identification
        orderId: generateOrderId(),
        confirmationNumber: generateConfirmationNumber(),
        timestamp: new Date().toISOString(),

        // User information
        userEmail: userEmail,
        userName: currentUserName,

        // Match information
        matchInfo: matchInfo || selectedTicketData.matchInfo,

        // Ticket information
        ticketData: selectedTicketData,

        // Payment information
        paymentMethod: getSelectedPaymentMethod(),
        billingInfo: getBillingInfo(),

        // Pricing breakdown
        subtotal: selectedTicketData.subtotal || selectedTicketData.totalPrice,
        fees: selectedTicketData.fees || Math.round((selectedTicketData.totalPrice || 0) * 0.1),
        finalTotal:
          selectedTicketData.finalTotal ||
          selectedTicketData.totalPrice + Math.round((selectedTicketData.totalPrice || 0) * 0.1),

        // Status
        status: "confirmed",
        paymentStatus: "completed",
      }

      console.log("Processing order:", orderData)

      // Save to database
      await saveOrderToDatabase(orderData)

      // Store order confirmation for order confirmation page
      localStorage.setItem("orderConfirmation", JSON.stringify(orderData))

      // Also store a simplified version for quick access
      localStorage.setItem(
        "lastOrderSummary",
        JSON.stringify({
          orderId: orderData.orderId,
          confirmationNumber: orderData.confirmationNumber,
          userEmail: orderData.userEmail,
          userName: orderData.userName,
          finalTotal: orderData.finalTotal,
          matchTeams: `${orderData.matchInfo.team1} vs ${orderData.matchInfo.team2}`,
          ticketSection: orderData.ticketData.ticket.section,
          ticketQuantity: orderData.ticketData.quantity,
          timestamp: orderData.timestamp,
        }),
      )

      return orderData
    } catch (error) {
      console.error("Error processing order:", error)
      throw error
    }
  }

  function getSelectedPaymentMethod() {
    const activeTab = document.querySelector(".method-tab.active")
    return activeTab ? activeTab.textContent.trim() : "Credit Card"
  }

  function getBillingInfo() {
    return {
      fullName: nameInput.value,
      country: countrySelect.value,
      state: stateField.value,
      cardLastFour: cardInput.value.replace(/\s/g, "").slice(-4),
      address: document.getElementById("address")?.value || "",
      city: document.getElementById("city")?.value || "",
      zipCode: document.getElementById("zip")?.value || "",
    }
  }

  function generateOrderId() {
    return "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  function generateConfirmationNumber() {
    return "CONF-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ${type === "success" ? "background: #28a745;" : ""}
      ${type === "error" ? "background: #dc3545;" : ""}
      ${type === "info" ? "background: #17a2b8;" : ""}
    `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  // ==================== EVENT LISTENERS ====================
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme)
  }

  if (countrySelect) {
    countrySelect.addEventListener("change", updateStateField)
  }

  if (monthSelect) monthSelect.addEventListener("change", validateExpiry)
  if (yearSelect) yearSelect.addEventListener("change", validateExpiry)

  if (nameInput) {
    nameInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-z\s]/g, "")
      // Update userName when user types
      userName = this.value
    })
  }

  if (cardInput) {
    cardInput.addEventListener("input", function (e) {
      this.value = formatCardNumber(this.value)
      updateCardIcons(this.value)
    })
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", (e) => {
      e.preventDefault()
      if (validateStep1()) {
        step1.classList.remove("active")
        step2.classList.add("active")
        setTimeout(() => {
          step2.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }, 300)
      }
    })
  }

  methodTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      methodTabs.forEach((t) => t.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Enhanced submit button with database integration
  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault()

      if (validateStep2()) {
        // Show loading state
        this.disabled = true
        this.textContent = "Processing Payment..."

        try {
          // Process the order and save to database
          const orderData = await processOrder()

          // Show success popup
          popup.style.display = "flex"
          document.body.style.overflow = "hidden"

          // Clear selected ticket data
          localStorage.removeItem("selectedTicketData")

          showNotification("Payment processed successfully!", "success")
        } catch (error) {
          console.error("Payment processing error:", error)
          showNotification("Payment processing failed. Please try again.", "error")
        } finally {
          // Reset button state
          this.disabled = false
          this.textContent = "Complete Payment"
        }
      }
    })
  }

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      popup.style.display = "none"
      document.body.style.overflow = "auto"
    })
  }

  if (viewOrderBtn) {
    viewOrderBtn.addEventListener("click", () => {
      window.location.href = "/html/OrderConfirmation.html"
    })
  }

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.style.display === "flex") {
      popup.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })

  const formInputs = document.querySelectorAll("input, select")
  formInputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this)
    })
  })

  // Initialize
  initializePaymentPage()
  updateStateField()
  updateCardIcons("")
})
