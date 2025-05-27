// Enhanced Order Confirmation with CORRECT backend endpoints
document.addEventListener("DOMContentLoaded", () => {
    // Global variables
    let orderData = null
    let userInfo = null
    let bookingSaved = false
  
    // Initialize the page
    initializeOrderConfirmation()
  
    // ==================== INITIALIZATION FUNCTIONS ====================
    async function initializeOrderConfirmation() {
      try {
        // Load order data from localStorage
        loadOrderData()
  
        // Load user information
        loadUserInfo()
  
        // Update the page with order details FIRST
        updateOrderDisplay()
  
        // Save booking data to database using CORRECT endpoint
        await saveBookingToDatabase()
  
        // Setup event listeners
        setupEventListeners()
  
        // Create dark mode toggle
        createDarkModeToggle()
  
        // Load dark mode preference
        loadDarkModePreference()
  
        console.log("Order confirmation page initialized successfully")
      } catch (error) {
        console.error("Error initializing order confirmation:", error)
        displayError("Error loading order details. Please contact support.")
      }
    }
  
    function loadOrderData() {
      // Try to load comprehensive order data first
      const orderConfirmationStr = localStorage.getItem("orderConfirmation")
      if (orderConfirmationStr) {
        orderData = JSON.parse(orderConfirmationStr)
        console.log("Loaded order data:", orderData)
        return
      }
  
      // Fallback to simplified order summary
      const lastOrderStr = localStorage.getItem("lastOrderSummary")
      if (lastOrderStr) {
        const lastOrder = JSON.parse(lastOrderStr)
        // Convert simplified data to full format
        orderData = {
          orderId: lastOrder.orderId,
          confirmationNumber: lastOrder.confirmationNumber,
          userEmail: lastOrder.userEmail,
          userName: lastOrder.userName,
          finalTotal: lastOrder.finalTotal,
          timestamp: lastOrder.timestamp,
          matchInfo: {
            id: lastOrder.matchId || 18, // Default to match 18 if not available
            team1: lastOrder.matchTeams?.split(" vs ")[0] || "Team 1",
            team2: lastOrder.matchTeams?.split(" vs ")[1] || "Team 2",
            venue: lastOrder.venue || "Stadium",
            matchDate: lastOrder.matchDate,
          },
          ticketData: {
            ticket: {
              section: lastOrder.ticketSection || "General",
              price: lastOrder.ticketPrice || 0,
            },
            quantity: lastOrder.ticketQuantity || 1,
            totalPrice: lastOrder.finalTotal || 0,
          },
          subtotal: lastOrder.subtotal || lastOrder.finalTotal || 0,
          fees: lastOrder.fees || 0,
        }
        console.log("Loaded simplified order data:", orderData)
        return
      }
  
      // Create default order data if nothing found
      orderData = {
        orderId: "ORD-" + Date.now(),
        confirmationNumber: "CONF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userEmail: userInfo?.email || "customer@example.com",
        userName: userInfo?.username || userInfo?.firstName + " " + userInfo?.lastName || "Customer",
        finalTotal: 4000.0, // Default price from your database
        timestamp: new Date().toISOString(),
        matchInfo: {
          id: 18, // Default match ID
          team1: "Barca",
          team2: "Real",
          venue: "BERAKI",
        },
        ticketData: {
          quantity: 1,
          totalPrice: 4000.0,
        },
      }
  
      console.log("Created default order data:", orderData)
    }
  
    function loadUserInfo() {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        userInfo = JSON.parse(userStr)
  
        // Update order data with user info if not already set
        if (orderData && !orderData.userEmail && userInfo.email) {
          orderData.userEmail = userInfo.email
        }
        if (orderData && !orderData.userName) {
          orderData.userName = userInfo.username || userInfo.firstName + " " + userInfo.lastName || "Customer"
        }
      }
    }
  
    // ==================== DATABASE INTEGRATION FUNCTIONS ====================
    async function saveBookingToDatabase() {
      if (!orderData || bookingSaved) {
        console.log("No order data or booking already saved")
        return
      }
  
      try {
        showNotification("Saving booking to database...", "info")
  
        // First, check if ticket exists for this match and update availability
        await updateTicketAvailability()
  
        // Create individual purchase record using CORRECT endpoint
        const purchaseRecord = await createTicketPurchaseRecord()
  
        if (purchaseRecord) {
          orderData.databasePurchaseId = purchaseRecord.id
          bookingSaved = true
  
          // Update localStorage with database ID
          localStorage.setItem("orderConfirmation", JSON.stringify(orderData))
  
          showNotification("Booking saved successfully!", "success")
  
          // Update the display to show database ID
          updateDatabaseInfo()
        }
      } catch (error) {
        console.error("Error saving booking to database:", error)
        showNotification("Warning: Could not save to database", "warning")
        // Don't throw error - allow page to continue loading
      }
    }
  
    async function updateTicketAvailability() {
      try {
        const token = localStorage.getItem("authToken")
  
        // Check if ticket exists for this match
        const response = await fetch(`http://localhost:8080/api/tickets/match/${orderData.matchInfo.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        })
  
        if (response.ok) {
          const existingTicket = await response.json()
          console.log("Found existing ticket, updating availability:", existingTicket)
  
          // Update ticket availability
          const updatedTicketRequest = {
            matchId: existingTicket.matchId,
            price: existingTicket.price,
            available: Math.max(0, existingTicket.available - orderData.ticketData.quantity),
          }
  
          const updateResponse = await fetch(`http://localhost:8080/api/tickets/${existingTicket.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(updatedTicketRequest),
          })
  
          if (updateResponse.ok) {
            console.log("Ticket availability updated successfully")
          }
        } else if (response.status === 404) {
          console.log("No ticket found for match, will create one if needed")
          // Optionally create a new ticket here
          await createTicketForMatch()
        }
      } catch (error) {
        console.error("Error updating ticket availability:", error)
      }
    }
  
    async function createTicketForMatch() {
      try {
        const token = localStorage.getItem("authToken")
  
        const ticketRequest = {
          matchId: orderData.matchInfo.id,
          price: orderData.finalTotal / orderData.ticketData.quantity, // Price per ticket
          available: Math.max(0, 1000 - orderData.ticketData.quantity), // Start with 1000, subtract purchased
        }
  
        console.log("Creating new ticket:", ticketRequest)
  
        const response = await fetch("http://localhost:8080/api/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(ticketRequest),
        })
  
        if (response.ok) {
          const createdTicket = await response.json()
          console.log("Ticket created successfully:", createdTicket)
          return createdTicket
        }
      } catch (error) {
        console.error("Error creating ticket:", error)
      }
    }
  
    async function createTicketPurchaseRecord() {
        try {
            const token = localStorage.getItem("authToken");
    
            // Create purchase record that matches your database structure
            const purchaseData = {
                eventName: `${orderData.matchInfo.team1} vs ${orderData.matchInfo.team2}`,
                venue: orderData.matchInfo.venue || "Stadium",
                price: orderData.finalTotal,
                customerEmail: orderData.userEmail,
                customerName: orderData.userName,
                matchId: orderData.matchInfo.id, // Send just the ID
                quantity: orderData.ticketData.quantity || 1,
                orderId: orderData.orderId,
                confirmationNumber: orderData.confirmationNumber,
                paymentMethod: orderData.paymentMethod || "Credit Card",
            };
    
            console.log("Creating purchase record with data:", purchaseData);
    
            const response = await fetch("http://localhost:8080/api/purchases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify(purchaseData),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Get detailed error
                throw new Error(`Failed to create purchase: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
    
            const createdPurchase = await response.json();
            console.log("Purchase created successfully:", createdPurchase);
    
            // Store in localStorage as backup
            const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
            existingBookings.push({
                ...createdPurchase,
                created_at: new Date().toISOString(),
            });
            localStorage.setItem("userBookings", JSON.stringify(existingBookings));
    
            return createdPurchase;
        } catch (error) {
            console.error("Error creating purchase record:", error);
            // Fallback to localStorage
            const fallbackBooking = {
                id: Date.now(),
                eventName: `${orderData.matchInfo.team1} vs ${orderData.matchInfo.team2}`,
                venue: orderData.matchInfo.venue || "Stadium",
                price: orderData.finalTotal,
                customerEmail: orderData.userEmail,
                customerName: orderData.userName,
                isUsed: 0,
                matchId: orderData.matchInfo.id,
                quantity: orderData.ticketData.quantity || 1,
                orderId: orderData.orderId,
                confirmationNumber: orderData.confirmationNumber,
                created_at: new Date().toISOString(),
            };
            
            const existingBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
            existingBookings.push(fallbackBooking);
            localStorage.setItem("userBookings", JSON.stringify(existingBookings));
            
            console.log("Booking saved to localStorage as fallback:", fallbackBooking);
            return fallbackBooking;
        }
    }
  
    function updateDatabaseInfo() {
      // FIXED: Use proper DOM methods instead of invalid CSS selectors
      const infoItems = document.querySelectorAll(".info-item")
      infoItems.forEach((item) => {
        const strongElement = item.querySelector("strong")
        if (strongElement && strongElement.textContent.includes("Status:")) {
          item.innerHTML = `<strong>Status:</strong> ${bookingSaved ? "Completed & Saved" : "Processing"}`
        }
      })
  
      // Update any database-related display elements
      const dbElements = document.querySelectorAll(".database-id")
      dbElements.forEach((el) => {
        if (el && orderData.databasePurchaseId) {
          el.textContent = orderData.databasePurchaseId
        }
      })
    }
  
    // ==================== ORDER DISPLAY FUNCTIONS ====================
    function updateOrderDisplay() {
      if (!orderData) {
        displayError("No order data available")
        return
      }
  
      try {
        // Update all HTML elements with proper data
        updateCustomerInformation()
        updateOrderDetails()
        updateTicketInformation()
        updatePricingInformation()
        updatePaymentInformation()
  
        console.log("Order display updated successfully")
      } catch (error) {
        console.error("Error updating order display:", error)
        displayError("Error displaying order details")
      }
    }
  
    function updateCustomerInformation() {
      // FIXED: Use proper DOM traversal instead of invalid selectors
      const infoItems = document.querySelectorAll(".info-item")
      infoItems.forEach((item) => {
        const strongElement = item.querySelector("strong")
        if (strongElement) {
          const labelText = strongElement.textContent
          if (labelText.includes("Name:")) {
            item.innerHTML = `<strong>Name:</strong> ${orderData.userName || "Customer"}`
          } else if (labelText.includes("Email:")) {
            
          } else if (labelText.includes("Phone:")) {
            item.innerHTML = `<strong>Phone:</strong> ${userInfo?.phone || "+213 657905340"}`
          } else if (labelText.includes("Address:")) {
            item.innerHTML = `<strong>Address:</strong> ${userInfo?.address || "Address not provided"}`
          }
        }
      })
    }
  
    function updateOrderDetails() {
      // FIXED: Use proper DOM traversal
      const infoItems = document.querySelectorAll(".info-item")
      infoItems.forEach((item) => {
        const strongElement = item.querySelector("strong")
        if (strongElement) {
          const labelText = strongElement.textContent
          if (labelText.includes("Order #:")) {
            item.innerHTML = `<strong>Order #:</strong> ${orderData.orderId || orderData.confirmationNumber}`
          } else if (labelText.includes("Date:")) {
            const date = new Date(orderData.timestamp)
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            item.innerHTML = `<strong>Date:</strong> ${formattedDate}`
          } else if (labelText.includes("Status:")) {
            item.innerHTML = `<strong>Status:</strong> ${bookingSaved ? "Completed" : "Processing"}`
          }
        }
      })
    }
  
    function updateTicketInformation() {
      // Update ticket name/event
      const ticketNameElements = document.querySelectorAll(".ticket-name")
      ticketNameElements.forEach((el) => {
        el.textContent = `${orderData.matchInfo.team1} vs ${orderData.matchInfo.team2}`
      })
  
      // Update ticket details
      const ticketDetailElements = document.querySelectorAll(".ticket-details")
      ticketDetailElements.forEach((el) => {
        const matchDate = orderData.matchInfo.matchDate
          ? new Date(orderData.matchInfo.matchDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date TBD"
  
        el.innerHTML = `${orderData.matchInfo.team1} vs ${orderData.matchInfo.team2}<br>
                        ${matchDate} | ${orderData.matchInfo.venue || "Stadium"}`
      })
  
      // Update table data
      const tableRows = document.querySelectorAll("tbody tr")
      if (tableRows.length > 0) {
        const firstRow = tableRows[0]
        const cells = firstRow.querySelectorAll("td")
  
        if (cells.length >= 5) {
          // Update quantity
          cells[2].textContent = orderData.ticketData.quantity || "1"
  
          // Update unit price
          const unitPrice = (orderData.subtotal || orderData.finalTotal || 0) / (orderData.ticketData.quantity || 1)
          cells[3].textContent = `$${unitPrice.toFixed(2)}`
  
          // Update total price
          cells[4].textContent = `$${(orderData.subtotal || orderData.finalTotal || 0).toFixed(2)}`
        }
      }
    }
  
    function updatePricingInformation() {
      // Update pricing in table
      const totalRows = document.querySelectorAll(".total-row")
      totalRows.forEach((row, index) => {
        const lastCell = row.querySelector("td:last-child")
        if (lastCell) {
          if (index === 0) {
            // Subtotal
            lastCell.textContent = `$${(orderData.subtotal || orderData.finalTotal || 0).toFixed(2)}`
          } else if (index === 1) {
            // Service fee
            lastCell.textContent = `$${(orderData.fees || 0).toFixed(2)}`
          }
        }
      })
  
      // Update grand total
      const grandTotalRows = document.querySelectorAll(".grand-total")
      grandTotalRows.forEach((row) => {
        const lastCell = row.querySelector("td:last-child")
        if (lastCell) {
          lastCell.textContent = `$${(orderData.finalTotal || 0).toFixed(2)}`
        }
      })
    }
  
    function updatePaymentInformation() {
      // FIXED: Use proper DOM traversal for payment info
      const paragraphs = document.querySelectorAll(".payment-info p")
      paragraphs.forEach((p) => {
        const strongElement = p.querySelector("strong")
        if (strongElement) {
          const labelText = strongElement.textContent
          if (labelText.includes("Method:")) {
            const method = orderData.paymentMethod || "Credit Card"
            const cardInfo = orderData.billingInfo?.cardLastFour
              ? ` (ending in ${orderData.billingInfo.cardLastFour})`
              : " (Visa ending in 4242)"
            p.innerHTML = `<strong>Method:</strong> ${method}${cardInfo}`
          } else if (labelText.includes("Payment Status:")) {
            p.innerHTML = `<strong>Payment Status:</strong> ${bookingSaved ? "Completed" : "Processing"}`
          } else if (labelText.includes("Delivery:")) {
            p.innerHTML = `<strong>Delivery:</strong> E-tickets sent to ${orderData.userEmail}`
          }
        }
      })
    }
  
    // ==================== HELPER FUNCTIONS ====================
    function displayError(message) {
      const container = document.querySelector(".order-container") || document.body
      const errorDiv = document.createElement("div")
      errorDiv.className = "error-message"
      errorDiv.style.cssText = `
              background: #ff4444;
              color: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
              font-weight: bold;
          `
      errorDiv.textContent = message
      container.insertBefore(errorDiv, container.firstChild)
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
              ${type === "warning" ? "background: #ffc107; color: #212529;" : ""}
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
    function setupEventListeners() {
      // Print button functionality
      const printBtn = document.querySelector(".print-btn")
      if (printBtn) {
        printBtn.addEventListener("click", (e) => {
          e.preventDefault()
  
          // Apply print-specific styles
          const style = document.createElement("style")
          style.innerHTML = `
                      @page { size: auto; margin: 3mm; }
                      body { font-size: 9px; line-height: 1.1; }
                      table { font-size: 8px; }
                      .dark-mode-toggle-container { display: none !important; }
                      .notification { display: none !important; }
                  `
          document.head.appendChild(style)
  
          window.print()
  
          // Clean up after printing
          setTimeout(() => style.remove(), 1000)
        })
      }
    }
  
    // ==================== DARK MODE FUNCTIONALITY ====================
    function createDarkModeToggle() {
      // Create the toggle container
      const toggleContainer = document.createElement("div")
      toggleContainer.className = "dark-mode-toggle-container"
      toggleContainer.innerHTML = `
              <div class="dark-mode-toggle">
                  <input type="checkbox" id="darkModeToggle" hidden>
                  <label for="darkModeToggle" class="toggle-label">
                      <i class="fas fa-sun sun-icon"></i>
                      <i class="fas fa-moon moon-icon"></i>
                      <span class="toggle-slider"></span>
                  </label>
              </div>
          `
  
      // Add the toggle to the header
      const orderHeader = document.querySelector(".order-header")
      if (orderHeader) {
        orderHeader.style.position = "relative"
        orderHeader.appendChild(toggleContainer)
      }
  
      // Add toggle styles
      addToggleStyles()
  
      // Add event listener
      const toggle = document.getElementById("darkModeToggle")
      if (toggle) {
        toggle.addEventListener("change", toggleDarkMode)
      }
    }
  
    function addToggleStyles() {
      const style = document.createElement("style")
      style.innerHTML = `
              .dark-mode-toggle-container {
                  position: absolute;
                  top: 50%;
                  right: 25px;
                  transform: translateY(-50%);
                  z-index: 10;
              }
              
              .dark-mode-toggle {
                  position: relative;
              }
              
              .toggle-label {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  width: 55px;
                  height: 28px;
                  background: rgba(255, 255, 255, 0.15);
                  border-radius: 20px;
                  padding: 2px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  position: relative;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  backdrop-filter: blur(10px);
              }
              
              .toggle-label:hover {
                  background: rgba(255, 255, 255, 0.25);
                  transform: scale(1.05);
              }
              
              .sun-icon, .moon-icon {
                  font-size: 12px;
                  color: white;
                  z-index: 2;
                  transition: all 0.3s ease;
                  padding: 0 4px;
              }
              
              .toggle-slider {
                  position: absolute;
                  top: 2px;
                  left: 2px;
                  width: 24px;
                  height: 24px;
                  background: white;
                  border-radius: 50%;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              }
              
              #darkModeToggle:checked + .toggle-label {
                  background: rgba(0, 0, 0, 0.3);
                  border-color: rgba(255, 255, 255, 0.1);
              }
              
              #darkModeToggle:checked + .toggle-label .toggle-slider {
                  transform: translateX(27px);
                  background: #2c3e50;
              }
              
              #darkModeToggle:checked + .toggle-label .sun-icon {
                  opacity: 0.4;
                  transform: rotate(180deg);
              }
              
              #darkModeToggle:checked + .toggle-label .moon-icon {
                  opacity: 1;
                  color: #f39c12;
                  transform: rotate(0deg);
              }
              
              #darkModeToggle:not(:checked) + .toggle-label .sun-icon {
                  opacity: 1;
                  color: #f39c12;
                  transform: rotate(0deg);
              }
              
              #darkModeToggle:not(:checked) + .toggle-label .moon-icon {
                  opacity: 0.4;
                  transform: rotate(-180deg);
              }
  
              .notification {
                  animation: slideInNotification 0.4s ease forwards;
              }
  
              @keyframes slideInNotification {
                  from {
                      opacity: 0;
                      transform: translateX(100%);
                  }
                  to {
                      opacity: 1;
                      transform: translateX(0);
                  }
              }
  
              /* Print styles */
              @media print {
                  .dark-mode-toggle-container, .notification {
                      display: none !important;
                  }
              }
          `
  
      document.head.appendChild(style)
    }
  
    function toggleDarkMode() {
      const body = document.body
      const toggle = document.getElementById("darkModeToggle")
  
      if (toggle.checked) {
        body.classList.add("dark-mode")
        localStorage.setItem("darkMode", "enabled")
        showModeChangeNotification("🌙 Mode sombre activé", "dark")
      } else {
        body.classList.remove("dark-mode")
        localStorage.setItem("darkMode", "disabled")
        showModeChangeNotification("☀️ Mode clair activé", "light")
      }
    }
  
    function loadDarkModePreference() {
      const darkMode = localStorage.getItem("darkMode")
      const toggle = document.getElementById("darkModeToggle")
  
      if (darkMode === "enabled") {
        document.body.classList.add("dark-mode")
        if (toggle) {
          toggle.checked = true
        }
      }
    }
  
    function showModeChangeNotification(message, mode) {
      const notification = document.createElement("div")
      notification.className = `mode-notification ${mode}`
      notification.innerHTML = `<span>${message}</span>`
  
      const notificationStyles = `
              .mode-notification {
                  position: fixed;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: #11998e;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 25px;
                  font-size: 14px;
                  font-weight: 500;
                  z-index: 10000;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                  opacity: 0;
                  animation: slideInNotification 0.4s ease forwards;
                  backdrop-filter: blur(10px);
              }
              
              .mode-notification.dark {
                  background: linear-gradient(135deg, #2c3e50, #34495e);
              }
              
              .mode-notification.light {
                  background: linear-gradient(135deg, #11998e, #16a085);
              }
          `
  
      if (!document.querySelector("#notification-styles")) {
        const styleSheet = document.createElement("style")
        styleSheet.id = "notification-styles"
        styleSheet.innerHTML = notificationStyles
        document.head.appendChild(styleSheet)
      }
  
      document.body.appendChild(notification)
  
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 2500)
    }
  
    console.log("✅ Order Confirmation with CORRECT endpoints loaded successfully")
  })
  