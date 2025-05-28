console.log("🚀 DÉBUT DU SCRIPT AUTH DEBUG");

// Attendre que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM chargé, début de l'initialisation...");
    
    // ÉTAPE 1: Analyser la structure HTML
    console.log("🔍 ÉTAPE 1: Analyse de la structure HTML");
    
    // ÉTAPE 2: Chercher les éléments de différentes manières
    console.log("🔍 ÉTAPE 2: Recherche des éléments cibles");
    
    let userIcon = document.getElementById('userIcon');
    let dropdown = document.getElementById('accountDropdown');
    
    console.log("Recherche par ID:", { userIcon: !!userIcon, dropdown: !!dropdown });
    
    // Si pas trouvé par ID, chercher autrement
    if (!userIcon) {
        userIcon = document.querySelector('.fas.fa-user') || 
                  document.querySelector('.fa-user') || 
                  document.querySelector('.user-account i') ||
                  document.querySelector('[title*="Account"]') ||
                  document.querySelector('.nav-icons i.fa-user');
        console.log("Icône trouvée par sélecteur alternatif:", !!userIcon);
        if (userIcon) {
            console.log("Icône trouvée:", userIcon);
            userIcon.id = 'userIcon'; // Assigner l'ID
        }
    }
    
    if (!dropdown) {
        dropdown = document.querySelector('.dropdown') || 
                  document.querySelector('.user-account .dropdown');
        console.log("Dropdown trouvé par sélecteur alternatif:", !!dropdown);
        if (dropdown) {
            console.log("Dropdown trouvé:", dropdown);
            dropdown.id = 'accountDropdown'; // Assigner l'ID
        }
    }
    
    // ÉTAPE 3: Créer les éléments s'ils n'existent pas
    if (!userIcon || !dropdown) {
        console.log("🛠️ ÉTAPE 3: Création des éléments manquants");
        
        // Chercher le conteneur nav-icons
        const navIcons = document.querySelector('.nav-icons');
        console.log("Conteneur nav-icons trouvé:", !!navIcons);
        
        if (navIcons) {
            // Créer l'icône utilisateur si elle n'existe pas
            if (!userIcon) {
                console.log("🔧 Création de l'icône utilisateur");
                const userAccount = document.createElement('div');
                userAccount.className = 'user-account';
                userAccount.style.position = 'relative'; // Important pour le positionnement du dropdown
                userAccount.innerHTML = `
                    <i class="fas fa-user" title="Account" id="userIcon" style="cursor: pointer;"></i>
                    <div class="dropdown" id="accountDropdown"></div>
                `;
                navIcons.appendChild(userAccount);
                
                userIcon = document.getElementById('userIcon');
                dropdown = document.getElementById('accountDropdown');
                console.log("✅ Éléments créés:", { userIcon: !!userIcon, dropdown: !!dropdown });
            }
        } else {
            console.error("❌ Impossible de trouver le conteneur nav-icons");
            return;
        }
    }
    
    // ÉTAPE 4: Configuration du dropdown
    console.log("🔧 ÉTAPE 4: Configuration du dropdown");
    
    if (userIcon && dropdown) {
        // S'assurer que le parent a position relative
        const parent = userIcon.closest('.user-account') || userIcon.parentElement;
        if (parent) {
            parent.style.position = 'relative';
        }
        
        // Styles de base pour le dropdown - FERMÉ PAR DÉFAUT
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            right: 0;
            top: calc(100% + 8px);
            background-color: #ffffff;
            min-width: 180px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            z-index: 1000;
            padding: 6px 0;
            border: 1px solid rgba(0, 0, 0, 0.08);
            opacity: 0;
            transform: translateY(-5px);
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        // Contenu initial du dropdown
        dropdown.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px;"><i class="fas fa-sign-in-alt" style="margin-right: 10px;"></i> Sign-in</a></li>
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px;"><i class="fas fa-user-plus" style="margin-right: 10px;"></i> Sign-up</a></li>
            </ul>
        `;
        
        // S'assurer que le dropdown est fermé au démarrage
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        
        console.log("✅ Dropdown configuré avec contenu de base - FERMÉ");
        
        // ÉTAPE 5: Ajouter les event listeners
        console.log("🎯 ÉTAPE 5: Ajout des event listeners");
        
        // Variable pour suivre l'état
        let isDropdownOpen = false;
        
        // Fonction pour ouvrir le dropdown
        function openDropdown() {
            console.log("🔓 Ouverture du dropdown");
            isDropdownOpen = true;
            dropdown.style.display = "block";
            dropdown.offsetHeight; // Force reflow
            dropdown.style.opacity = "1";
            dropdown.style.transform = "translateY(0)";
            dropdown.classList.add('show');
        }
        
        // Fonction pour fermer le dropdown
        function closeDropdown() {
            console.log("🔒 Fermeture du dropdown");
            isDropdownOpen = false;
            dropdown.style.opacity = "0";
            dropdown.style.transform = "translateY(-5px)";
            dropdown.classList.remove('show');
            setTimeout(() => {
                if (!isDropdownOpen) {
                    dropdown.style.display = "none";
                }
            }, 200);
        }
        
        // Fonction pour forcer la fermeture
        function forceCloseDropdown() {
            console.log("🔒 Fermeture forcée du dropdown");
            isDropdownOpen = false;
            dropdown.classList.remove('show');
            dropdown.style.display = "none";
            dropdown.style.opacity = "0";
            dropdown.style.transform = "translateY(-5px)";
        }
        
        // Event listener sur l'icône
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("👆 CLIC SUR L'ICÔNE UTILISATEUR DÉTECTÉ!");
            
            if (isDropdownOpen || dropdown.classList.contains('show')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });
        
        // Event listener sur le document pour fermer
        document.addEventListener('click', (e) => {
            if (!userIcon.contains(e.target) && !dropdown.contains(e.target)) {
                if (isDropdownOpen || dropdown.classList.contains('show')) {
                    console.log("👆 Clic extérieur, fermeture du dropdown");
                    closeDropdown();
                }
            }
        });
        
        // Event listener pour la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (isDropdownOpen || dropdown.classList.contains('show'))) {
                console.log("⌨️ Touche Escape, fermeture du dropdown");
                closeDropdown();
            }
        });
        
        // Fermer le dropdown lors du changement de page
        window.addEventListener('beforeunload', () => {
            forceCloseDropdown();
        });
        
        // Fermer le dropdown lors du redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            if (isDropdownOpen || dropdown.classList.contains('show')) {
                closeDropdown();
            }
        });
        
        console.log("✅ Event listeners ajoutés");
        
        // ÉTAPE 7: Mise à jour avec l'authentification
        updateAuthUI();
        
    } else {
        console.error("❌ ÉCHEC: Impossible de configurer le dropdown");
        console.log("userIcon:", userIcon);
        console.log("dropdown:", dropdown);
    }
});

// Fonction utilitaire pour obtenir le token de manière cohérente
function getAuthToken() {
    // Vérifier les deux clés possibles pour la compatibilité
    return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Fonction utilitaire pour définir le token de manière cohérente
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
    // Supprimer l'ancienne clé si elle existe
    localStorage.removeItem('token');
}

// Fonction utilitaire pour supprimer le token
function removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // Supprimer aussi l'ancienne clé
}

// Fonction de mise à jour de l'interface d'authentification
async function updateAuthUI() {
    console.log("🔄 Mise à jour de l'interface d'authentification...");
    
    const dropdown = document.getElementById('accountDropdown');
    if (!dropdown) {
        console.error("❌ Dropdown non trouvé pour la mise à jour");
        return;
    }

    const token = getAuthToken();
    console.log("🔑 Token présent:", !!token);

    // Si pas connecté : afficher login/signup
    if (!token) {
        console.log("👤 Utilisateur non connecté - affichage login/signup");
        dropdown.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-sign-in-alt" style="margin-right: 10px; color: #11998e;"></i> Sign-in</a></li>
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-user-plus" style="margin-right: 10px; color: #11998e;"></i> Sign-up</a></li>
            </ul>
        `;
        return;
    }

    try {
        console.log("🌐 Vérification du token auprès du serveur...");
        
        const response = await fetch('http://localhost:8080/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const user = await response.json();
        console.log("✅ Utilisateur connecté:", user.email || user.username);
        
        const isAdmin = user.role === 'ADMIN';
        console.log("👑 Administrateur:", isAdmin);

        dropdown.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><a href="#" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-user" style="margin-right: 10px; color: #11998e;"></i> ${user.email || user.username}</a></li>
                ${isAdmin ? `<li><a href="/html/admin/index.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-tachometer-alt" style="margin-right: 10px; color: #11998e;"></i> Dashboard</a></li>` : ''}
                <li><a href="#" id="logoutBtn" style="display: flex; align-items: center; padding: 8px 16px; color: #ff4757; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='rgba(255, 71, 87, 0.08)'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Logout</a></li>
            </ul>
        `;

        // Ajouter l'event listener pour le bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
            console.log("✅ Bouton de déconnexion configuré");
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification du token:', error);

        // Si le token est invalide : le retirer et afficher login/signup
        removeAuthToken();
        console.log("🗑️ Token invalide supprimé");
        
        dropdown.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-sign-in-alt" style="margin-right: 10px; color: #11998e;"></i> Sign-in</a></li>
                <li><a href="/html/login.html" style="display: flex; align-items: center; padding: 8px 16px; color: #444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'"><i class="fas fa-user-plus" style="margin-right: 10px; color: #11998e;"></i> Sign-up</a></li>
            </ul>
        `;
    }
}

function logoutUser() {
    console.log("🚪 Déconnexion de l'utilisateur...");
    
    // Fermer le dropdown avant de déconnecter
    const dropdown = document.getElementById('accountDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    }
    
    removeAuthToken();
    updateAuthUI();

    // Notification simple
    alert("Vous avez été déconnecté avec succès.");

    // Rediriger après un délai
    setTimeout(() => {
        window.location.href = '/html/home.html';
    }, 1000);
}

console.log("✅ Script auth-debug.js chargé et corrigé");