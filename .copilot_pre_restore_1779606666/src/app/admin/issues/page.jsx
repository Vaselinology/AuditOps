"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { IssuesList } from "@/components/AdminIssues/IssuesList";
import { IssueDetail } from "@/components/AdminIssues/IssueDetail";
import { useIssuesData } from "@/hooks/useIssuesData";
import { useIssueSelection } from "@/hooks/useIssueSelection";

const PROB_LABELS = {
  1: "Rare",
  2: "Improbable",
  3: "Possible",
  4: "Probable",
  5: "Quasi-certain",
};
const SEV_LABELS = {
  1: "Négligeable",
  2: "Mineur",
  3: "Modéré",
  4: "Majeur",
  5: "Catastrophique",
};

function getRiskLevel(r) {
  if (!r) return "—";
  if (r <= 4) return "Faible";
  if (r <= 9) return "Moyen";
  if (r <= 14) return "Significatif";
  return "Élevé";
}

function buildReportHtml(issue, formData, users) {
  const data = { ...issue, ...formData };
  const responsible =
    users.find(
      (u) => String(u.id) === String(data.responsible_id || data.assigned_to),
    )?.name || "—";
  const initR = (data.initial_probability || 0) * (data.initial_severity || 0);
  const reassR = (data.reass_probability || 0) * (data.reass_severity || 0);
  const date = new Date().toLocaleDateString("fr-FR");
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:Arial,sans-serif;font-size:10pt;color:#1a1a1a;padding:0;margin:0}
  .page{max-width:720px;margin:0 auto;padding:32px 40px}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #CC0000}
  .logo{width:52px;height:52px;background:#CC0000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12pt}
  .doc-title{font-size:13pt;font-weight:700;color:#CC0000;text-align:right}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  td,th{padding:7px 10px;border:1px solid #ccc;font-size:9pt}
  th{background:#f5f5f5;font-weight:600;text-align:left}
  .sec{font-weight:700;color:#CC0000;margin:18px 0 8px;font-size:10pt;text-transform:uppercase}
  .hi{color:#DC2626;font-weight:700} .lo{color:#059669;font-weight:700}
  .sigs{display:flex;gap:40px;margin-top:40px}
  .sig{flex:1;text-align:center;border-top:1px solid #999;padding-top:6px;font-size:8pt;color:#555;margin-top:40px}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;font-size:8pt;color:#888;text-align:center}
</style>
</head>
<body><div class="page">
  <div class="header">
    <div class="logo">TA</div>
    <div><div class="doc-title">Rapport d'Analyse de Risque</div><div style="font-size:8pt;color:#555;text-align:right">Réf. : ${data.event_id || "—"} | Date : ${date}</div></div>
  </div>
  <div class="sec">1. Identification</div>
  <table>
    <tr><th style="width:35%">Risque potentiel</th><td>${data.potential_hazard || data.event_name || "—"}</td></tr>
    <tr><th>Source</th><td>${data.source || "—"}</td></tr>
    <tr><th>Type</th><td>${data.event_type || "—"}</td></tr>
    <tr><th>Date</th><td>${data.event_date ? new Date(data.event_date).toLocaleDateString("fr-FR") : "—"}</td></tr>
    <tr><th>Lieu</th><td>${data.location || "—"}</td></tr>
  </table>
  <div class="sec">2. Description</div>
  <table><tr><td>${data.description || "—"}</td></tr></table>
  <div class="sec">3. Évaluation initiale du risque</div>
  <table>
    <tr><th>Probabilité (P)</th><td>${data.initial_probability || "—"} — ${PROB_LABELS[data.initial_probability] || ""}</td><th>Gravité (G)</th><td>${data.initial_severity || "—"} — ${SEV_LABELS[data.initial_severity] || ""}</td></tr>
    <tr><th>RPN (P×G)</th><td colspan="3" class="${initR > 14 ? "hi" : "lo"}">${initR || "—"} — ${getRiskLevel(initR)}</td></tr>
  </table>
  <div class="sec">4. Mesures existantes</div>
  <table><tr><td>${data.existing_measures || "—"}</td></tr></table>
  <div class="sec">5. Actions proposées</div>
  <table><tr><td>${data.proposed_actions || data.action_recommendation || "—"}</td></tr></table>
  <div class="sec">6. Réévaluation du risque</div>
  <table>
    <tr><th>Probabilité (P)</th><td>${data.reass_probability || "—"}</td><th>Gravité (G)</th><td>${data.reass_severity || "—"}</td></tr>
    <tr><th>RPN (P×G)</th><td colspan="3" class="${reassR > 14 ? "hi" : "lo"}">${reassR || "—"} — ${getRiskLevel(reassR)}</td></tr>
  </table>
  <div class="sec">7. Responsable</div>
  <table>
    <tr><th style="width:35%">Responsable</th><td>${responsible}</td><th>Date de révision</th><td>${data.review_date ? new Date(data.review_date).toLocaleDateString("fr-FR") : date}</td></tr>
  </table>
  <div class="sigs">
    <div class="sig">Responsable Qualité</div>
    <div class="sig">Responsable Sécurité</div>
    <div class="sig">Direction</div>
  </div>
  <div class="footer">Tunisair — Direction Assurance Qualité et Sécurité — Document confidentiel</div>
</div></body></html>`;
}

export default function AdminIssues() {
  const { theme, t } = useApp();
  const { issues, users, fetchIssues } = useIssuesData();
  const {
    selectedIssue,
    setSelectedIssue,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    selectIssue,
  } = useIssueSelection();
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedIssue.id, ...formData }),
      });
      if (res.ok) {
        await fetchIssues();
        const d = await (await fetch("/api/issues")).json();
        const fresh = d.issues?.find((i) => i.id === selectedIssue.id);
        if (fresh) setSelectedIssue(fresh);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    const html = buildReportHtml(selectedIssue, formData, users);
    setDownloading(true);
    try {
      await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedIssue.id, report_html: html }),
      });
      const res = await fetch("/integrations/pdf-generation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: { html } }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-${selectedIssue.event_id || selectedIssue.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await fetchIssues();
      const d = await (await fetch("/api/issues")).json();
      const fresh = d.issues?.find((i) => i.id === selectedIssue.id);
      if (fresh) setSelectedIssue(fresh);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setDownloading(false);
    }
  };

  const getUrgencyColor = (u) =>
    ({
      low: "#6B7280",
      normal: "#2563EB",
      high: "#EA580C",
      critical: "#DC2626",
    })[u] || "#2563EB";
  const getStatusLabel = (s) => t(`admin.issues.status.${s}`) || s;

  const reportHtml = selectedIssue
    ? selectedIssue.report_html ||
      buildReportHtml(selectedIssue, formData, users)
    : null;

  return (
    <AppShell title={t("admin.issues.title")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <IssuesList
              issues={issues}
              selectedIssue={selectedIssue}
              onSelectIssue={selectIssue}
              getUrgencyColor={getUrgencyColor}
              getStatusLabel={getStatusLabel}
              t={t}
              isDark={isDark}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              bg={bg}
            />
          </div>
          <div className="lg:col-span-3">
            <IssueDetail
              selectedIssue={selectedIssue}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formData={formData}
              setFormData={setFormData}
              users={users}
              onUpdate={handleUpdate}
              onGenerateReport={handleGenerateReport}
              saving={saving}
              downloading={downloading}
              reportHtml={reportHtml}
              getStatusLabel={getStatusLabel}
              t={t}
              bg={bg}
              bgMuted={bgMuted}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
