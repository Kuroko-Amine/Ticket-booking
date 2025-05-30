# 🎟️ TikiTiki — Ticket Booking Platform

TikiTiki est une application **Full Stack** qui simule un site de **vente de billets de matchs sportifs**. Elle combine un **frontend en HTML/CSS/JavaScript** et un **backend RESTful en Spring Boot**. Tout est entièrement relié pour une expérience fluide et dynamique.

---

## 🌐 Fonctionnalités principales

### 🏠 Page d’accueil
- Affichage des **matchs disponibles**
- Mise en avant des **"Trending Matches"** (ex : FC Barcelona vs Real Madrid)

### 📄 Détails du match
- Informations complètes : équipes, date, lieu
- Description du match
- Affichage dynamique du **stade** avec possibilité de **choisir sa place**
- Chaque **section de stade** a un **prix différent**

### 💳 Simulation de paiement
- Formulaire de carte bancaire (simulation)
- Aucune donnée réelle collectée

---

## 🔐 Authentification

### 👤 Création de compte
- Inscription avec confirmation par **email**
- Vous devez cliquer sur un lien pour activer votre compte

### 🔁 Réinitialisation de mot de passe
- Fonction "**Mot de passe oublié ?**"
- Envoi d’un **email avec un lien sécurisé**
- Changement du mot de passe depuis une page dédiée

---

## 🛠️ Tableau de bord Admin

### ✨ Fonctionnalités Admin
- Accès à un **dashboard analytique**
- Voir tous les utilisateurs
- **Promouvoir un utilisateur en admin**
- **Supprimer un compte**
- **Ajouter de nouveaux matchs** (avec **photos**, description, etc.)

---

## 👥 Types de comptes

- **Utilisateur (User)** : Peut réserver des places et consulter les matchs
- **Administrateur (Admin)** : A un accès complet au tableau de bord et à la gestion du site

---

## 🧰 Technologies utilisées

| Frontend            | Backend                |
|---------------------|------------------------|
| HTML5 / CSS3 / JS   | Java + Spring Boot     |
| Vanilla JavaScript  | Spring Security / JPA  |
| Responsive UI       | REST API (JSON)        |
| EmailJS / SMTP      | MySQL / H2 DB          |

---

## 🚀 Lancer le projet

### Backend (Spring Boot)

