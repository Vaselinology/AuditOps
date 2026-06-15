"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Download,
  Eye,
} from "lucide-react";

export default function AuditDetail({ params }) {
  const { theme, t, currentUser } = useApp();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showFindingSheetDialog, setShowFindingSheetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [downloading, setDownloading] = useState(false);
  const [notifyFormData, setNotifyFormData] = useState({ 
    date: "", 
    location: "", 
    notes: "",
    type: "",
    duration: "",
    referentiels: "",
    auditPlan: [
      { time: "08h00", activity: "Réunion d'ouverture", auditor: "", observations: "" },
      { time: "09h00", activity: "", auditor: "", observations: "" },
      { time: "12h00", activity: "Pause déjeuner", auditor: "", observations: "" },
      { time: "13h00", activity: "", auditor: "", observations: "" },
      { time: "16h00", activity: "Réunion de clôture", auditor: "", observations: "" }
    ]
  });
  const [reportFormData, setReportFormData] = useState({ date: "", notes: "" });
  const [findingSheetFormData, setFindingSheetFormData] = useState({ date: "", notes: "" });
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewVersion, setPreviewVersion] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const role = currentUser?.role || "auditee";
  const canManage = ["admin", "audit_manager"].includes(role);

  useEffect(() => {
    fetchAudit();
  }, [params.id]);

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/audits/${params.id}`);
      if (res.ok) setAudit((await res.json()).audit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    try {
      const res = await fetch(`/api/audits/${params.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifyFormData),
      });
      if (res.ok) {
        setShowNotifyDialog(false);
        setPreviewHtml(null);
        fetchAudit();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateReport = async () => {
    try {
      const res = await fetch(`/api/audits/${params.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportFormData),
      });
      if (res.ok) {
        setShowReportDialog(false);
        setPreviewHtml(null);
        fetchAudit();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateFindingSheet = async () => {
    try {
      const res = await fetch(`/api/audits/${params.id}/finding-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(findingSheetFormData),
      });
      if (res.ok) {
        setShowFindingSheetDialog(false);
        setPreviewHtml(null);
        fetchAudit();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const previewNotification = async (version) => {
    try {
      const res = await fetch(`/api/audits/${params.id}/notify/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifyFormData),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data[version.toLowerCase()]);
        setPreviewVersion(version);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const previewReport = async (version) => {
    try {
      const res = await fetch(`/api/audits/${params.id}/reports/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportFormData),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data[version.toLowerCase()]);
        setPreviewVersion(version);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const previewFindingSheet = async (version) => {
    try {
      const res = await fetch(`/api/audits/${params.id}/finding-sheets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(findingSheetFormData),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data[version.toLowerCase()]);
        setPreviewVersion(version);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (status) => {
    try {
      await fetch(`/api/audits/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAudit();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPdf = async (html, filename) => {
    setDownloading(true);
    try {
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
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléchargement PDF");
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (s) =>
    ({
      draft: "#6B7280",
      notified: "#2563EB",
      in_progress: "#EA580C",
      completed: "#059669",
      closed: "#6B7280",
    })[s] || "#6B7280";
  const getSeverityColor = (s) =>
    ({ critical: "#DC2626", major: "#EA580C", minor: "#F59E0B" })[s] ||
    "#6B7280";

  const tabs = [
    { id: "overview", label: "Aperçu" },
    { id: "findings", label: "Constats" },
    { id: "notifications", label: "Notifications" },
    { id: "reports", label: "Rapports" },
    { id: "findingSheets", label: "Fiches de constat" },
  ];

  const DocCard = ({ htmlContent, version, filename, label }) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor, backgroundColor: bgMuted }}
      >
        <div>
          <span
            className="text-sm font-semibold"
            style={{ color: textPrimary }}
          >
            {label}
          </span>
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: version === "DGAC" ? "#EFF6FF" : "#F5F3FF",
              color: version === "DGAC" ? "#2563EB" : "#7C3AED",
            }}
          >
            {version}
          </span>
        </div>
        {htmlContent && (
          <button
            onClick={() => downloadPdf(htmlContent, filename)}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor, color: "#2563EB" }}
          >
            <Download size={12} /> {t("common.download")}
          </button>
        )}
      </div>
      {htmlContent ? (
        <iframe
          srcDoc={htmlContent}
          className="w-full"
          style={{ height: 500, border: "none", backgroundColor: "#fff" }}
          title={label}
        />
      ) : (
        <div className="p-10 text-center" style={{ color: textMuted }}>
          <Eye size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun document généré</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <AppShell title={t("audit.loading")}>
        <div
          className="flex items-center justify-center py-32"
          style={{ color: textMuted }}
        >
          <div className="text-center">
            <div
              className="w-10 h-10 border-4 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor, borderTopColor: "#2563EB" }}
            />
            <p className="text-sm">{t("audit.loading")}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!audit) {
    return (
      <AppShell title={t("audit.notFound")}>
        <div className="flex items-center justify-center py-32">
          <p className="text-sm" style={{ color: textMuted }}>
            {t("audit.notFound")}
          </p>
        </div>
      </AppShell>
    );
  }

  const topbarActions = canManage ? (
    <div className="flex items-center gap-2">
      {audit.status === "draft" && (
        <button
          onClick={() => setShowNotifyDialog(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
        >
          {t("audit.detail.sendNotification")}
        </button>
      )}
      {audit.status === "notified" && (
        <button
          onClick={() => updateStatus("in_progress")}
          className="px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor, color: textPrimary }}
        >
          {t("audit.detail.startAudit")}
        </button>
      )}
      {audit.status === "in_progress" && (
        <button
          onClick={() => updateStatus("completed")}
          className="px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor, color: textPrimary }}
        >
          {t("audit.detail.markCompleted")}
        </button>
      )}
    </div>
  ) : null;

  return (
    <AppShell
      title={`${audit.audit_number} — ${audit.title}`}
      actions={topbarActions}
    >
      {showNotifyDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowNotifyDialog(false)}
        >
          <div
            className="rounded-xl border p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: bg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: textPrimary }}
            >
              {t("audit.detail.notifyTitle")}
            </h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>
              {t("audit.detail.notifyBody")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNotifyDialog(false)}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor, color: textPrimary }}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={sendNotification}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                {t("audit.detail.sendNotification")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
          style={{ backgroundColor: bgMuted }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all"
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

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-xl border p-6"
                style={{ backgroundColor: bg, borderColor }}
              >
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: textPrimary }}
                >
                  {t("audit.detail.overview")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-xs font-medium block mb-1"
                      style={{ color: textMuted }}
                    >
                      {t("audit.title")}
                    </label>
                    <p className="text-sm" style={{ color: textPrimary }}>
                      {audit.title}
                    </p>
                  </div>
                  {audit.audit_subject && (
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        Objet
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.audit_subject}
                      </p>
                    </div>
                  )}
                  <div>
                    <label
                      className="text-xs font-medium block mb-1"
                      style={{ color: textMuted }}
                    >
                      {t("audit.description")}
                    </label>
                    <p className="text-sm" style={{ color: textPrimary }}>
                      {audit.description || t("audit.detail.noDescription")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        {t("audit.department")}
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.department || t("common.na")}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        {t("audit.auditor")}
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.auditor_name || t("audit.detail.notAssigned")}
                      </p>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        {t("audit.type")}
                      </label>
                      <span
                        className="inline-block text-xs px-3 py-1 rounded-full border"
                        style={{ borderColor, color: textMuted }}
                      >
                        {t(`audit.${audit.type}`)}
                      </span>
                    </div>
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        {t("common.status")}
                      </label>
                      <span
                        className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                          color: getStatusColor(audit.status),
                        }}
                      >
                        {t(`audit.status.${audit.status}`)}
                      </span>
                    </div>
                  </div>
                  {audit.adresse && (
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        Adresse
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.adresse}
                      </p>
                    </div>
                  )}
                  {audit.audit_place && (
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        Lieu
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.audit_place}
                      </p>
                    </div>
                  )}
                  {audit.audit_duration && (
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        Durée
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.audit_duration}
                      </p>
                    </div>
                  )}
                  {audit.referentials && (
                    <div>
                      <label
                        className="text-xs font-medium block mb-1"
                        style={{ color: textMuted }}
                      >
                        Référentiels
                      </label>
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {audit.referentials}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="rounded-xl border p-6"
                style={{ backgroundColor: bg, borderColor }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: textPrimary }}
                >
                  {t("audit.detail.timeline")}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: t("audit.createdAt"), value: audit.created_at },
                    {
                      label: t("audit.plannedDate"),
                      value: audit.planned_date,
                    },
                    { label: t("audit.startDate"), value: audit.start_date },
                  ]
                    .filter((i) => i.value)
                    .map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Clock
                          size={15}
                          style={{ color: textMuted }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p
                            className="text-xs font-medium"
                            style={{ color: textPrimary }}
                          >
                            {label}
                          </p>
                          <p className="text-xs" style={{ color: textMuted }}>
                            {new Date(value).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "findings" && (
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: bg, borderColor }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: textPrimary }}
              >
                {t("audit.detail.findings")}
              </h2>
              {canManage && (
                <button
                  onClick={() => {
                    const title = prompt("Finding title:");
                    if (title) {
                      const description = prompt("Description:");
                      const severity = prompt("Severity (critical/major/minor):", "minor");
                      if (description && severity) {
                        fetch("/api/findings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            audit_id: audit.id,
                            title,
                            description,
                            severity,
                          }),
                        }).then(() => fetchAudit());
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Add Finding
                </button>
              )}
            </div>
            {audit.findings?.length > 0 ? (
              <div className="space-y-3">
                {audit.findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-lg border"
                    style={{ borderColor }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          size={16}
                          style={{ color: getSeverityColor(f.severity) }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: textMuted }}
                        >
                          {f.finding_number}
                        </span>
                      </div>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#FEF2F2",
                          color: getSeverityColor(f.severity),
                        }}
                      >
                        {t(`finding.severity.${f.severity}`)}
                      </span>
                    </div>
                    <h4
                      className="font-semibold text-sm mb-1"
                      style={{ color: textPrimary }}
                    >
                      {f.title}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: textMuted }}>
                      {f.description}
                    </p>
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: textMuted }}
                    >
                      {f.deadline && (
                        <span>
                          {t("audit.detail.deadline")}:{" "}
                          {new Date(f.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {f.assigned_to_name && (
                        <span>
                          {t("audit.detail.assigned")}: {f.assigned_to_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm text-center py-8"
                style={{ color: textMuted }}
              >
                {t("audit.detail.noFindings")}
              </p>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: textMuted }}>
                Les notifications d'audit générées pour cet audit — deux versions
                : DGAC et PART.
              </p>
              {canManage && (
                <button
                  onClick={() => {
                    setNotifyFormData({
                      date: new Date().toISOString().split('T')[0],
                      location: audit.audit_place || "",
                      notes: "",
                      type: audit.type || "Planifié",
                      duration: "",
                      referentiels: "",
                      auditPlan: [
                        { time: "08h00", activity: "Réunion d'ouverture", auditor: audit.auditor_name || "", observations: "" },
                        { time: "09h00", activity: "", auditor: audit.auditor_name || "", observations: "" },
                        { time: "12h00", activity: "Pause déjeuner", auditor: "", observations: "" },
                        { time: "13h00", activity: "", auditor: audit.auditor_name || "", observations: "" },
                        { time: "16h00", activity: "Réunion de clôture", auditor: audit.auditor_name || "", observations: "" }
                      ]
                    });
                    setShowNotifyDialog(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate Notifications
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {["DGAC", "PART"].map((v) => {
                const doc = (audit.notifications || []).find(
                  (n) => n.version === v,
                );
                return (
                  <DocCard
                    key={v}
                    htmlContent={doc?.html_content}
                    version={v}
                    filename={`${audit.audit_number}-notification-${v}.pdf`}
                    label={`Notification d'audit — ${v}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: textMuted }}>
                Les rapports d'audit — deux versions : DGAC et PART.
              </p>
              {canManage && (
                <button
                  onClick={() => {
                    setReportFormData({
                      date: new Date().toISOString().split('T')[0],
                      notes: "",
                      auditPlan: {
                        auditors: [""],
                        auditees: [""],
                        leadAuditors: [""],
                        representatives: [""]
                      },
                      references: "",
                      distribution: [],
                      checkPoints: [
                        { verified: "", remarks: "" }
                      ],
                      strengthPoints: "",
                      weakness: "",
                      auditResults: [
                        { item: "", defectDescription: "", classification: "minor", deadline: "" }
                      ],
                      signatures: [
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" }
                      ]
                    });
                    setShowReportDialog(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate Reports
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {["DGAC", "PART"].map((v) => {
                const doc = (audit.reports || []).find((r) => r.version === v);
                return (
                  <DocCard
                    key={v}
                    htmlContent={doc?.html_content}
                    version={v}
                    filename={`${audit.audit_number}-rapport-${v}.pdf`}
                    label={`Rapport d'audit — ${v}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "findingSheets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: textMuted }}>
                Les fiches de constat — deux versions : DGAC et PART.
              </p>
              {canManage && (
                <button
                  onClick={() => {
                    setFindingSheetFormData({
                      date: new Date().toISOString().split('T')[0],
                      notes: "",
                      referenceDocuments: "",
                      subject: "",
                      address: "",
                      defects: [
                        { description: "", classification: "minor", deadline: "" }
                      ],
                      rootCause: "",
                      curativeActions: "",
                      curativeActionDates: "",
                      actionPlan: "",
                      actionPlanDate: "",
                      signatures: [
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" },
                        { name: "", date: "", function: "" }
                      ]
                    });
                    setShowFindingSheetDialog(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate Finding Sheets
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {["DGAC", "PART"].map((v) => {
                const doc = (audit.finding_sheets || []).find(
                  (s) => s.version === v,
                );
                return (
                  <DocCard
                    key={v}
                    htmlContent={doc?.html_content}
                    version={v}
                    filename={`${audit.audit_number}-fiche-${v}.pdf`}
                    label={`Fiche de constat — ${v}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notification Generation Dialog */}
      {showNotifyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowNotifyDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Notifications</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date de notification</label>
                    <input
                      type="date"
                      value={notifyFormData.date}
                      onChange={(e) => setNotifyFormData({ ...notifyFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={notifyFormData.location}
                      onChange={(e) => setNotifyFormData({ ...notifyFormData, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Audit location"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type d'audit</label>
                    <input
                      type="text"
                      value={notifyFormData.type}
                      onChange={(e) => setNotifyFormData({ ...notifyFormData, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Planifié"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Durée de l'audit</label>
                    <input
                      type="text"
                      value={notifyFormData.duration}
                      onChange={(e) => setNotifyFormData({ ...notifyFormData, duration: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Duration"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Référentiels appliqués</label>
                  <input
                    type="text"
                    value={notifyFormData.referentiels}
                    onChange={(e) => setNotifyFormData({ ...notifyFormData, referentiels: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Référentiels"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={notifyFormData.notes}
                    onChange={(e) => setNotifyFormData({ ...notifyFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan d'Audit</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Heure</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Activité / Processus audité</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Auditeur</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Observations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifyFormData.auditPlan.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.time}
                                onChange={(e) => {
                                  const newPlan = [...notifyFormData.auditPlan];
                                  newPlan[index].time = e.target.value;
                                  setNotifyFormData({ ...notifyFormData, auditPlan: newPlan });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.activity}
                                onChange={(e) => {
                                  const newPlan = [...notifyFormData.auditPlan];
                                  newPlan[index].activity = e.target.value;
                                  setNotifyFormData({ ...notifyFormData, auditPlan: newPlan });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.auditor}
                                onChange={(e) => {
                                  const newPlan = [...notifyFormData.auditPlan];
                                  newPlan[index].auditor = e.target.value;
                                  setNotifyFormData({ ...notifyFormData, auditPlan: newPlan });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.observations}
                                onChange={(e) => {
                                  const newPlan = [...notifyFormData.auditPlan];
                                  newPlan[index].observations = e.target.value;
                                  setNotifyFormData({ ...notifyFormData, auditPlan: newPlan });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => previewNotification('DGAC')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview DGAC
                </button>
                <button
                  onClick={() => previewNotification('PART')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview PART
                </button>
              </div>
              {previewHtml && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preview: {previewVersion}</span>
                    <button
                      onClick={() => setPreviewHtml(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowNotifyDialog(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowReportDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Reports</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={reportFormData.date}
                    onChange={(e) => setReportFormData({ ...reportFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan d'audit</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Auditeur(s)</label>
                      {reportFormData.auditPlan.auditors.map((auditor, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={auditor}
                            onChange={(e) => {
                              const newAuditPlan = { ...reportFormData.auditPlan };
                              newAuditPlan.auditors[index] = e.target.value;
                              setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            placeholder="Nom de l'auditeur"
                          />
                          {reportFormData.auditPlan.auditors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newAuditPlan = { ...reportFormData.auditPlan };
                                newAuditPlan.auditors = newAuditPlan.auditors.filter((_, i) => i !== index);
                                setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                              }}
                              className="text-red-600 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newAuditPlan = { ...reportFormData.auditPlan };
                          newAuditPlan.auditors = [...newAuditPlan.auditors, ""];
                          setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                        }}
                        className="text-sm text-blue-600"
                      >
                        + Ajouter auditeur
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Audité(s)</label>
                      {reportFormData.auditPlan.auditees.map((auditee, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={auditee}
                            onChange={(e) => {
                              const newAuditPlan = { ...reportFormData.auditPlan };
                              newAuditPlan.auditees[index] = e.target.value;
                              setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            placeholder="Nom de l'audité"
                          />
                          {reportFormData.auditPlan.auditees.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newAuditPlan = { ...reportFormData.auditPlan };
                                newAuditPlan.auditees = newAuditPlan.auditees.filter((_, i) => i !== index);
                                setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                              }}
                              className="text-red-600 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newAuditPlan = { ...reportFormData.auditPlan };
                          newAuditPlan.auditees = [...newAuditPlan.auditees, ""];
                          setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                        }}
                        className="text-sm text-blue-600"
                      >
                        + Ajouter audité
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Auditeur(s) principal(aux)</label>
                      {reportFormData.auditPlan.leadAuditors.map((leadAuditor, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={leadAuditor}
                            onChange={(e) => {
                              const newAuditPlan = { ...reportFormData.auditPlan };
                              newAuditPlan.leadAuditors[index] = e.target.value;
                              setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            placeholder="Nom de l'auditeur principal"
                          />
                          {reportFormData.auditPlan.leadAuditors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newAuditPlan = { ...reportFormData.auditPlan };
                                newAuditPlan.leadAuditors = newAuditPlan.leadAuditors.filter((_, i) => i !== index);
                                setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                              }}
                              className="text-red-600 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newAuditPlan = { ...reportFormData.auditPlan };
                          newAuditPlan.leadAuditors = [...newAuditPlan.leadAuditors, ""];
                          setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                        }}
                        className="text-sm text-blue-600"
                      >
                        + Ajouter auditeur principal
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Représentant(s) de l'audité</label>
                      {reportFormData.auditPlan.representatives.map((representative, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={representative}
                            onChange={(e) => {
                              const newAuditPlan = { ...reportFormData.auditPlan };
                              newAuditPlan.representatives[index] = e.target.value;
                              setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            placeholder="Nom du représentant"
                          />
                          {reportFormData.auditPlan.representatives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newAuditPlan = { ...reportFormData.auditPlan };
                                newAuditPlan.representatives = newAuditPlan.representatives.filter((_, i) => i !== index);
                                setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                              }}
                              className="text-red-600 text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newAuditPlan = { ...reportFormData.auditPlan };
                          newAuditPlan.representatives = [...newAuditPlan.representatives, ""];
                          setReportFormData({ ...reportFormData, auditPlan: newAuditPlan });
                        }}
                        className="text-sm text-blue-600"
                      >
                        + Ajouter représentant
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Références</label>
                  <textarea
                    value={reportFormData.references}
                    onChange={(e) => setReportFormData({ ...reportFormData, references: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Références avec date d'audit..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distribution</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["DGTT", "DAQSE", "DM", "DRE", "MCC", "DAA", "DC", "DFT", "DLA", "DVSC", "DCP", "DIT", "DLT"].map((dept) => (
                      <label key={dept} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={reportFormData.distribution.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReportFormData({ ...reportFormData, distribution: [...reportFormData.distribution, dept] });
                            } else {
                              setReportFormData({ ...reportFormData, distribution: reportFormData.distribution.filter(d => d !== dept) });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points de contrôle</label>
                  {reportFormData.checkPoints.map((cp, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Point #{index + 1}</span>
                        {reportFormData.checkPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCheckPoints = reportFormData.checkPoints.filter((_, i) => i !== index);
                              setReportFormData({ ...reportFormData, checkPoints: newCheckPoints });
                            }}
                            className="text-red-600 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cp.verified}
                          onChange={(e) => {
                            const newCheckPoints = [...reportFormData.checkPoints];
                            newCheckPoints[index].verified = e.target.value;
                            setReportFormData({ ...reportFormData, checkPoints: newCheckPoints });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Points vérifiés"
                        />
                        <input
                          type="text"
                          value={cp.remarks}
                          onChange={(e) => {
                            const newCheckPoints = [...reportFormData.checkPoints];
                            newCheckPoints[index].remarks = e.target.value;
                            setReportFormData({ ...reportFormData, checkPoints: newCheckPoints });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Remarques"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReportFormData({
                      ...reportFormData,
                      checkPoints: [...reportFormData.checkPoints, { verified: "", remarks: "" }]
                    })}
                    className="text-sm text-blue-600"
                  >
                    + Ajouter point de contrôle
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Points forts</label>
                  <textarea
                    value={reportFormData.strengthPoints}
                    onChange={(e) => setReportFormData({ ...reportFormData, strengthPoints: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Points forts identifiés..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Faiblesses</label>
                  <textarea
                    value={reportFormData.weakness}
                    onChange={(e) => setReportFormData({ ...reportFormData, weakness: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Faiblesses identifiées..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Résultats de l'audit</label>
                  {reportFormData.auditResults.map((ar, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Résultat #{index + 1}</span>
                        {reportFormData.auditResults.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newAuditResults = reportFormData.auditResults.filter((_, i) => i !== index);
                              setReportFormData({ ...reportFormData, auditResults: newAuditResults });
                            }}
                            className="text-red-600 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={ar.item}
                        onChange={(e) => {
                          const newAuditResults = [...reportFormData.auditResults];
                          newAuditResults[index].item = e.target.value;
                          setReportFormData({ ...reportFormData, auditResults: newAuditResults });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Élément"
                      />
                      <textarea
                        value={ar.defectDescription}
                        onChange={(e) => {
                          const newAuditResults = [...reportFormData.auditResults];
                          newAuditResults[index].defectDescription = e.target.value;
                          setReportFormData({ ...reportFormData, auditResults: newAuditResults });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows={2}
                        placeholder="Description du défaut"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={ar.classification}
                          onChange={(e) => {
                            const newAuditResults = [...reportFormData.auditResults];
                            newAuditResults[index].classification = e.target.value;
                            setReportFormData({ ...reportFormData, auditResults: newAuditResults });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="minor">Mineur</option>
                          <option value="major">Majeur</option>
                        </select>
                        <input
                          type="date"
                          value={ar.deadline}
                          onChange={(e) => {
                            const newAuditResults = [...reportFormData.auditResults];
                            newAuditResults[index].deadline = e.target.value;
                            setReportFormData({ ...reportFormData, auditResults: newAuditResults });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReportFormData({
                      ...reportFormData,
                      auditResults: [...reportFormData.auditResults, { item: "", defectDescription: "", classification: "minor", deadline: "" }]
                    })}
                    className="text-sm text-blue-600"
                  >
                    + Ajouter résultat
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Signatures</label>
                  <div className="grid grid-cols-2 gap-4">
                    {reportFormData.signatures.map((sig, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <span className="text-sm font-medium">Signature #{index + 1}</span>
                        <input
                          type="text"
                          value={sig.name}
                          onChange={(e) => {
                            const newSignatures = [...reportFormData.signatures];
                            newSignatures[index].name = e.target.value;
                            setReportFormData({ ...reportFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Nom"
                        />
                        <input
                          type="date"
                          value={sig.date}
                          onChange={(e) => {
                            const newSignatures = [...reportFormData.signatures];
                            newSignatures[index].date = e.target.value;
                            setReportFormData({ ...reportFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={sig.function}
                          onChange={(e) => {
                            const newSignatures = [...reportFormData.signatures];
                            newSignatures[index].function = e.target.value;
                            setReportFormData({ ...reportFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Fonction"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={reportFormData.notes}
                    onChange={(e) => setReportFormData({ ...reportFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => previewReport('DGAC')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview DGAC
                </button>
                <button
                  onClick={() => previewReport('PART')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview PART
                </button>
              </div>
              {previewHtml && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preview: {previewVersion}</span>
                    <button
                      onClick={() => setPreviewHtml(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
                >
                  Cancel
                </button>
                <button
                  onClick={generateReport}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finding Sheet Generation Dialog */}
      {showFindingSheetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowFindingSheetDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Finding Sheets</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={findingSheetFormData.date}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documents de référence</label>
                  <textarea
                    value={findingSheetFormData.referenceDocuments}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, referenceDocuments: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Liste des documents de référence..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sujet</label>
                  <input
                    type="text"
                    value={findingSheetFormData.subject}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Sujet de la fiche de constat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={findingSheetFormData.address}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Adresse du site audité"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Défauts</label>
                  {findingSheetFormData.defects.map((defect, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Défaut #{index + 1}</span>
                        {findingSheetFormData.defects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newDefects = findingSheetFormData.defects.filter((_, i) => i !== index);
                              setFindingSheetFormData({ ...findingSheetFormData, defects: newDefects });
                            }}
                            className="text-red-600 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <textarea
                        value={defect.description}
                        onChange={(e) => {
                          const newDefects = [...findingSheetFormData.defects];
                          newDefects[index].description = e.target.value;
                          setFindingSheetFormData({ ...findingSheetFormData, defects: newDefects });
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                        placeholder="Description du défaut"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={defect.classification}
                          onChange={(e) => {
                            const newDefects = [...findingSheetFormData.defects];
                            newDefects[index].classification = e.target.value;
                            setFindingSheetFormData({ ...findingSheetFormData, defects: newDefects });
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="minor">Mineur</option>
                          <option value="major">Majeur</option>
                        </select>
                        <input
                          type="date"
                          value={defect.deadline}
                          onChange={(e) => {
                            const newDefects = [...findingSheetFormData.defects];
                            newDefects[index].deadline = e.target.value;
                            setFindingSheetFormData({ ...findingSheetFormData, defects: newDefects });
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFindingSheetFormData({
                      ...findingSheetFormData,
                      defects: [...findingSheetFormData.defects, { description: "", classification: "minor", deadline: "" }]
                    })}
                    className="text-sm text-blue-600"
                  >
                    + Ajouter un défaut
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cause racine du défaut</label>
                  <textarea
                    value={findingSheetFormData.rootCause}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, rootCause: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Analyse de la cause racine..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Actions curatives</label>
                  <textarea
                    value={findingSheetFormData.curativeActions}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, curativeActions: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Actions curatives proposées..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date des actions curatives</label>
                  <input
                    type="date"
                    value={findingSheetFormData.curativeActionDates}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, curativeActionDates: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plan d'action</label>
                  <textarea
                    value={findingSheetFormData.actionPlan}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, actionPlan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Plan d'action détaillé..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date du plan d'action</label>
                  <input
                    type="date"
                    value={findingSheetFormData.actionPlanDate}
                    onChange={(e) => setFindingSheetFormData({ ...findingSheetFormData, actionPlanDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Signatures</label>
                  <div className="grid grid-cols-2 gap-4">
                    {findingSheetFormData.signatures.map((sig, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <span className="text-sm font-medium">Signature #{index + 1}</span>
                        <input
                          type="text"
                          value={sig.name}
                          onChange={(e) => {
                            const newSignatures = [...findingSheetFormData.signatures];
                            newSignatures[index].name = e.target.value;
                            setFindingSheetFormData({ ...findingSheetFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Nom"
                        />
                        <input
                          type="date"
                          value={sig.date}
                          onChange={(e) => {
                            const newSignatures = [...findingSheetFormData.signatures];
                            newSignatures[index].date = e.target.value;
                            setFindingSheetFormData({ ...findingSheetFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={sig.function}
                          onChange={(e) => {
                            const newSignatures = [...findingSheetFormData.signatures];
                            newSignatures[index].function = e.target.value;
                            setFindingSheetFormData({ ...findingSheetFormData, signatures: newSignatures });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Fonction"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => previewFindingSheet('DGAC')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview DGAC
                </button>
                <button
                  onClick={() => previewFindingSheet('PART')}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Preview PART
                </button>
              </div>
              {previewHtml && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preview: {previewVersion}</span>
                    <button
                      onClick={() => setPreviewHtml(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowFindingSheetDialog(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
                >
                  Cancel
                </button>
                <button
                  onClick={generateFindingSheet}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
