"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import DashboardStats from "@/components/DashboardStats";
import { Calendar, FileText, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { theme, t, currentUser } = useApp();
  const [audits, setAudits] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const auditsRes = await fetch("/api/audits");
      if (auditsRes.ok) {
        const data = await auditsRes.json();
        setAudits(data.audits.slice(0, 5));
      }

      const announcementsRes = await fetch("/api/announcements");
      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data.announcements.slice(0, 3));
      }

      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const calendarRes = await fetch(
        `/api/calendar?start_date=${today}&end_date=${futureDate.toISOString().split("T")[0]}`,
      );
      if (calendarRes.ok) {
        const data = await calendarRes.json();
        setUpcomingEvents(data.events.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "#6B7280",
      notified: "#2563EB",
      in_progress: "#EA580C",
      completed: "#059669",
      closed: "#6B7280",
    };
    return colors[status] || colors.draft;
  };

  return (
    <AppShell title={t("dashboard.title")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <div className="mb-6 space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor:
                    ann.priority === "urgent"
                      ? isDark
                        ? "#7F1D1D"
                        : "#FEF2F2"
                      : bg,
                  borderColor:
                    ann.priority === "urgent" ? "#DC2626" : borderColor,
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    style={{
                      color: ann.priority === "urgent" ? "#DC2626" : "#2563EB",
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: textPrimary }}
                    >
                      {ann.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: textMuted }}>
                      {ann.content}
                    </p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full border flex-shrink-0"
                    style={{ borderColor, color: textMuted }}
                  >
                    {new Date(ann.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Audits */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: bg, borderColor }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: textPrimary }}
                >
                  {t("dashboard.activeAudits")}
                </h2>
                <a
                  href="/audits"
                  className="text-sm font-medium"
                  style={{ color: "#2563EB" }}
                >
                  {t("dashboard.viewAll")}
                </a>
              </div>

              <div className="space-y-3">
                {audits.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: textMuted }}
                  >
                    <FileText size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("dashboard.noAudits")}</p>
                  </div>
                ) : (
                  audits.map((audit) => (
                    <a
                      key={audit.id}
                      href={`/audits/${audit.id}`}
                      className="block p-4 rounded-lg border hover:border-gray-300 transition-colors"
                      style={{ borderColor }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                          <h3
                            className="font-semibold text-sm mt-2"
                            style={{ color: textPrimary }}
                          >
                            {audit.title}
                          </h3>
                          <p
                            className="text-xs mt-1 line-clamp-1"
                            style={{ color: textMuted }}
                          >
                            {audit.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {audit.department && (
                              <span
                                className="text-xs"
                                style={{ color: textMuted }}
                              >
                                {audit.department}
                              </span>
                            )}
                            {audit.auditor_name && (
                              <span
                                className="text-xs"
                                style={{ color: textMuted }}
                              >
                                {t("audit.auditor")}: {audit.auditor_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: bg, borderColor }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} style={{ color: "#2563EB" }} />
                <h2
                  className="text-lg font-semibold"
                  style={{ color: textPrimary }}
                >
                  {t("dashboard.upcomingDeadlines")}
                </h2>
              </div>

              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: textMuted }}
                  >
                    <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("dashboard.noDeadlines")}</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border"
                      style={{ borderColor }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                          }}
                        >
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "#2563EB" }}
                          >
                            {new Date(event.event_date).getDate()}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: textMuted }}
                          >
                            {new Date(event.event_date).toLocaleDateString(
                              "en",
                              { month: "short" },
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium"
                            style={{ color: textPrimary }}
                          >
                            {event.title}
                          </p>
                          <p
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: textMuted }}
                          >
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent announcements summary */}
            {announcements.length === 0 && (
              <div
                className="rounded-xl border p-6 mt-6"
                style={{ backgroundColor: bg, borderColor }}
              >
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: textPrimary }}
                >
                  {t("dashboard.recentAnnouncements")}
                </h2>
                <p
                  className="text-sm text-center py-4"
                  style={{ color: textMuted }}
                >
                  {t("dashboard.noAnnouncements")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
