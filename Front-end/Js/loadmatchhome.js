document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:8080/api/matches";
  const container = document.getElementById("matchCardsContainer");
  const trendingContainer = document.getElementById("trendingMatches");
  const scrollLeftBtn = document.querySelector(".scroll-btn.left");
  const scrollRightBtn = document.querySelector(".scroll-btn.right");

  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then((matches) => {
      container.innerHTML = "";
      trendingContainer.innerHTML = "";

      matches.forEach((match) => {
        const date = new Date(match.matchDate);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" }).toUpperCase();
        const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const fullDate = date.toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        });

        // ✅ FIX: proper case-insensitive availability check
        const isAvailable = match.ticketAvailability?.toLowerCase() === "available";
        const ticketClass = isAvailable ? "dispo" : "limit";
        const ticketText = isAvailable ? "Ticket on sale" : "Limited availability";

        // Main card
        const cardHTML = `
          <div class="card">
            <div class="photo">
              <img src="http://localhost:8080/api/matches/${match.id}/photo" alt="${match.team1} vs ${match.team2}">
              <div class="date-badge"><span class="day">${day}</span><span class="month">${month}</span></div>
              ${match.hotMatch ? `<div class="trending-badge">🔥 Trending</div>` : ""}
            </div>
            <div class="info">
              <h1>${match.team1} vs ${match.team2}</h1>
              <p class="competition">${match.sportType}</p>
              <p><i class="fa-solid fa-location-dot"></i> ${match.venue}</p>
              <p><i class="fa-solid fa-clock"></i> ${time}</p>
              <div class="price">From €${match.ticketPrice}</div>
            </div>
            <div class="buy ${ticketClass}">
              <p><b>${ticketText}</b></p>
              <button onclick="window.location.href='ticket.html?matchId=${match.id}'">Buy now</button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", cardHTML);

        // Trending card
        if (match.hotMatch) {
          const trendHTML = `
            <div class="trend">
              <div class="trend-photo">
                <img src="http://localhost:8080/api/matches/${match.id}/photo" alt="${match.team1} vs ${match.team2}">
                <div class="trend-badge">HOT</div>
              </div>
              <div class="trend-info">
                <div class="match-teams">
                  <span class="team">${match.team1}</span>
                  <span class="vs">VS</span>
                  <span class="team">${match.team2}</span>
                </div>

                <div class="match-details">
                  <p><i class="fa-solid fa-location-dot"></i> ${match.venue}</p>
                  <p><i class="fa-solid fa-calendar"></i> ${fullDate}</p>
                  <p><i class="fa-solid fa-clock"></i> ${time}</p>
                </div>
                <div class="price-tag">Starting from <span>€${match.ticketPrice}</span></div>
              </div>
              <div class="buy-trend ${ticketClass}">
                <p><b>${ticketText}</b></p>
                <button onclick="window.location.href='ticket.html?matchId=${match.id}'">Get Tickets <i class="fas fa-ticket-alt"></i></button>
              </div>
            </div>
          `;
          trendingContainer.insertAdjacentHTML("beforeend", trendHTML);
        }
      });

      // Scroll buttons
      if (scrollLeftBtn && scrollRightBtn) {
        const scrollAmount = 600;

        scrollRightBtn.addEventListener("click", () => {
          trendingContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });

        scrollLeftBtn.addEventListener("click", () => {
          trendingContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });

        function updateScrollButtons() {
          const maxScroll = trendingContainer.scrollWidth - trendingContainer.clientWidth;
          scrollLeftBtn.disabled = trendingContainer.scrollLeft <= 10;
          scrollRightBtn.disabled = trendingContainer.scrollLeft >= maxScroll - 10;
        }

        trendingContainer.addEventListener("scroll", updateScrollButtons);
        updateScrollButtons();
      }
    })
    .catch((err) => {
      console.error("Error loading matches:", err.message);
      container.innerHTML = `<p style='color:red;'>Failed to load matches: ${err.message}</p>`;
    });
});
