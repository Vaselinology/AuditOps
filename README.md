# AuditOps — Système de Gestion des Audits Qualité et Sécurité
### Tunisair — Direction Assurance Qualité et Sécurité (DAQSE)

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Installation et démarrage local](#3-installation-et-démarrage-local)
4. [Structure de la base de données](#4-structure-de-la-base-de-données)
5. [Système d'authentification et rôles](#5-système-dauthentification-et-rôles)
6. [Pages et fonctionnalités](#6-pages-et-fonctionnalités)
7. [API — Endpoints backend](#7-api--endpoints-backend)
8. [Documents générés](#8-documents-générés)
9. [Paramètres et personnalisation](#9-paramètres-et-personnalisation)
10. [Guide d'utilisation par rôle](#10-guide-dutilisation-par-rôle)
11. [Compte administrateur par défaut](#11-compte-administrateur-par-défaut)
12. [Limitations actuelles et améliorations prévues](#12-limitations-actuelles-et-améliorations-prévues)

---

## 1. Vue d'ensemble

**AuditOps** est une plateforme web interne dédiée à la gestion complète du cycle de vie des audits qualité et sécurité de Tunisair. Elle permet de planifier, notifier, exécuter, documenter et clôturer les audits, tout en gérant les signalements d'incidents, les plans d'actions correctives, et les documents officiels associés.

### Objectifs principaux

- Centraliser la planification annuelle des audits (programme d'audit)
- Gérer l'ensemble du cycle de vie d'un audit : de la création à la clôture
- Générer automatiquement les documents officiels (notification d'audit DGAC/PART, rapport d'audit, fiches de constat)
- Permettre la gestion et le suivi des signalements d'événements/incidents
- Offrir un tableau de bord de supervision en temps réel
- Assurer le contrôle d'accès par rôle utilisateur

### Technologies utilisées

| Couche | Technologie |
|---|---|
| Frontend | React 18 (Vite + App Router style) |
| Backend | Node.js serverless (API routes) |
| Base de données | PostgreSQL 17 (via `@neondatabase/serverless`) |
| Styles | Tailwind CSS + styles inline |
| Icônes | Lucide React |
| Gestion d'état | React Context (AppContext) |
| Session | localStorage (clé `audit_session`) |

---

## 2. Architecture technique

```
apps/
└── web/
    ├── src/
    │   ├── app/                        # Pages et API routes (App Router)
    │   │   ├── page.jsx                # Tableau de bord (/)
    │   │   ├── login/page.jsx          # Page de connexion (/login)
    │   │   ├── audits/                 # Audits
    │   │   │   ├── page.jsx            # Liste de tous les audits
    │   │   │   ├── create/page.jsx     # Créer un audit
    │   │   │   └── [id]/page.jsx       # Détail d'un audit
    │   │   ├── calendar/page.jsx       # Calendrier
    │   │   ├── issue/report/page.jsx   # Signaler un problème
    │   │   ├── settings/page.jsx       # Paramètres utilisateur
    │   │   ├── yearly-plan/page.jsx    # Plan annuel
    │   │   ├── admin/
    │   │   │   ├── audits/page.jsx     # Gérer les audits (admin)
    │   │   │   ├── issues/page.jsx     # Examiner les signalements (admin)
    │   │   │   ├── announcements/page.jsx  # Gérer les annonces (admin)
    │   │   │   └── users/page.jsx      # Gérer les utilisateurs (admin)
    │   │   └── api/                    # Endpoints backend
    │   │       ├── auth/login/         # Authentification
    │   │       ├── audits/             # CRUD audits
    │   │       ├── issues/             # CRUD signalements
    │   │       ├── users/              # CRUD utilisateurs
    │   │       ├── notifications/      # Notifications
    │   │       ├── announcements/      # Annonces
    │   │       ├── calendar/           # Événements calendrier
    │   │       ├── findings/           # Constats
    │   │       ├── reports/            # Rapports
    │   │       ├── audit-notifications/# Notifications d'audit
    │   │       ├── programme/          # Programme d'audit
    │   │       └── yearly-planning/    # Plan annuel
    │   ├── components/
    │   │   ├── AppShell.jsx            # Layout principal (sidebar + header)
    │   │   └── AdminIssues/            # Composants de gestion des signalements
    │   ├── contexts/
    │   │   └── AppContext.jsx          # Contexte global (auth, thème, langue, t())
    │   ├── hooks/                      # Hooks personnalisés
    │   └── utils/                      # Utilitaires (calculs de risque, etc.)
    └── README.md                       # Ce fichier
```

### Flux de données

```
Navigateur → Page React (client) → fetch() → API route (Node.js) → PostgreSQL
                ↑
          AppContext
     (user, theme, langue, fontSize)
```

---

## 3. Installation et démarrage local

### Prérequis

| Outil | Version minimale | Lien |
|---|---|---|
| Node.js | 18.x ou supérieur | https://nodejs.org |
| npm | 9.x ou supérieur | Inclus avec Node.js |
| PostgreSQL | 14.x ou supérieur | https://www.postgresql.org |
| Git | Toute version récente | https://git-scm.com |

### Étape 1 — Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
cd <NOM_DU_DOSSIER>
```

### Étape 2 — Créer la base de données

Ouvrez pgAdmin ou un terminal `psql` et exécutez :

```sql
CREATE DATABASE tunisair_audit;
```

Puis exécutez le fichier de schéma (à la racine du projet) :

```bash
psql -U postgres -d tunisair_audit -f database-schema.sql
```

> **Note :** Remplacez `postgres` par votre nom d'utilisateur PostgreSQL si différent.

### Étape 3 — Variables d'environnement

Créez un fichier `.env.local` dans le dossier `apps/web/` :

```env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/tunisair_audit
NEXT_PUBLIC_CREATE_APP_URL=http://localhost:3000
NEXT_PUBLIC_CREATE_ENV=development
```

Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe de votre utilisateur PostgreSQL.

### Étape 4 — Installer les dépendances

À la racine du projet :

```bash
npm install
```

### Étape 5 — Lancer l'application

```bash
npm run dev
```

L'application sera accessible à l'adresse : **http://localhost:3000**

### Résolution de problèmes courants

| Problème | Solution |
|---|---|
| `ECONNREFUSED` à la base de données | Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` est correct |
| `Port 3000 already in use` | Utilisez `npm run dev -- --port 3001` |
| Erreur de schéma SQL | Assurez-vous d'utiliser PostgreSQL ≥ 14 (colonnes `GENERATED ALWAYS AS`) |
| Page blanche au premier chargement | Videz le `localStorage` du navigateur (F12 → Application → Local Storage → Clear) |
| Les modules sont introuvables | Supprimez `node_modules` et relancez `npm install` |

---

## 4. Structure de la base de données

La base de données contient **15 tables principales** :

### `users` — Utilisateurs
| Colonne | Type | Description |
|---|---|---|
| id | SERIAL PK | Identifiant unique |
| first_name | VARCHAR | Prénom |
| last_name | VARCHAR | Nom de famille |
| email | VARCHAR UNIQUE | Email (@tunisair.com.tn) |
| password_hash | VARCHAR | Mot de passe hashé (argon2) |
| title | VARCHAR | Fonction/titre |
| activity | VARCHAR | Activité/entité |
| role | VARCHAR | Rôle (admin/audit_manager/quality_safety_manager/auditee) |
| department_id | INT FK | Département |

### `departments` — Départements
| Colonne | Type | Description |
|---|---|---|
| id | SERIAL PK | Identifiant |
| name | VARCHAR | Nom complet |
| abbreviation | VARCHAR | Abréviation (ex: DAQSE) |

### `audits` — Audits
| Colonne | Type | Description |
|---|---|---|
| id | SERIAL PK | Identifiant |
| audit_number | VARCHAR UNIQUE | Numéro d'audit (ex: AUD-06-22) |
| title | VARCHAR | Titre de l'audit |
| description | TEXT | Description |
| type | VARCHAR | planned / unplanned / external |
| status | VARCHAR | draft / notified / in_progress / completed / closed |
| auditor_id | INT FK | Auditeur principal |
| department | VARCHAR | Département audité |
| planned_date | DATE | Date prévue |
| start_date | DATE | Date de début |
| end_date | DATE | Date de fin |
| audit_subject | TEXT | Objet de l'audit |
| audit_duration | VARCHAR | Durée |
| audit_place | VARCHAR | Lieu |
| referentials | TEXT | Référentiels applicables |
| audit_plan | JSONB | Plan d'audit détaillé |
| auditees | JSONB | Personnes auditées |
| notification_sent_at | TIMESTAMP | Date d'envoi de la notification |

### `audit_notifications` — Notifications d'audit
Documents officiels de notification générés pour chaque audit.
- 2 versions par audit : **DGAC** et **PART**
- Contenu HTML stocké pour prévisualisation et re-téléchargement

### `audit_reports` — Rapports d'audit
- 2 versions par audit : **DGAC** et **PART**
- Contenu JSONB (données structurées) + HTML pour la prévisualisation

### `finding_sheets` — Fiches de constat
Format de référence : `FS-AA-XX-YY`
- 2 versions : **DGAC** et **PART**
- Sections : constats, réponse de l'audité, plan d'action

### `findings` — Constats individuels
| Colonne | Type | Description |
|---|---|---|
| severity | VARCHAR | critical / major / minor |
| status | VARCHAR | open / in_progress / resolved / closed |
| deadline | DATE | Échéance de correction |

### `issue_reports` — Signalements d'événements
Formulaire complet de signalement avec :
- Identification de l'événement
- Évaluation initiale du risque (P × G = R)
- Réévaluation après actions correctives
- Rapport d'analyse HTML généré

### `action_plans` — Plans d'action
Liés aux signalements, audits ou constats individuels.

### `reminders` — Rappels
Déclenchés aux échéances suivantes :
- Au moment de l'événement
- 1 semaine avant l'échéance
- 3 jours avant
- 1 jour avant
- Le jour J

### `referentials` — Référentiels
ISO 9001, EN 9100, IOSA, PART-145, PART-M, PART-66, PART-147, SMS, etc.

### `activities` — Activités
Chaque activité peut être associée à plusieurs référentiels.

### `yearly_planning` — Plan annuel
Entrées planifiées avec trimestre, mois, statut.

### `programme_rows` / `programme_slots` — Programme d'audit (grille)
Grille visuelle mensuelle/hebdomadaire du programme d'audit.

### `announcements` — Annonces
Publiées par l'administration avec priorité (normal/high/urgent) et date d'expiration.

### `notifications` — Notifications in-app
Notifications internes par utilisateur, avec statut lu/non lu.

---

## 5. Système d'authentification et rôles

### Authentification

L'authentification est gérée côté client via `localStorage` (clé `audit_session`).

**Flux de connexion :**
1. L'utilisateur saisit son email et mot de passe sur `/login`
2. Le frontend envoie une requête `POST /api/auth/login`
3. Le backend vérifie les identifiants en base de données
4. Si valides, retourne l'objet utilisateur
5. Le frontend stocke la session dans `localStorage`
6. `AppContext` lit la session au chargement et redirige vers `/login` si absente

**Flux de déconnexion :**
1. L'utilisateur clique sur "Déconnexion" (sidebar ou paramètres)
2. `AppContext.logout()` vide `localStorage` (`audit_session`)
3. Redirection automatique vers `/login`

> **Mot de passe par défaut** pour tous les utilisateurs créés : `password`

### Rôles et permissions

| Rôle | Clé | Description |
|---|---|---|
| Administrateur | `admin` | Accès complet à toutes les fonctionnalités |
| Gestionnaire d'audit | `audit_manager` | Gère les audits et le plan annuel |
| Responsable Qualité/Sécurité | `quality_safety_manager` | Gère les signalements et analyses de risque |
| Audité | `auditee` | Consulte uniquement, peut signaler des problèmes |

### Matrice des permissions

| Fonctionnalité | admin | audit_manager | quality_safety_manager | auditee |
|---|:---:|:---:|:---:|:---:|
| Tableau de bord | ✅ | ✅ | ✅ | ✅ |
| Tous les audits (lecture) | ✅ | ✅ | ✅ | ✅ |
| Calendrier | ✅ | ✅ | ✅ | ✅ |
| Signaler un problème | ✅ | ✅ | ✅ | ✅ |
| Gérer les audits | ✅ | ✅ | ❌ | ❌ |
| Créer / modifier un audit | ✅ | ✅ | ❌ | ❌ |
| Plan annuel | ✅ | ✅ | ❌ | ❌ |
| Examiner les signalements | ✅ | ❌ | ✅ | ❌ |
| Gérer les annonces | ✅ | ❌ | ❌ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Panneau d'administration | ✅ | Partiel | Partiel | ❌ |

---

## 6. Pages et fonctionnalités

### `/` — Tableau de bord

Accessible à tous les utilisateurs connectés.

**Contenu :**
- **Bannière d'annonces** : les annonces actives s'affichent en haut avec un code couleur selon leur priorité (rouge = urgent, bleu = normal)
- **Audits actifs** : liste des 5 derniers audits avec numéro, statut et département. Cliquable pour accéder au détail.
- **Échéances à venir** : événements du calendrier dans les 30 prochains jours

---

### `/audits` — Tous les audits

Liste paginée de tous les audits avec filtres :
- Recherche par titre, numéro ou département
- Filtre par statut et par type

Chaque audit est cliquable et mène à sa page de détail.

---

### `/audits/create` — Créer un audit

**Accessible uniquement aux rôles :** `admin`, `audit_manager`

Formulaire de création avec :
- Informations générales (numéro, titre, type, département)
- Sélection depuis le plan annuel
- Auditeurs, personnes auditées
- Dates (planifiée, début, fin)
- Référentiels applicables
- Plan d'audit détaillé (tableau horaire)
- Lieu, durée, objet, adresse

---

### `/audits/[id]` — Détail d'un audit

Page avec onglets :

| Onglet | Description |
|---|---|
| **Aperçu** | Informations générales, statut, dates, auditeur |
| **Constats** | Liste des constats (finding) avec gravité et échéance |
| **Notifications** | Prévisualisation + téléchargement PDF (DGAC & PART) |
| **Rapports** | Prévisualisation + téléchargement PDF (DGAC & PART) |
| **Fiches de constat** | Prévisualisation + téléchargement PDF (DGAC & PART) |

**Actions disponibles (admin/audit_manager uniquement) :**
- Envoyer la notification d'audit (passage à l'état "notifié")
- Démarrer l'audit (passage à "en cours")
- Marquer comme terminé

---

### `/calendar` — Calendrier

Vue mensuelle interactive avec :
- Navigation entre les mois
- Affichage des événements par jour (audits planifiés, échéances, réunions)
- Code couleur par type d'événement

---

### `/issue/report` — Signaler un problème

Formulaire en sections collapsibles, accessible à tous :

**Section 1 — Identification de l'événement**
- ID événement (autogénéré si vide)
- Type (Non-conformité, Presque-accident, Incident, Observation, Réclamation, Autre)
- Date, références, A/C Mat / P/N & S/N

**Section 2 — Détails**
- Nom de l'événement, lieu, source
- Niveau d'urgence (Faible, Normal, Haute, Critique)
- Description complète

**Section 3 — Évaluation initiale du risque**
- Matrice de risque interactive 5×5
- Sélection par clic de la Probabilité (P) et la Gravité (G)
- Calcul automatique du RPN = P × G
- Niveaux : Faible (≤4), Moyen (≤9), Significatif (≤14), Élevé (≤25)

> **Les sections Investigation, Réévaluation, Efficacité et Analyse du risque sont réservées aux gestionnaires** — elles apparaissent uniquement dans "Examiner les signalements"

---

### `/admin/issues` — Examiner les signalements

**Accessible aux rôles :** `admin`, `quality_safety_manager`

Interface en deux colonnes :
- **Gauche** : liste de tous les signalements avec niveau de risque, urgence et statut
- **Droite** : détail du signalement sélectionné avec 4 onglets

| Onglet | Contenu |
|---|---|
| **Détails** | Informations de l'événement signalé |
| **Risque initial** | Évaluation P/G/R avec délai réglementaire affiché |
| **Examen** | Formulaire de revue complet pour le gestionnaire |
| **Rapport** | Prévisualisation et téléchargement du rapport PDF |

**Formulaire d'examen (onglet "Enregistrer l'examen") :**
- Statut, délai (auto-calculé : 72h si risque élevé, 15 jours sinon)
- Assignation et responsable (liste déroulante des utilisateurs)
- Date de révision
- Risque potentiel, mesures existantes, actions proposées
- Investigation (texte libre)
- Action corrective
- Réévaluation du risque (P, G)
- Efficacité (Efficace / Partiellement / Non efficace)
- Analyse du risque (cases P, G, R)
- **Bouton "Générer le rapport"** → génère un PDF officiel et le sauvegarde

**Délais réglementaires :**
- Risque élevé (R > 14) → délai de **72 heures**
- Risque modéré ou faible (R ≤ 14) → délai de **15 jours**

---

### `/admin/audits` — Gérer les audits

**Accessible aux rôles :** `admin`, `audit_manager`

- Tableau de bord statistiques (total, brouillons, en cours, terminés)
- Filtres par statut et type
- Tableau des audits avec actions (voir, supprimer)
- Bouton "Créer un audit" (lien vers `/audits/create`)

---

### `/admin/announcements` — Gérer les annonces

**Accessible au rôle :** `admin` uniquement

- Créer des annonces avec titre, contenu, priorité, date d'expiration
- Publier/archiver des annonces
- Les annonces apparaissent en bandeaux sur le tableau de bord

---

### `/admin/users` — Gérer les utilisateurs

**Accessible au rôle :** `admin` uniquement

- Liste de tous les utilisateurs
- Création, modification, suppression d'utilisateurs
- Attribution de rôles et départements

---

### `/yearly-plan` — Plan annuel

**Accessible aux rôles :** `admin`, `audit_manager`

- Grille annuelle des audits planifiés par trimestre/mois
- Ajout, modification, suppression d'entrées
- Suivi du statut (planifié, programmé, terminé)
- Lien "Créer l'audit" pour chaque entrée planifiée

---

### `/settings` — Paramètres

Accessible à tous.

**Profil** :
- Modifier nom, email, titre, département
- Les modifications sont sauvegardées immédiatement et visibles dans toute l'interface

**Apparence** :
- Thème : Clair / Sombre
- Langue : English / Français
- Taille de police : Petite / Moyenne / Grande (s'applique à toute l'interface)

**Compte** :
- Bouton de déconnexion (efface la session et redirige vers `/login`)

---

## 7. API — Endpoints backend

Tous les endpoints se trouvent dans `apps/web/src/app/api/`.

### Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion utilisateur |

**Corps de la requête :**
```json
{ "email": "user@tunisair.com.tn", "password": "password" }
```
**Réponse :**
```json
{ "user": { "id": 1, "name": "...", "email": "...", "role": "admin", "department": "..." } }
```

### Audits

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/audits` | Liste tous les audits |
| POST | `/api/audits` | Crée un audit |
| GET | `/api/audits/[id]` | Détail d'un audit (avec constats, rapports, notifications) |
| PATCH | `/api/audits/[id]` | Met à jour un audit |
| DELETE | `/api/audits/[id]` | Supprime un audit |
| POST | `/api/audits/[id]/notify` | Envoie la notification d'audit |

### Signalements

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/issues` | Liste tous les signalements |
| POST | `/api/issues` | Crée un signalement |
| PATCH | `/api/issues` | Met à jour un signalement (avec le rapport HTML) |

### Utilisateurs

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Liste les utilisateurs (filtre par rôle/département) |
| POST | `/api/users` | Crée un utilisateur |
| PATCH | `/api/users` | Met à jour un utilisateur |
| DELETE | `/api/users` | Supprime un utilisateur |

### Autres

| Endpoint | Description |
|---|---|
| GET `/api/announcements` | Annonces actives |
| POST `/api/announcements` | Crée une annonce |
| GET `/api/calendar` | Événements du calendrier (par plage de dates) |
| GET `/api/notifications` | Notifications d'un utilisateur |
| GET/POST `/api/findings` | Constats d'audit |
| GET/POST `/api/reports` | Rapports d'audit |
| POST `/api/audit-notifications` | Sauvegarde les notifications d'audit (DGAC/PART) |
| GET/POST `/api/yearly-planning` | Plan annuel |
| GET/POST `/api/programme` | Programme d'audit (grille) |

---

## 8. Documents générés

L'application génère 3 types de documents officiels, chacun en **deux versions** : **DGAC** et **PART**.

### Notification d'audit (`NA-XX-YY`)

Générée lors de l'envoi de la notification d'audit.

**Contenu :**
- En-tête Tunisair
- Plan d'audit (auditeurs, audités, responsables, représentants, références, date)
- Distribution (cases à cocher : DGTT, DAQSE, DM, DRE, MCC, DAA, DC, DFT, DLA, DVSC, DCP, DIT, DLT)
- Zone de signatures (responsable qualité, direction)

**Numérotation :** `NA-[numéro_séquentiel]-[année]`

---

### Rapport d'audit (`RA-XX-YY`)

Généré une fois l'audit terminé.

**Contenu :**
- En-tête avec référence et dates
- Plan d'audit (auditeurs, audités, lead auditor, représentants, références)
- Distribution (liste des directions concernées)
- Points de contrôle vérifiés avec colonne "Remarques"
- Points forts (ajoutables dynamiquement)
- Points faibles (ajoutables dynamiquement)
- Résultats d'audit : tableau avec description du défaut, classification (M/m) et délai
- Zone de signatures : Lead Auditeur, Auditeur(s), Responsable d'audit, Responsable Qualité et Sécurité

**Numérotation :** `RA-[numéro_séquentiel]-[année]`

---

### Fiche de constat (`FS-AA-XX-YY`)

Générée après le rapport d'audit. Référence automatiquement la notification et le rapport associés.

**Contenu :**
- Documents référencés (notification d'audit et rapport d'audit pré-remplis automatiquement)
- Objet et adresse
- Tableau des défauts (description + références, classification M/m, délai)
- Réponse de l'audité (cause racine, actions curatives avec dates)
- Plan d'action avec dates
- Signature (nom, date, fonction)

**Numérotation :** `FS-AA-[numéro_séquentiel]-[année]`

---

### Rapport d'analyse de risque

Généré dans "Examiner les signalements" pour chaque signalement d'événement.

**Contenu :**
- Identification (risque potentiel, source, type, date, lieu)
- Description de l'événement
- Évaluation initiale du risque (P, G, RPN)
- Mesures préventives existantes
- Actions préventives proposées
- Réévaluation du risque (P, G, RPN)
- Responsable et date de révision
- Zone de signatures (Responsable Qualité, Responsable Sécurité, Direction)

---

## 9. Paramètres et personnalisation

### Thème
- **Clair** (défaut) : fond blanc, texte sombre
- **Sombre** : fond gris anthracite, texte clair
- Persisté dans `localStorage`

### Langue
- **Anglais** : interface en anglais
- **Français** : interface en français (défaut recommandé)
- Persisté dans `localStorage`

### Taille de police
- **Petite** : 13px (base HTML)
- **Moyenne** (défaut) : 16px
- **Grande** : 19px
- Appliquée à l'élément `<html>` donc impacte toute l'interface
- Persistée dans `localStorage`

### Profil utilisateur
- Nom, email, titre, département modifiables depuis les Paramètres
- Modifications sauvegardées dans `localStorage` (session locale)
- Le nom affiché dans la sidebar et le header se met à jour immédiatement

---

## 10. Guide d'utilisation par rôle

### Pour un Administrateur (`admin`)

1. **Connexion** avec `Haifa.SDIRI@tunisair.com.tn` / `password`
2. **Créer les utilisateurs** dans "Gérer les utilisateurs" avec les bons rôles
3. **Publier des annonces** importantes dans "Gérer les annonces"
4. **Superviser tous les audits** via "Gérer les audits" ou le tableau de bord
5. **Accéder à tout** le panneau d'administration

### Pour un Gestionnaire d'audit (`audit_manager`)

1. **Consulter le plan annuel** et créer les audits planifiés
2. **Créer un audit** depuis `/audits/create` ou depuis le plan annuel
3. **Envoyer la notification d'audit** depuis la page de détail → génère les documents DGAC et PART
4. **Démarrer l'audit** une fois sur site → statut passe à "En cours"
5. **Générer le rapport d'audit** une fois l'audit terminé
6. **Créer la fiche de constat** référençant notification et rapport

### Pour un Responsable Qualité/Sécurité (`quality_safety_manager`)

1. **Consulter les signalements** dans "Examiner les signalements"
2. **Sélectionner un signalement** et passer à l'onglet "Enregistrer l'examen"
3. **Vérifier le délai** (72h ou 15 jours selon le niveau de risque)
4. **Remplir le formulaire** d'examen (investigation, actions, réévaluation)
5. **Générer le rapport PDF** et le télécharger ou le consulter dans l'onglet "Rapport"

### Pour un Audité (`auditee`)

1. **Consulter les audits** le concernant sur "Tous les audits"
2. **Télécharger les documents** (notifications, rapports, fiches) depuis le détail de l'audit
3. **Signaler un événement** via "Signaler un problème"
4. **Consulter le calendrier** pour voir les dates d'audit à venir

---

## 11. Compte administrateur par défaut

| Champ | Valeur |
|---|---|
| Nom | Haifa Sdiri |
| Email | Haifa.SDIRI@tunisair.com.tn |
| Mot de passe | password |
| Rôle | Administrateur (`admin`) |
| Département | Administration |
| Titre | Administrator |

> ⚠️ **Changez ce mot de passe immédiatement en production.**

---

## 12. Limitations actuelles et améliorations prévues

### Limitations actuelles

| Limitation | Détail |
|---|---|
| **Authentification simplifiée** | La session est stockée en `localStorage` (pas de JWT serveur ni de cookies sécurisés). Convient pour un usage interne sur réseau local. |
| **Mot de passe en clair** | La vérification du mot de passe compare avec `"password"` (valeur en dur). L'intégration d'argon2 pour le hashage est prévue. |
| **Génération PDF basique** | Les rapports sont générés en HTML et convertis en PDF via l'intégration PDF. Le formatage avancé (sauts de page précis, en-têtes/pieds de page) peut nécessiter des ajustements. |
| **Pas de notifications email** | Les rappels et notifications sont uniquement in-app. L'envoi d'emails (via Resend ou SMTP) n'est pas encore intégré. |
| **Données hors ligne** | Pas de mode hors ligne. Une connexion réseau est requise pour toutes les opérations. |
| **Pas de pagination serveur** | Les listes sont chargées intégralement. À optimiser pour les grandes bases de données. |

### Améliorations prévues

- [ ] Hashage des mots de passe avec **argon2** et stockage sécurisé
- [ ] Sessions serveur avec cookies HTTPOnly (JWT ou session DB)
- [ ] Envoi d'emails de rappel via **Resend** ou SMTP interne
- [ ] Génération PDF côté serveur avec mise en page précise (numérotation de pages, en-têtes officiels)
- [ ] Module de gestion des rappels automatiques (cron job)
- [ ] Système de notifications push (WebSocket ou SSE)
- [ ] Export Excel du plan annuel et des statistiques
- [ ] Tableau de bord analytique avancé (graphiques, tendances)
- [ ] Intégration avec le système RH de Tunisair pour la synchronisation des utilisateurs
- [ ] Audit trail (journal de toutes les actions effectuées)
- [ ] Application mobile (React Native / Expo) pour les auditeurs sur le terrain

---

*Documentation rédigée le 23 mai 2026 — Version 1.0*
*Tunisair — Direction Assurance Qualité et Sécurité (DAQSE)*
