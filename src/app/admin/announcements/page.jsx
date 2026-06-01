"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Plus, Trash2 } from "lucide-react";

export default function AdminAnnouncements() {
  const { theme, t, currentUser } = useApp();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    expires_at: "",
  });

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, published_by: currentUser?.id }),
      });
      if (res.ok) {
        setFormData({
          title: "",
          content: "",
          priority: "normal",
          expires_at: "",
        });
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("common.delete") + "?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (p) =>
    ({ normal: "#2563EB", high: "#EA580C", urgent: "#DC2626" })[p] || "#2563EB";
  const getPriorityLabel = (p) =>
    ({
      normal: t("admin.announcements.normal"),
      high: t("admin.announcements.high"),
      urgent: t("admin.announcements.urgent"),
    })[p] || p;

  const topbarActions = (
    <button
      onClick={() => setShowForm(!showForm)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
      style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
    >
      <Plus size={16} />
      <span className="hidden sm:inline">{t("admin.announcements.new")}</span>
    </button>
  );

  return (
    <AppShell title={t("admin.announcements.title")} actions={topbarActions}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create form */}
        {showForm && (
          <div
            className="mb-6 rounded-xl border p-6"
            style={{ backgroundColor: bg, borderColor }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: textPrimary }}
            >
              {t("admin.announcements.create")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  {t("audit.title")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor,
                    backgroundColor: bg,
                    color: textPrimary,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: textPrimary }}
                >
                  {t("admin.announcements.content")}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor,
                    backgroundColor: bg,
                    color: textPrimary,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    {t("admin.announcements.priority")}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor,
                      backgroundColor: bg,
                      color: textPrimary,
                    }}
                  >
                    <option value="normal">
                      {t("admin.announcements.normal")}
                    </option>
                    <option value="high">
                      {t("admin.announcements.high")}
                    </option>
                    <option value="urgent">
                      {t("admin.announcements.urgent")}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: textPrimary }}
                  >
                    {t("admin.announcements.expires")}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor,
                      backgroundColor: bg,
                      color: textPrimary,
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor, color: textPrimary }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  {t("admin.announcements.publish")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements list */}
        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: bg, borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: textPrimary }}
          >
            {t("admin.announcements.all")}
          </h2>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-lg border"
                style={{ borderColor }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
                          color: getPriorityColor(ann.priority),
                        }}
                      >
                        {getPriorityLabel(ann.priority)}
                      </span>
                      {ann.expires_at && (
                        <span className="text-xs" style={{ color: textMuted }}>
                          {t("admin.announcements.expires2")}:{" "}
                          {new Date(ann.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: textPrimary }}
                    >
                      {ann.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: textMuted }}>
                      {ann.content}
                    </p>
                    <p className="text-xs mt-2" style={{ color: textMuted }}>
                      {t("admin.announcements.publishedBy")}{" "}
                      {ann.published_by_name ||
                        t("admin.announcements.unknown")}{" "}
                      – {new Date(ann.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ color: "#DC2626" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
