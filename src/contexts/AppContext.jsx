"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();
const SESSION_KEY = "audit_session";

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("medium");
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";
    const savedSession = localStorage.getItem(SESSION_KEY);

    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setFontSize(savedFontSize);

    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        console.log("Loaded user from localStorage:", user);
        setCurrentUser(user);
      } catch {
        console.error("Failed to parse session from localStorage");
        setCurrentUser(null);
      }
    } else {
      console.log("No session found in localStorage");
      setCurrentUser(null);
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (typeof window === "undefined") return;
    const onLoginPage = window.location.pathname === "/login";
    if (!currentUser && !onLoginPage) {
      window.location.href = "/login";
    }
    if (currentUser && onLoginPage) {
      window.location.href = "/";
    }
  }, [authChecked, currentUser]);

  useEffect(() => {
    const sizes = { small: "13px", medium: "16px", large: "19px" };
    if (typeof document !== "undefined") {
      document.documentElement.style.fontSize = sizes[fontSize] || "16px";
    }
  }, [fontSize]);

  const updateCurrentUser = (updates) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "fr" : "en";
    setLanguage(next);
    localStorage.setItem("language", next);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
  };

  const t = (key) => {
    const translations = {
      "app.name": { en: "AuditOps", fr: "AuditOps" },
      "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
      "nav.audits": { en: "All Audits", fr: "Tous les audits" },
      "nav.calendar": { en: "Calendar", fr: "Calendrier" },
      "nav.yearlyPlan": { en: "Yearly Plan", fr: "Plan annuel" },
      "nav.settings": { en: "Settings", fr: "Paramètres" },
      "nav.adminPanel": { en: "Admin", fr: "Administration" },
      "nav.manageAudits": { en: "Manage Audits", fr: "Gérer les audits" },
      "nav.manageAnnouncements": { en: "Announcements", fr: "Annonces" },
      "nav.reviewIssues": {
        en: "Review Issues",
        fr: "Examiner les signalements",
      },
      "nav.manageUsers": { en: "Manage Users", fr: "Gérer les utilisateurs" },
      "dashboard.title": { en: "Dashboard", fr: "Tableau de bord" },
      "dashboard.activeAudits": { en: "Active Audits", fr: "Audits actifs" },
      "dashboard.upcomingDeadlines": {
        en: "Upcoming Deadlines",
        fr: "Échéances à venir",
      },
      "dashboard.recentAnnouncements": { en: "Announcements", fr: "Annonces" },
      "dashboard.viewAll": { en: "View all", fr: "Voir tout" },
      "dashboard.noAudits": { en: "No active audits", fr: "Aucun audit actif" },
      "dashboard.noDeadlines": {
        en: "No upcoming deadlines",
        fr: "Aucune échéance",
      },
      "dashboard.noAnnouncements": {
        en: "No announcements",
        fr: "Aucune annonce",
      },
      "audit.create": { en: "Create Audit", fr: "Créer un audit" },
      "audit.planned": { en: "Planned", fr: "Planifié" },
      "audit.unplanned": { en: "Unplanned", fr: "Non planifié" },
      "audit.external": { en: "External", fr: "Externe" },
      "audit.status.draft": { en: "Draft", fr: "Brouillon" },
      "audit.status.notified": { en: "Notified", fr: "Notifié" },
      "audit.status.in_progress": { en: "In Progress", fr: "En cours" },
      "audit.status.completed": { en: "Completed", fr: "Terminé" },
      "audit.status.closed": { en: "Closed", fr: "Fermé" },
      "audit.number": { en: "Audit Number", fr: "Numéro d'audit" },
      "audit.title": { en: "Title", fr: "Titre" },
      "audit.description": { en: "Description", fr: "Description" },
      "audit.department": { en: "Department", fr: "Département" },
      "audit.auditor": { en: "Auditor", fr: "Auditeur" },
      "audit.type": { en: "Type", fr: "Type" },
      "audit.plannedDate": { en: "Planned Date", fr: "Date prévue" },
      "audit.startDate": { en: "Start Date", fr: "Date de début" },
      "audit.endDate": { en: "End Date", fr: "Date de fin" },
      "audit.createdAt": { en: "Created", fr: "Créé le" },
      "audit.selectFromPlan": {
        en: "Select from Yearly Plan",
        fr: "Sélectionner du plan annuel",
      },
      "audit.noPlanned": {
        en: "No planned audits",
        fr: "Aucun audit planifié",
      },
      "audit.noFound": { en: "No audits found", fr: "Aucun audit trouvé" },
      "audit.notFound": { en: "Audit not found", fr: "Audit introuvable" },
      "audit.loading": { en: "Loading...", fr: "Chargement..." },
      "audit.detail.overview": { en: "Overview", fr: "Aperçu" },
      "audit.detail.findings": { en: "Findings", fr: "Constats" },
      "audit.detail.reports": { en: "Reports", fr: "Rapports" },
      "audit.detail.notifications": {
        en: "Notifications",
        fr: "Notifications",
      },
      "audit.detail.findingSheets": {
        en: "Finding Sheets",
        fr: "Fiches de constat",
      },
      "audit.detail.timeline": { en: "Timeline", fr: "Chronologie" },
      "audit.detail.actions": { en: "Actions", fr: "Actions" },
      "audit.detail.sendNotification": {
        en: "Send Notification",
        fr: "Envoyer la notification",
      },
      "audit.detail.startAudit": { en: "Start Audit", fr: "Démarrer l'audit" },
      "audit.detail.generateReport": {
        en: "Generate Report",
        fr: "Générer le rapport",
      },
      "audit.detail.markCompleted": {
        en: "Mark Completed",
        fr: "Marquer terminé",
      },
      "audit.detail.noFindings": { en: "No findings yet", fr: "Aucun constat" },
      "audit.detail.noReports": { en: "No reports yet", fr: "Aucun rapport" },
      "audit.detail.noDescription": {
        en: "No description",
        fr: "Aucune description",
      },
      "audit.detail.notAssigned": { en: "Not assigned", fr: "Non assigné" },
      "audit.detail.deadline": { en: "Deadline", fr: "Échéance" },
      "audit.detail.assigned": { en: "Assigned to", fr: "Assigné à" },
      "audit.detail.generated": { en: "Generated", fr: "Généré le" },
      "audit.detail.by": { en: "by", fr: "par" },
      "audit.detail.notifyTitle": {
        en: "Send Audit Notification",
        fr: "Envoyer la notification d'audit",
      },
      "audit.detail.notifyBody": {
        en: "This will generate the official notification document and notify all auditees.",
        fr: "Cela générera le document officiel de notification et informera les personnes auditées.",
      },
      "audit.detail.notifySuccess": {
        en: "Notification sent",
        fr: "Notification envoyée",
      },
      "audit.detail.reportSuccess": {
        en: "Report generated",
        fr: "Rapport généré",
      },
      "audit.detail.download": { en: "Download PDF", fr: "Télécharger PDF" },
      "admin.audits.title": { en: "Manage Audits", fr: "Gérer les audits" },
      "admin.audits.total": { en: "Total", fr: "Total" },
      "admin.audits.draft": { en: "Draft", fr: "Brouillon" },
      "admin.audits.inProgress": { en: "In Progress", fr: "En cours" },
      "admin.audits.completed": { en: "Completed", fr: "Terminés" },
      "admin.audits.allStatuses": {
        en: "All Statuses",
        fr: "Tous les statuts",
      },
      "admin.audits.allTypes": { en: "All Types", fr: "Tous les types" },
      "admin.audits.search": { en: "Search audits...", fr: "Rechercher..." },
      "admin.audits.noFound": {
        en: "No audits found",
        fr: "Aucun audit trouvé",
      },
      "admin.audits.deleteTitle": {
        en: "Delete Audit",
        fr: "Supprimer l'audit",
      },
      "admin.audits.deleteBody": {
        en: "This will permanently delete the audit and all its data.",
        fr: "Cela supprimera définitivement l'audit et toutes ses données.",
      },
      "admin.announcements.title": { en: "Announcements", fr: "Annonces" },
      "admin.announcements.new": {
        en: "New Announcement",
        fr: "Nouvelle annonce",
      },
      "admin.announcements.create": { en: "Create", fr: "Créer" },
      "admin.announcements.all": {
        en: "All Announcements",
        fr: "Toutes les annonces",
      },
      "admin.announcements.content": { en: "Content", fr: "Contenu" },
      "admin.announcements.priority": { en: "Priority", fr: "Priorité" },
      "admin.announcements.expires": {
        en: "Expires (optional)",
        fr: "Expire le (facultatif)",
      },
      "admin.announcements.publish": { en: "Publish", fr: "Publier" },
      "admin.announcements.publishedBy": {
        en: "Published by",
        fr: "Publié par",
      },
      "admin.announcements.expires2": { en: "Expires", fr: "Expire" },
      "admin.announcements.unknown": { en: "Unknown", fr: "Inconnu" },
      "admin.announcements.normal": { en: "Normal", fr: "Normal" },
      "admin.announcements.high": { en: "High", fr: "Haute" },
      "admin.announcements.urgent": { en: "Urgent", fr: "Urgente" },
      "admin.issues.title": {
        en: "Review Issues",
        fr: "Examiner les signalements",
      },
      "admin.issues.all": { en: "All Issues", fr: "Tous les signalements" },
      "admin.issues.detail": {
        en: "Issue Details",
        fr: "Détails du signalement",
      },
      "admin.issues.select": {
        en: "Select an issue to review",
        fr: "Sélectionnez un signalement",
      },
      "admin.issues.category": { en: "Category", fr: "Catégorie" },
      "admin.issues.reportedBy": { en: "Reported by", fr: "Signalé par" },
      "admin.issues.assignTo": { en: "Assign to", fr: "Assigner à" },
      "admin.issues.selectUser": {
        en: "Select user",
        fr: "Sélectionner un utilisateur",
      },
      "admin.issues.deadline": { en: "Deadline", fr: "Échéance" },
      "admin.issues.corrective": {
        en: "Corrective Action",
        fr: "Action corrective",
      },
      "admin.issues.correctivePh": {
        en: "Define corrective actions...",
        fr: "Définir les actions correctives...",
      },
      "admin.issues.update": { en: "Save Review", fr: "Enregistrer l'examen" },
      "admin.issues.generateReport": {
        en: "Generate Report",
        fr: "Générer le rapport",
      },
      "admin.issues.downloadReport": {
        en: "Download Report",
        fr: "Télécharger le rapport",
      },
      "admin.issues.status.submitted": { en: "Submitted", fr: "Soumis" },
      "admin.issues.status.under_review": {
        en: "Under Review",
        fr: "En cours d'examen",
      },
      "admin.issues.status.action_assigned": {
        en: "Action Assigned",
        fr: "Action assignée",
      },
      "admin.issues.status.resolved": { en: "Resolved", fr: "Résolu" },
      "finding.severity.critical": { en: "Critical", fr: "Critique" },
      "finding.severity.major": { en: "Major", fr: "Majeur" },
      "finding.severity.minor": { en: "Minor", fr: "Mineur" },
      "finding.status.open": { en: "Open", fr: "Ouvert" },
      "finding.status.in_progress": { en: "In Progress", fr: "En cours" },
      "finding.status.resolved": { en: "Resolved", fr: "Résolu" },
      "finding.status.closed": { en: "Closed", fr: "Fermé" },
      "calendar.title": { en: "Calendar", fr: "Calendrier" },
      "calendar.today": { en: "Today", fr: "Aujourd'hui" },
      "calendar.prev": { en: "Previous", fr: "Précédent" },
      "calendar.next": { en: "Next", fr: "Suivant" },
      "calendar.noEvents": { en: "No events", fr: "Aucun événement" },
      "calendar.events": { en: "Events", fr: "Événements" },
      "calendar.type.audit": { en: "Audit", fr: "Audit" },
      "calendar.type.deadline": { en: "Deadline", fr: "Échéance" },
      "calendar.type.meeting": { en: "Meeting", fr: "Réunion" },
      "yearlyPlan.title": { en: "Yearly Plan", fr: "Plan annuel" },
      "yearlyPlan.add": { en: "Add Entry", fr: "Ajouter" },
      "yearlyPlan.addTitle": {
        en: "Add Planned Audit",
        fr: "Ajouter un audit planifié",
      },
      "yearlyPlan.auditTitle": { en: "Audit Title", fr: "Titre de l'audit" },
      "yearlyPlan.quarter": { en: "Quarter", fr: "Trimestre" },
      "yearlyPlan.month": { en: "Month", fr: "Mois" },
      "yearlyPlan.notes": { en: "Notes", fr: "Notes" },
      "yearlyPlan.status.planned": { en: "Planned", fr: "Planifié" },
      "yearlyPlan.status.scheduled": { en: "Scheduled", fr: "Programmé" },
      "yearlyPlan.status.completed": { en: "Completed", fr: "Terminé" },
      "yearlyPlan.noEntries": {
        en: "No entries for this year",
        fr: "Aucune entrée pour cette année",
      },
      "yearlyPlan.year": { en: "Year", fr: "Année" },
      "yearlyPlan.allQuarters": {
        en: "All Quarters",
        fr: "Tous les trimestres",
      },
      "yearlyPlan.createAudit": { en: "Create Audit", fr: "Créer un audit" },
      "yearlyPlan.editEntry": { en: "Edit Entry", fr: "Modifier" },
      "yearlyPlan.deleteConfirm": {
        en: "Delete this entry?",
        fr: "Supprimer cette entrée ?",
      },
      "yearlyPlan.total": { en: "Total", fr: "Total" },
      "yearlyPlan.planned": { en: "Planned", fr: "Planifié" },
      "yearlyPlan.scheduled": { en: "Scheduled", fr: "Programmé" },
      "yearlyPlan.completed": { en: "Completed", fr: "Terminé" },
      "issue.report": { en: "Report an Issue", fr: "Signaler un problème" },
      "issue.title": { en: "Title", fr: "Titre" },
      "issue.description": { en: "Description", fr: "Description" },
      "issue.category": { en: "Category", fr: "Catégorie" },
      "issue.urgency": { en: "Urgency", fr: "Urgence" },
      "issue.submit": { en: "Submit", fr: "Soumettre" },
      "issue.submitSuccess": {
        en: "Issue Submitted",
        fr: "Signalement soumis",
      },
      "issue.submitSuccessBody": {
        en: "Your issue has been submitted and will be reviewed.",
        fr: "Votre signalement a été soumis et sera examiné.",
      },
      "issue.urgency.low": { en: "Low", fr: "Faible" },
      "issue.urgency.normal": { en: "Normal", fr: "Normal" },
      "issue.urgency.high": { en: "High", fr: "Haute" },
      "issue.urgency.critical": { en: "Critical", fr: "Critique" },
      "settings.title": { en: "Settings", fr: "Paramètres" },
      "settings.profile": { en: "Profile", fr: "Profil" },
      "settings.editProfile": { en: "Edit Profile", fr: "Modifier le profil" },
      "settings.saveProfile": { en: "Save Changes", fr: "Enregistrer" },
      "settings.appearance": { en: "Appearance", fr: "Apparence" },
      "settings.account": { en: "Account", fr: "Compte" },
      "settings.theme": { en: "Theme", fr: "Thème" },
      "settings.language": { en: "Language", fr: "Langue" },
      "settings.fontSize": { en: "Font Size", fr: "Taille de police" },
      "settings.light": { en: "Light", fr: "Clair" },
      "settings.dark": { en: "Dark", fr: "Sombre" },
      "settings.small": { en: "Small", fr: "Petite" },
      "settings.medium": { en: "Medium", fr: "Moyenne" },
      "settings.large": { en: "Large", fr: "Grande" },
      "notifications.title": { en: "Notifications", fr: "Notifications" },
      "notifications.none": {
        en: "No notifications",
        fr: "Aucune notification",
      },
      "notifications.markRead": {
        en: "Mark all read",
        fr: "Tout marquer comme lu",
      },
      "common.save": { en: "Save", fr: "Enregistrer" },
      "common.cancel": { en: "Cancel", fr: "Annuler" },
      "common.delete": { en: "Delete", fr: "Supprimer" },
      "common.edit": { en: "Edit", fr: "Modifier" },
      "common.search": { en: "Search", fr: "Rechercher" },
      "common.filter": { en: "Filter", fr: "Filtrer" },
      "common.logout": { en: "Logout", fr: "Déconnexion" },
      "common.loading": { en: "Loading...", fr: "Chargement..." },
      "common.noData": { en: "No data", fr: "Aucune donnée" },
      "common.actions": { en: "Actions", fr: "Actions" },
      "common.status": { en: "Status", fr: "Statut" },
      "common.type": { en: "Type", fr: "Type" },
      "common.department": { en: "Department", fr: "Département" },
      "common.auditor": { en: "Auditor", fr: "Auditeur" },
      "common.na": { en: "N/A", fr: "N/A" },
      "common.unknown": { en: "Unknown", fr: "Inconnu" },
      "common.clearFilters": { en: "Clear filters", fr: "Effacer les filtres" },
      "common.showing": { en: "Showing", fr: "Affichage de" },
      "common.of": { en: "of", fr: "sur" },
      "common.confirm": { en: "Confirm", fr: "Confirmer" },
      "common.back": { en: "Back", fr: "Retour" },
      "common.view": { en: "View", fr: "Voir" },
      "common.download": { en: "Download", fr: "Télécharger" },
      "common.preview": { en: "Preview", fr: "Prévisualiser" },
      "month.1": { en: "January", fr: "Janvier" },
      "month.2": { en: "February", fr: "Février" },
      "month.3": { en: "March", fr: "Mars" },
      "month.4": { en: "April", fr: "Avril" },
      "month.5": { en: "May", fr: "Mai" },
      "month.6": { en: "June", fr: "Juin" },
      "month.7": { en: "July", fr: "Juillet" },
      "month.8": { en: "August", fr: "Août" },
      "month.9": { en: "September", fr: "Septembre" },
      "month.10": { en: "October", fr: "Octobre" },
      "month.11": { en: "November", fr: "Novembre" },
      "month.12": { en: "December", fr: "Décembre" },
      "day.sun": { en: "Sun", fr: "Dim" },
      "day.mon": { en: "Mon", fr: "Lun" },
      "day.tue": { en: "Tue", fr: "Mar" },
      "day.wed": { en: "Wed", fr: "Mer" },
      "day.thu": { en: "Thu", fr: "Jeu" },
      "day.fri": { en: "Fri", fr: "Ven" },
      "day.sat": { en: "Sat", fr: "Sam" },
    };
    return translations[key]?.[language] || key;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        language,
        fontSize,
        currentUser,
        authChecked,
        updateCurrentUser,
        logout,
        toggleTheme,
        toggleLanguage,
        changeFontSize,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
