"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { FileText, Search, Plus, Trash2, Eye } from "lucide-react";

export default function AdminAudits() {
  const { theme, t, currentUser } = useApp();
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  useEffect(() => {
    fetchAudits();
  }, []);
  useEffect(() => {
    filterAudits();
  }, [audits, searchTerm, statusFilter, typeFilter]);

  const fetchAudits = async () => {
    try {
      const res = await fetch("/api/audits");
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterAudits = () => {
    let filtered = [...audits];
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.audit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.department?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (statusFilter !== "all")
      filtered = filtered.filter((a) => a.status === statusFilter);
    if (typeFilter !== "all")
      filtered = filtered.filter((a) => a.type === typeFilter);
    setFilteredAudits(filtered);
  };

  const handleDelete = async (auditId) => {
    try {
      const res = await fetch(`/api/audits/${auditId}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchAudits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      draft: "#6B7280",
      notified: "#2563EB",
      in_progress: "#EA580C",
      completed: "#059669",
      closed: "#6B7280",
    };
    return map[status] || "#6B7280";
  };
  const getTypeColor = (type) => {
    const map = {
      planned: "#2563EB",
      unplanned: "#EA580C",
      external: "#7C3AED",
    };
    return map[type] || "#6B7280";
  };

  const stats = {
    total: audits.length,
    draft: audits.filter((a) => a.status === "draft").length,
    in_progress: audits.filter((a) => a.status === "in_progress").length,
    completed: audits.filter((a) => a.status === "completed").length,
  };

  const role = currentUser?.role || "auditee";
  const canCreate = ["admin", "audit_manager"].includes(role);

  const topbarActions = canCreate ? (
    <a
      href="/audits/create"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
      style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
    >
      <Plus size={16} />
      <span className="hidden sm:inline">{t("audit.create")}</span>
    </a>
  ) : null;

  return (
    <AppShell title={t("admin.audits.title")} actions={topbarActions}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: t("admin.audits.total"),
              value: stats.total,
              color: textPrimary,
            },
            {
              label: t("admin.audits.draft"),
              value: stats.draft,
              color: "#6B7280",
            },
            {
              label: t("admin.audits.inProgress"),
              value: stats.in_progress,
              color: "#EA580C",
            },
            {
              label: t("admin.audits.completed"),
              value: stats.completed,
              color: "#059669",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border p-4"
              style={{ backgroundColor: bg, borderColor }}
            >
              <div
                className="text-2xl font-semibold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-sm mt-1" style={{ color: textMuted }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="rounded-xl border p-4 mb-6"
          style={{ backgroundColor: bg, borderColor }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: textMuted }}
              />
              <input
                type="text"
                placeholder={t("admin.audits.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
                style={{ borderColor, backgroundColor: bg, color: textPrimary }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor, backgroundColor: bg, color: textPrimary }}
            >
              <option value="all">{t("admin.audits.allStatuses")}</option>
              <option value="draft">{t("audit.status.draft")}</option>
              <option value="notified">{t("audit.status.notified")}</option>
              <option value="in_progress">
                {t("audit.status.in_progress")}
              </option>
              <option value="completed">{t("audit.status.completed")}</option>
              <option value="closed">{t("audit.status.closed")}</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor, backgroundColor: bg, color: textPrimary }}
            >
              <option value="all">{t("admin.audits.allTypes")}</option>
              <option value="planned">{t("audit.planned")}</option>
              <option value="unplanned">{t("audit.unplanned")}</option>
              <option value="external">{t("audit.external")}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: bg, borderColor }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor, backgroundColor: bgMuted }}
                >
                  {[
                    t("audit.number"),
                    t("audit.title"),
                    t("common.type"),
                    t("common.status"),
                    t("common.department"),
                    t("common.auditor"),
                    t("audit.createdAt"),
                    t("common.actions"),
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-semibold ${i === 7 ? "text-right" : "text-left"}`}
                      style={{ color: textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FileText
                        size={32}
                        className="mx-auto mb-2"
                        style={{ color: textMuted, opacity: 0.3 }}
                      />
                      <p className="text-sm" style={{ color: textMuted }}>
                        {t("admin.audits.noFound")}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      className="border-b"
                      style={{ borderColor }}
                    >
                      <td className="px-6 py-4">
                        <span
                          className="text-sm font-medium"
                          style={{ color: textPrimary }}
                        >
                          {audit.audit_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: textPrimary }}
                          >
                            {audit.title}
                          </p>
                          {audit.description && (
                            <p
                              className="text-xs mt-0.5 truncate"
                              style={{ color: textMuted }}
                            >
                              {audit.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                            color: getTypeColor(audit.type),
                          }}
                        >
                          {t(`audit.${audit.type}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                            color: getStatusColor(audit.status),
                          }}
                        >
                          {t(`audit.status.${audit.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: textMuted }}>
                          {audit.department || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: textMuted }}>
                          {audit.auditor_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: textMuted }}>
                          {new Date(audit.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/audits/${audit.id}`}
                            className="p-2 rounded-lg border"
                            style={{ borderColor, color: textPrimary }}
                            title={t("common.view")}
                          >
                            <Eye size={15} />
                          </a>
                          <button
                            onClick={() => setShowDeleteConfirm(audit.id)}
                            className="p-2 rounded-lg border"
                            style={{ borderColor, color: "#DC2626" }}
                            title={t("common.delete")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <div
            className="relative rounded-xl border p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: bg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: textPrimary }}
            >
              {t("admin.audits.deleteTitle")}
            </h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>
              {t("admin.audits.deleteBody")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor, color: textPrimary }}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
