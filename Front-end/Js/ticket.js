document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");
    const API_BASE = "http://localhost:8080/api/matches";
  
    if (!matchId) {
      console.error("Missing matchId in URL");
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE}/${matchId}`);
      if (!res.ok) throw new Error("Match not found");
      const match = await res.json();
  
      // Ticket section
      document.querySelector(".match-image img").src = `${API_BASE}/${matchId}/photo`;
      document.querySelector(".ticket-info h1").textContent = `${match.team1} vs ${match.team2} | ${match.sportType}`;
      document.querySelector(".details p:nth-child(1)").innerHTML = `<i class="fas fa-soccer-ball"></i> ${match.sportType}`;
  
      const matchDate = new Date(match.matchDate);
      const formattedDate = matchDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric"
      });
      const formattedTime = matchDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
  
      document.querySelector(".details p:nth-child(2)").innerHTML = `<i class="far fa-calendar-alt"></i> ${formattedDate} | ${formattedTime}`;
      document.querySelector(".details p:nth-child(3)").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${match.venue}`;
      document.querySelector(".price-amount").textContent = `€${match.ticketPrice}`;
  
      // About Section
      document.querySelector(".about-details .text").textContent = match.description || "No description available.";
  
      // Guide Items (assumed default values)
      const guideItems = document.querySelectorAll(".guide-item");
      guideItems[0].querySelector("p").textContent = "1.5 Hours";
      guideItems[1].querySelector("p").textContent = "3 years & above";
      guideItems[2].querySelector("p").textContent = "Outdoor";
      guideItems[3].querySelector("p").textContent = "Seated";
      guideItems[4].querySelector("p").textContent = "Yes";
      guideItems[5].querySelector("p").textContent = "No";
  
      // Venue Section
      document.querySelector(".venue-name").textContent = match.venue;
      document.querySelector(".venue-address").innerHTML = match.venue.replace(/,/g, ",<br>");
  
      // Google Map Embed based on venue name
      const venueMap = document.querySelector(".venue-map");
      const mapQuery = encodeURIComponent(match.venue);
      const newIframe = document.createElement("iframe");
      newIframe.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
      newIframe.setAttribute("allowfullscreen", "");
      newIframe.setAttribute("loading", "lazy");
      venueMap.innerHTML = "";
      venueMap.appendChild(newIframe);
  
      // Venue Features (static example features)
      const featuresContainer = document.querySelector(".venue-features");
      featuresContainer.innerHTML = "";
      const sampleFeatures = ["Parking Available", "Wheelchair Access", "Food Courts"];
      sampleFeatures.forEach(feature => {
        const icon = feature.includes("Parking") ? "fa-car" :
                    feature.includes("Wheelchair") ? "fa-wheelchair" : "fa-utensils";
        featuresContainer.innerHTML += `
          <span class="feature">
            <i class="fas ${icon}"></i> ${feature}
          </span>
        `;
      });
  
      // Google Maps directions link
      document.querySelector(".directions-btn").href = `https://maps.google.com/?q=${mapQuery}`;
    } catch (err) {
      console.error("Error loading match:", err);
      alert("Failed to load match details. Please try again later.");
    }
  });
  
  // Booking redirection
  function bookTicket() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");
    window.location.href = `/html/book-cat.html?matchId=${matchId}`;
  }
  