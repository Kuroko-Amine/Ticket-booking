// Fonction utilitaire pour obtenir le token de manière cohérente
function getAuthToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", () => {
console.log("DOM loaded, initializing...")

// Initialiser le dropdown en premier
initDropdown()

// Puis les autres fonctionnalités
initDarkMode()
initScrolling()
initOtherFeatures()

// Initialiser la recherche en dernier avec un délai
setTimeout(() => {
  initSearch()
}, 200)
})

// Fonction de recherche qui utilise les données du back-end
function initSearch() {
console.log("Initializing search...")

setTimeout(() => {
  const searchInput = document.querySelector("#searchInput")
  const searchIcon = document.querySelector("#searchIcon")
  const searchSuggestions = document.querySelector("#searchSuggestions")

  console.log("Search elements found:", {
    input: !!searchInput,
    icon: !!searchIcon,
    suggestions: !!searchSuggestions,
  })

  if (!searchInput || !searchIcon || !searchSuggestions) {
    console.error("Éléments de recherche manquants!")
    return
  }

  // Fonction pour récupérer les données de recherche depuis le DOM
  function getSearchData() {
    const searchData = []

    // Récupérer les matchs depuis les cartes existantes
    const matchCards = document.querySelectorAll(".card")
    matchCards.forEach((card) => {
      const titleElement = card.querySelector("h1")
      const competitionElement = card.querySelector(".competition")

      if (titleElement) {
        searchData.push({
          name: titleElement.textContent.trim(),
          type: "match",
          element: card,
        })
      }

      if (competitionElement) {
        const competition = competitionElement.textContent.trim()
        if (!searchData.find((item) => item.name === competition)) {
          searchData.push({
            name: competition,
            type: "competition",
            element: card,
          })
        }
      }
    })

    // Récupérer les matchs tendance
    const trendCards = document.querySelectorAll(".trend")
    trendCards.forEach((card) => {
      const titleElement = card.querySelector("h1")
      const teamsElement = card.querySelector(".match-teams")

      if (titleElement) {
        searchData.push({
          name: titleElement.textContent.trim(),
          type: "trending",
          element: card,
        })
      }

      if (teamsElement) {
        const teams = teamsElement.querySelectorAll(".team")
        teams.forEach((team) => {
          const teamName = team.textContent.trim()
          if (!searchData.find((item) => item.name === teamName)) {
            searchData.push({
              name: teamName,
              type: "team",
              element: card,
            })
          }
        })
      }
    })

    console.log("Search data extracted:", searchData)
    return searchData
  }

  // Événement de saisie
  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase()
    console.log("Recherche:", query)

    if (query.length > 0) {
      const searchData = getSearchData()
      const results = searchData.filter((item) => item.name.toLowerCase().includes(query))
      showSuggestions(results, query)
    } else {
      hideSuggestions()
    }
  })

  // Clic sur l'icône
  searchIcon.addEventListener("click", () => {
    const query = searchInput.value.trim()
    if (query) {
      performSearch(query)
    }
  })

  // Touche Entrée
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim()
      if (query) {
        performSearch(query)
      }
    }
  })

  // Afficher les suggestions
  function showSuggestions(results, query) {
    searchSuggestions.innerHTML = ""

    if (results.length > 0) {
      results.slice(0, 6).forEach((result) => {
        const div = document.createElement("div")
        div.style.cssText = `
          padding: 12px 15px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `

        // Mettre en évidence le texte recherché
        const highlightedName = result.name.replace(
          new RegExp(query, "gi"),
          `<strong style="color: #11998e;">$&</strong>`,
        )

        div.innerHTML = `
          <div>
            <div>${highlightedName}</div>
            <small style="color: #666; text-transform: capitalize;">${result.type}</small>
          </div>
          <i class="fas fa-arrow-right" style="color: #11998e; font-size: 12px;"></i>
        `

        // Événements hover
        div.addEventListener("mouseenter", function () {
          this.style.backgroundColor = document.body.classList.contains("dark-mode") ? "#3d3d3d" : "#f8f9fa"
        })

        div.addEventListener("mouseleave", function () {
          this.style.backgroundColor = "transparent"
        })

        // Clic sur suggestion
        div.addEventListener("click", () => {
          searchInput.value = result.name
          hideSuggestions()
          performSearch(result.name, result)
        })

        searchSuggestions.appendChild(div)
      })

      searchSuggestions.style.display = "block"
    } else {
      const div = document.createElement("div")
      div.style.cssText = `
        padding: 12px 15px;
        color: #666;
        font-style: italic;
        text-align: center;
      `
      div.textContent = "Aucun résultat trouvé"
      searchSuggestions.appendChild(div)
      searchSuggestions.style.display = "block"
    }
  }

  // Masquer les suggestions
  function hideSuggestions() {
    searchSuggestions.style.display = "none"
  }

  // Effectuer la recherche
  function performSearch(query, selectedResult = null) {
    console.log("Recherche effectuée:", query)
    hideSuggestions()

    // Si un résultat spécifique a été sélectionné, faire défiler vers lui
    if (selectedResult && selectedResult.element) {
      selectedResult.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      // Ajouter un effet de surbrillance temporaire
      selectedResult.element.style.transform = "scale(1.02)"
      selectedResult.element.style.boxShadow = "0 15px 30px rgba(17, 153, 142, 0.4)"

      setTimeout(() => {
        selectedResult.element.style.transform = ""
        selectedResult.element.style.boxShadow = ""
      }, 2000)

      return
    }

    // Sinon, filtrer les cartes visibles
    const searchData = getSearchData()
    const matchingItems = searchData.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

    // Masquer toutes les cartes
    const allCards = document.querySelectorAll(".card, .trend")
    allCards.forEach((card) => {
      card.style.display = "none"
    })

    // Afficher seulement les cartes correspondantes
    const matchingElements = new Set()
    matchingItems.forEach((item) => {
      if (item.element) {
        matchingElements.add(item.element)
      }
    })

    matchingElements.forEach((element) => {
      element.style.display = "flex"
    })

    // Afficher un message si aucun résultat
    if (matchingElements.size === 0) {
      showNoResultsMessage(query)
    } else {
      removeNoResultsMessage()
      // Faire défiler vers le premier résultat
      const firstResult = Array.from(matchingElements)[0]
      firstResult.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Afficher un message "aucun résultat"
  function showNoResultsMessage(query) {
    removeNoResultsMessage()

    const message = document.createElement("div")
    message.id = "no-results-message"
    message.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 1.1rem;
      background: white;
      border-radius: 10px;
      margin: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    `

    if (document.body.classList.contains("dark-mode")) {
      message.style.background = "#2d2d2d"
      message.style.color = "#b0b0b0"
    }

    message.innerHTML = `
      <i class="fas fa-search" style="font-size: 3rem; color: #11998e; margin-bottom: 20px;"></i>
      <h3>Aucun résultat trouvé</h3>
      <p>Aucun match trouvé pour "${query}"</p>
      <button onclick="clearSearch()" style="
        background: #11998e;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        margin-top: 15px;
        cursor: pointer;
      ">Effacer la recherche</button>
    `

    const matchesSection = document.querySelector(".matches-section")
    if (matchesSection) {
      matchesSection.appendChild(message)
    }
  }

  // Supprimer le message "aucun résultat"
  function removeNoResultsMessage() {
    const message = document.getElementById("no-results-message")
    if (message) {
      message.remove()
    }
  }

  // Fonction globale pour effacer la recherche
  window.clearSearch = () => {
    searchInput.value = ""
    const allCards = document.querySelectorAll(".card, .trend")
    allCards.forEach((card) => {
      card.style.display = "flex"
    })
    removeNoResultsMessage()
  }

  // Fermer les suggestions en cliquant ailleurs
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target) && !searchIcon.contains(e.target)) {
      hideSuggestions()
    }
  })

  console.log("Recherche initialisée avec succès!")
}, 500) // Délai plus long pour laisser le temps au back-end de charger les données
}

// Mode sombre
function initDarkMode() {
const darkModeToggle = document.querySelector(".dark-mode-toggle")
const body = document.body

if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode")
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode")
    localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled")
  })
}
}

// Dropdown utilisateur
function initDropdown() {
// Essayer plusieurs sélecteurs pour trouver l'icône utilisateur
const userIcon =
  document.getElementById("userIcon") ||
  document.querySelector(".user-account i") ||
  document.querySelector(".fas.fa-user")

const dropdown = document.getElementById("accountDropdown") || document.querySelector(".dropdown")

console.log("Dropdown elements found:", {
  userIcon: !!userIcon,
  dropdown: !!dropdown,
})

if (userIcon && dropdown) {
  // Supprimer les anciens event listeners s'ils existent
  userIcon.removeEventListener("click", handleUserIconClick)

  // Ajouter le nouvel event listener
  userIcon.addEventListener("click", handleUserIconClick)

  function handleUserIconClick(e) {
    e.preventDefault()
    e.stopPropagation()
    console.log("User icon clicked")
    dropdown.classList.toggle("show")
  }

  // Fermer le dropdown en cliquant ailleurs
  document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show")
    }
  })

  console.log("Dropdown initialized successfully")
} else {
  console.error("Dropdown elements not found!")

  // Fallback: essayer d'initialiser après un délai
  setTimeout(() => {
    const fallbackUserIcon = document.querySelector(".user-account")
    const fallbackDropdown = document.querySelector(".dropdown")

    if (fallbackUserIcon && fallbackDropdown) {
      fallbackUserIcon.addEventListener("click", (e) => {
        e.stopPropagation()
        fallbackDropdown.classList.toggle("show")
      })
      console.log("Dropdown initialized with fallback")
    }
  }, 1000)
}
}

// Défilement des matches tendance
function initScrolling() {
const trendingContainer = document.querySelector(".trending-container")
const scrollLeftBtn = document.querySelector(".scroll-btn.left")
const scrollRightBtn = document.querySelector(".scroll-btn.right")

if (trendingContainer && scrollLeftBtn && scrollRightBtn) {
  const scrollAmount = 600

  scrollRightBtn.addEventListener("click", () => {
    trendingContainer.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  })

  scrollLeftBtn.addEventListener("click", () => {
    trendingContainer.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    })
  })
}
}

// Autres fonctionnalités
function initOtherFeatures() {
// Loading overlay
setTimeout(() => {
  const loadingOverlay = document.querySelector(".loading-overlay")
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0"
    setTimeout(() => {
      loadingOverlay.style.display = "none"
    }, 500)
  }
}, 1000)

// Back to top button
const backToTopBtn = document.querySelector(".back-to-top")
if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("visible")
    } else {
      backToTopBtn.classList.remove("visible")
    }
  })

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// Filtres de matchs
const filterButtons = document.querySelectorAll(".filter-btn")
const matchCards = document.querySelectorAll(".card")

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => btn.classList.remove("active"))
    this.classList.add("active")

    const filter = this.dataset.filter
    matchCards.forEach((card) => {
      if (filter === "all") {
        card.style.display = "flex"
      } else {
        const buyElement = card.querySelector(".buy")
        if (buyElement) {
          const hasClass = buyElement.classList.contains(filter)
          card.style.display = hasClass ? "flex" : "none"
        }
      }
    })
  })
})

// Année du copyright
const yearElement = document.querySelector(".year")
if (yearElement) {
  yearElement.textContent = new Date().getFullYear()
}
}