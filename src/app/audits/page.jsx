"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Search } from "lucide-react";

export default function AuditsList() {
  const { theme, t } = useApp();
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  useEffect(() => {fetchAudits()}, []);
  useEffect(() => {filterAudits()}, [audits, searchTerm, statusFilter, typeFilter]);

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

  return (
    <AppShell title={t("nav.audits")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div
          className="mb-6 rounded-xl border p-4"
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("admin.audits.search")}
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
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm" style={{ color: textMuted }}>
              {t("common.showing")} {filteredAudits.length} {t("common.of")}{" "}
              {audits.length}
            </p>
            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="text-sm font-medium"
                style={{ color: "#2563EB" }}
              >
                {t("common.clearFilters")}
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAudits.map((audit) => (
            <a
              key={audit.id}
              href={`/audits/${audit.id}`}
              className="block rounded-xl border p-6 hover:border-gray-300 transition-colors"
              style={{ backgroundColor: bg, borderColor }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{ borderColor, color: textMuted }}
                >
                  {audit.audit_number}
                </span>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                    color: getStatusColor(audit.status),
                  }}
                >
                  {t(`audit.status.${audit.status}`)}
                </span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: textPrimary }}>
                {audit.title}
              </h3>
              <p
                className="text-sm mb-4 line-clamp-2"
                style={{ color: textMuted }}
              >
                {audit.description || t("audit.detail.noDescription")}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: textMuted }}>
                    {t("common.department")}
                  </span>
                  <span style={{ color: textPrimary }}>
                    {audit.department || t("common.na")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: textMuted }}>{t("common.type")}</span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                      color: textPrimary,
                    }}
                  >
                    {t(`audit.${audit.type}`)}
                  </span>
                </div>
                {audit.auditor_name && (
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: textMuted }}>
                      {t("common.auditor")}
                    </span>
                    <span style={{ color: textPrimary }}>
                      {audit.auditor_name}
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {filteredAudits.length === 0 && (
          <div className="text-center py-16" style={{ color: textMuted }}>
            <p className="text-sm">{t("audit.noFound")}</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
