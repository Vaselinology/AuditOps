"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Plus, Trash2, X, Download, CheckCircle, Eye } from "lucide-react";

function buildNotificationHtml({ audit, docNumber, recipientIndex, users }) {
  const date = audit.planned_date
    ? new Date(audit.planned_date).toLocaleDateString("fr-FR", {day: "2-digit", month: "long", year: "numeric"})
    : new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const auditees = audit.auditees || [];
  const recipient = auditees[recipientIndex] || {
    name: "—",
    title: "",
    department: "",
  };
  const auditorName =
    users.find((u) => String(u.id) === String(audit.auditor_id))?.name ||
    audit.auditor_id ||
    "—";

  const plan = audit.audit_plan || [];
  const planRows = plan
    .map(
      (row) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #ddd;">${row.time || ""}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;">${row.activity || ""}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;">${row.auditor || auditorName}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;">${row.notes || ""}</td>
    </tr>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; padding: 0; background:#fff; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px 40px; }

    /* ── Header ── */
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:3px solid #CC0000; }
    .logo-block { display:flex; align-items:center; gap:10px; }
    .logo-circle { width:56px; height:56px; background:#CC0000; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .logo-circle svg { width:36px; height:36px; }
    .company-name { font-size:14pt; font-weight:700; color:#CC0000; line-height:1.2; }
    .company-sub  { font-size:8pt; color:#666; }
    .doc-title-block { text-align:right; }
    .doc-title { font-size:13pt; font-weight:700; color:#CC0000; text-transform:uppercase; }
    .doc-ref   { font-size:9pt; color:#555; margin-top:4px; }

    /* ── Info table ── */
    .info-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    .info-table td { padding:7px 10px; border:1px solid #ccc; font-size:10pt; }
    .info-table td:first-child { background:#f5f5f5; font-weight:600; white-space:nowrap; width:36%; }

    /* ── Plan table ── */
    .section-title { font-size:11pt; font-weight:700; color:#CC0000; margin:20px 0 8px; text-transform:uppercase; letter-spacing:0.5px; }
    .plan-table { width:100%; border-collapse:collapse; }
    .plan-table th { background:#CC0000; color:#fff; padding:8px 12px; text-align:left; border:1px solid #CC0000; font-size:10pt; }
    .plan-table td { border:1px solid #ddd; font-size:10pt; }
    .plan-table tr:nth-child(even) td { background:#fafafa; }

    /* ── Signatures ── */
    .signatures { display:flex; gap:40px; margin-top:36px; }
    .sig-block  { flex:1; text-align:center; }
    .sig-line   { border-top:1px solid #999; margin-top:40px; padding-top:6px; font-size:9pt; color:#555; }

    /* ── Footer ── */
    .footer { margin-top:28px; padding-top:12px; border-top:1px solid #ddd; font-size:8pt; color:#888; text-align:center; }
    .badge  { display:inline-block; background:#CC0000; color:#fff; font-size:8pt; padding:2px 8px; border-radius:4px; margin-bottom:6px; }
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <div class="header">
    <div class="logo-block">
      <div class="logo-circle">
        <!-- Stylised Tunisair bird mark in white -->
        <svg viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 4 C10 4 4 10 4 18 C4 26 10 32 18 32 C26 32 32 26 32 18 C32 10 26 4 18 4 Z M14 13 L22 11 L24 18 L18 22 L12 18 Z"/>
        </svg>
      </div>
      <div>
        <div class="company-name">TUNISAIR</div>
        <div class="company-sub">Audit Interne — Qualité & Conformité</div>
      </div>
    </div>
    <div class="doc-title-block">
      <div class="doc-title">Notification d'Audit Interne</div>
      <div class="doc-ref">Réf. : ${audit.audit_number || "NA-XX-XX"} / Doc. ${docNumber}</div>
    </div>
  </div>

  <!-- ── Identification fields ── -->
  <table class="info-table">
    <tr><td>Date de notification</td><td>${date}</td></tr>
    <tr>
      <td>À</td>
      <td>
        <strong>${recipient.name || "—"}</strong><br/>
        ${recipient.title ? recipient.title + "<br/>" : ""}
        ${recipient.department ? recipient.department + "<br/>" : ""}
        ${audit.adresse || ""}
      </td>
    </tr>
    <tr><td>Type d'audit</td><td>${audit.type === "planned" ? "Planifié" : audit.type === "unplanned" ? "Non planifié" : "Externe"}</td></tr>
    <tr><td>Objet de l'audit</td><td>${audit.audit_subject || audit.title || "—"}</td></tr>
    <tr><td>Durée de l'audit</td><td>${audit.audit_duration || "—"}</td></tr>
    <tr><td>Lieu / Département</td><td>${audit.audit_place || audit.department || "—"}</td></tr>
    <tr><td>Référentiels appliqués</td><td>${audit.referentials || "—"}</td></tr>
    <tr><td>Auditeur(s)</td><td>${auditorName}</td></tr>
  </table>

  <!-- ── Audit plan ── -->
  ${
    plan.length > 0
      ? `
  <div class="section-title">Plan d'Audit</div>
  <table class="plan-table">
    <thead>
      <tr>
        <th style="width:14%">Heure</th>
        <th style="width:44%">Activité / Processus audité</th>
        <th style="width:22%">Auditeur</th>
        <th style="width:20%">Observations</th>
      </tr>
    </thead>
    <tbody>
      ${planRows}
    </tbody>
  </table>`
      : ""
  }

  <!-- ── Signatures ── -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">Responsable Audit<br/>${auditorName}</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Auditée(s)<br/>${recipient.name || "—"}</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Direction Qualité</div>
    </div>
  </div>

  <!-- ── Footer ── -->
  <div class="footer">
    <div class="badge">CONFIDENTIEL</div><br/>
    Tunisair — Direction Qualité & Audit Interne — Ce document est strictement confidentiel.
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preview Modal
// Shows two documents side by side (or stacked on mobile),
// with Download PDF and Confirm buttons.
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({
  audit,
  users,
  onConfirm,
  onClose,
  isDark,
  textPrimary,
  textMuted,
  borderColor,
  bg,
  confirming,
}) {
  const auditees = audit.auditees || [];
  const [downloading, setDownloading] = useState(false);

  // Build HTML for both documents
  const doc1Html = buildNotificationHtml({
    audit,
    docNumber: 1,
    recipientIndex: 0,
    users,
  });
  const doc2Html = buildNotificationHtml({
    audit,
    docNumber: 2,
    recipientIndex: auditees.length > 1 ? 1 : 0,
    users,
  });

  const downloadPdf = async (html, filename) => {
    setDownloading(true);
    try {
      const res = await fetch("/integrations/pdf-generation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: { html } }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadBoth = async () => {
    await downloadPdf(doc1Html, `${audit.audit_number}-notification-1.pdf`);
    await downloadPdf(doc2Html, `${audit.audit_number}-notification-2.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div
        className="w-full max-w-6xl my-6 rounded-2xl border overflow-hidden shadow-2xl"
        style={{ backgroundColor: bg, borderColor }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: textPrimary }}>
              Prévisualisation — Notification d'Audit
            </h2>
            <p className="text-xs mt-0.5" style={{ color: textMuted }}>
              Vérifiez les documents avant de confirmer et d'envoyer les
              notifications
            </p>
          </div>
          <button onClick={onClose} style={{ color: textMuted }}>
            <X size={20} />
          </button>
        </div>

        {/* Two documents side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
          {[
            {
              html: doc1Html,
              label: "Notification d'audit — DGAC",
              suffix: "DGAC",
            },
            {
              html: doc2Html,
              label: "Notification d'audit — PART",
              suffix: "PART",
            },
          ].map(({ html, label, suffix }) => (
            <div
              key={suffix}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{
                  borderColor,
                  backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: textPrimary }}
                >
                  {label}
                </span>
                <button
                  onClick={() =>
                    downloadPdf(
                      html,
                      `${audit.audit_number}-notification-${suffix}.pdf`,
                    )
                  }
                  disabled={downloading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border"
                  style={{ borderColor, color: "#2563EB" }}
                >
                  <Download size={12} />
                  {downloading ? "…" : "PDF"}
                </button>
              </div>
              <iframe
                srcDoc={html}
                className="w-full"
                style={{ height: 600, border: "none", backgroundColor: "#fff" }}
                title={label}
              />
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor }}
        >
          <button
            onClick={downloadBoth}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium"
            style={{ borderColor, color: "#2563EB" }}
          >
            <Download size={16} />
            {downloading ? "Génération…" : "Télécharger les 2 PDFs"}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium"
              style={{ borderColor, color: textPrimary }}
            >
              Modifier
            </button>
            <button
              onClick={onConfirm}
              disabled={confirming}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
            >
              <CheckCircle size={16} />
              {confirming ? "Confirmation…" : "Confirmer & Notifier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Create Audit Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateAudit() {
  const { theme, t, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("planned");
  const [users, setUsers] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAudit, setPreviewAudit] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // ── Audit form state ──
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "planned",
    department: currentUser?.department || "",
    auditor_id: "",
    planned_date: "",
    created_by: currentUser?.id,
    // Notification fields
    adresse: "",
    audit_subject: "",
    audit_duration: "",
    audit_place: "",
    referentials: "",
    // auditees: array of { name, title, department }
    auditees: [{ name: "", title: "", department: "" }],
    // audit_plan: array of { time, activity, auditor, notes }
    audit_plan: [
      {
        time: "08h00",
        activity: "Réunion d'ouverture",
        auditor: "",
        notes: "",
      },
      { time: "09h00", activity: "", auditor: "", notes: "" },
      { time: "12h00", activity: "Pause déjeuner", auditor: "", notes: "" },
      { time: "13h00", activity: "", auditor: "", notes: "" },
      { time: "16h00", activity: "Réunion de clôture", auditor: "", notes: "" },
    ],
  });

  // ── Theme colors ──
  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  // ── Load data on mount ──
  useEffect(() => {
    fetchUsers();
    if (activeTab === "planned") fetchYearlyPlans();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchYearlyPlans = async () => {
    try {
      const year = new Date().getFullYear();
      const res = await fetch(`/api/yearly-planning?year=${year}`);
      if (res.ok) {
        const d = await res.json();
        setYearlyPlans(
          (d.planning || []).filter((p) => p.status === "planned"),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Form helpers ──
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const handle = (e) => set(e.target.name, e.target.value);

  // Auditee list helpers
  const addAuditee = () =>
    set("auditees", [
      ...form.auditees,
      { name: "", title: "", department: "" },
    ]);
  const removeAuditee = (i) =>
    set(
      "auditees",
      form.auditees.filter((_, idx) => idx !== i),
    );
  const setAuditee = (i, field, val) => {
    const updated = [...form.auditees];
    updated[i] = { ...updated[i], [field]: val };
    set("auditees", updated);
  };

  // Audit plan row helpers
  const addPlanRow = () =>
    set("audit_plan", [
      ...form.audit_plan,
      { time: "", activity: "", auditor: "", notes: "" },
    ]);
  const removePlanRow = (i) =>
    set(
      "audit_plan",
      form.audit_plan.filter((_, idx) => idx !== i),
    );
  const setPlanRow = (i, field, val) => {
    const updated = [...form.audit_plan];
    updated[i] = { ...updated[i], [field]: val };
    set("audit_plan", updated);
  };

  const selectPlan = (plan) => {
    set("title", plan.planned_audit_title);
    if (plan.department) set("department", plan.department);
    set("type", "planned");
  };

  // ── Preview: show notification before saving ──
  const handlePreview = (e) => {
    e.preventDefault();
    setPreviewAudit({ ...form, audit_number: "NA-XX-XX (en attente)" });
    setShowPreview(true);
  };

  // ── Confirm: save the audit, store notification HTML, then send notifications ──
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, created_by: currentUser?.id }),
      });
      if (!res.ok) throw new Error("Failed to create audit");
      const data = await res.json();
      const audit = data.audit;

      const fullAudit = { ...form, ...audit };
      const htmlDgac = buildNotificationHtml({
        audit: fullAudit,
        docNumber: "DGAC",
        recipientIndex: 0,
        users,
      });
      const htmlPart = buildNotificationHtml({
        audit: fullAudit,
        docNumber: "PART",
        recipientIndex: form.auditees.length > 1 ? 1 : 0,
        users,
      });

      await fetch("/api/audit-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_id: audit.id,
          html_dgac: htmlDgac,
          html_part: htmlPart,
          created_by: currentUser?.id,
        }),
      });

      for (const auditee of form.auditees || []) {
        if (!auditee.name) continue;
        const matchedUser = users.find((u) => u.name === auditee.name);
        if (matchedUser) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: matchedUser.id,
              title: `Notification d'audit — ${audit.audit_number}`,
              message: `Vous êtes convoqué(e) pour l'audit "${audit.audit_subject || audit.title}" le ${form.planned_date || "—"} à ${form.audit_place || "—"}.`,
              type: "audit",
              related_id: audit.id,
            }),
          });
        }
      }

      window.location.href = `/audits/${audit.id}`;
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setConfirming(false);
    }
  };

  // ── Reusable input styles ──
  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const iStyle = { borderColor, backgroundColor: bg, color: textPrimary };

  const Field = ({ label, required, children, hint }) => (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: textPrimary }}
      >
        {label}
        {required && <span style={{ color: "#EF4444" }}> *</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: textMuted }}>
          {hint}
        </p>
      )}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h3
      className="text-sm font-bold uppercase tracking-wide mb-4 mt-6 pb-2 border-b"
      style={{ color: "#2563EB", borderColor }}
    >
      {children}
    </h3>
  );

  return (
    <AppShell title={t("audit.create")}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Audit type tabs ── */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ backgroundColor: bgMuted }}
        >
          {[
            { id: "planned", label: "Planifié" },
            { id: "unplanned", label: "Non planifié" },
            { id: "external", label: "Externe" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                set("type", tab.id);
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? bg : "transparent",
                color: activeTab === tab.id ? textPrimary : textMuted,
                boxShadow:
                  activeTab === tab.id ? "0 1px 3px rgba(0,0,0,.1)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Yearly plan selector (only for planned type) ── */}
        {activeTab === "planned" && yearlyPlans.length > 0 && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{ borderColor, backgroundColor: bgMuted }}
          >
            <p
              className="text-xs font-semibold uppercase mb-3"
              style={{ color: textMuted }}
            >
              Importer depuis le plan annuel
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {yearlyPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan)}
                  className="text-left p-3 rounded-lg border hover:border-blue-400 transition-colors"
                  style={{ borderColor, backgroundColor: bg }}
                >
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: textPrimary }}
                  >
                    {plan.planned_audit_title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                    {plan.department} — {plan.planned_quarter}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main form ── */}
        <form onSubmit={handlePreview}>
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ backgroundColor: bg, borderColor }}
          >
            {/* ─ Section 1: Basic info ─ */}
            <SectionTitle>Informations générales</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Titre de l'audit" required>
                <input
                  name="title"
                  value={form.title}
                  onChange={handle}
                  required
                  className={inputCls}
                  style={iStyle}
                  placeholder="ex. Audit ISO 9001 Production"
                />
              </Field>
              <Field label="Auditeur principal">
                <select
                  name="auditor_id"
                  value={form.auditor_id}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                >
                  <option value="">— Sélectionner —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date prévue">
                <input
                  type="date"
                  name="planned_date"
                  value={form.planned_date}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label="Département / Site">
                <input
                  name="department"
                  value={form.department}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                  placeholder="ex. Maintenance"
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                rows={3}
                className={inputCls}
                style={iStyle}
                placeholder="Contexte et objectifs de l'audit…"
              />
            </Field>

            {/* ─ Section 2: Notification details ─ */}
            <SectionTitle>Détails de la notification</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Objet de l'audit">
                <input
                  name="audit_subject"
                  value={form.audit_subject}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                  placeholder="ex. Vérification conformité ISO"
                />
              </Field>
              <Field label="Durée de l'audit">
                <input
                  name="audit_duration"
                  value={form.audit_duration}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                  placeholder="ex. 1 jour (08h00 – 16h00)"
                />
              </Field>
              <Field label="Lieu">
                <input
                  name="audit_place"
                  value={form.audit_place}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                  placeholder="ex. Siège — Salle de réunion A"
                />
              </Field>
              <Field label="Adresse">
                <input
                  name="adresse"
                  value={form.adresse}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                  placeholder="Adresse du site audité"
                />
              </Field>
            </div>
            <Field
              label="Référentiels appliqués"
              hint="Séparer par des virgules si plusieurs"
            >
              <input
                name="referentials"
                value={form.referentials}
                onChange={handle}
                className={inputCls}
                style={iStyle}
                placeholder="ex. ISO 9001:2015, EN 9100:2018"
              />
            </Field>

            {/* ─ Section 3: Auditees ─ */}
            <SectionTitle>
              Personnes auditées (destinataires de la notification)
            </SectionTitle>
            <div className="space-y-3">
              {form.auditees.map((auditee, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    {i === 0 && (
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: textMuted }}
                      >
                        Nom
                      </label>
                    )}
                    <input
                      value={auditee.name}
                      onChange={(e) => setAuditee(i, "name", e.target.value)}
                      className={inputCls}
                      style={iStyle}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && (
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: textMuted }}
                      >
                        Titre / Fonction
                      </label>
                    )}
                    <input
                      value={auditee.title}
                      onChange={(e) => setAuditee(i, "title", e.target.value)}
                      className={inputCls}
                      style={iStyle}
                      placeholder="Responsable Qualité"
                    />
                  </div>
                  <div className="col-span-4">
                    {i === 0 && (
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: textMuted }}
                      >
                        Département
                      </label>
                    )}
                    <input
                      value={auditee.department}
                      onChange={(e) =>
                        setAuditee(i, "department", e.target.value)
                      }
                      className={inputCls}
                      style={iStyle}
                      placeholder="Département"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {i === 0 && <div className="h-5" />}
                    {form.auditees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuditee(i)}
                        className="p-1.5 rounded"
                        style={{ color: "#DC2626" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAuditee}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor, color: "#2563EB" }}
              >
                <Plus size={14} /> Ajouter une personne
              </button>
            </div>

            {/* ─ Section 4: Audit plan by hours ─ */}
            <SectionTitle>Plan d'audit (par heures)</SectionTitle>
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 px-1">
                {[
                  "Heure",
                  "Activité / Processus",
                  "Auditeur",
                  "Observations",
                  "",
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`text-xs font-semibold ${i === 0 ? "col-span-2" : i === 4 ? "col-span-1" : "col-span-3"}`}
                    style={{ color: textMuted }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {form.audit_plan.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2">
                    <input
                      value={row.time}
                      onChange={(e) => setPlanRow(i, "time", e.target.value)}
                      className={inputCls}
                      style={iStyle}
                      placeholder="08h00"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={row.activity}
                      onChange={(e) =>
                        setPlanRow(i, "activity", e.target.value)
                      }
                      className={inputCls}
                      style={iStyle}
                      placeholder="Activité…"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={row.auditor}
                      onChange={(e) => setPlanRow(i, "auditor", e.target.value)}
                      className={inputCls}
                      style={iStyle}
                    >
                      <option value="">— Auditeur —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      value={row.notes}
                      onChange={(e) => setPlanRow(i, "notes", e.target.value)}
                      className={inputCls}
                      style={iStyle}
                      placeholder="Notes…"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.audit_plan.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlanRow(i)}
                        className="p-1"
                        style={{ color: "#DC2626" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPlanRow}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor, color: "#2563EB" }}
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>

            {/* ─ Form actions ─ */}
            <div
              className="flex justify-end gap-3 pt-4 border-t mt-4"
              style={{ borderColor }}
            >
              <a
                href="/"
                className="px-5 py-2.5 rounded-lg border text-sm font-medium"
                style={{ borderColor, color: textPrimary }}
              >
                {t("common.cancel")}
              </a>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                <Eye size={16} />
                Prévisualiser la notification
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Notification Preview Modal ── */}
      {showPreview && previewAudit && (
        <PreviewModal
          audit={previewAudit}
          users={users}
          onConfirm={handleConfirm}
          onClose={() => setShowPreview(false)}
          isDark={isDark}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={borderColor}
          bg={bg}
          confirming={confirming}
        />
      )}
    </AppShell>
  );
}
