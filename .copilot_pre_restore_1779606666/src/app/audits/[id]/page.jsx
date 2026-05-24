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
  const [activeTab, setActiveTab] = useState("overview");
  const [downloading, setDownloading] = useState(false);

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
      });
      if (res.ok) {
        setShowNotifyDialog(false);
        fetchAudit();
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
    { id: "overview", label: t("audit.detail.overview") },
    { id: "findings", label: t("audit.detail.findings") },
    { id: "notifications", label: t("audit.detail.notifications") },
    { id: "reports", label: t("audit.detail.reports") },
    { id: "findingSheets", label: t("audit.detail.findingSheets") },
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
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: textPrimary }}
            >
              {t("audit.detail.findings")}
            </h2>
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
            <p className="text-sm" style={{ color: textMuted }}>
              Les notifications d'audit générées pour cet audit — deux versions
              : DGAC et PART.
            </p>
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
            <p className="text-sm" style={{ color: textMuted }}>
              Les rapports d'audit — deux versions : DGAC et PART.
            </p>
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
            <p className="text-sm" style={{ color: textMuted }}>
              Les fiches de constat — deux versions : DGAC et PART.
            </p>
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
    </AppShell>
  );
}
