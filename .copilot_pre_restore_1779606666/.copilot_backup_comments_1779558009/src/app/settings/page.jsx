"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Moon, Sun, Globe, LogOut, Type, Pencil, Save, X } from "lucide-react";

export default function Settings() {
  const {
    theme,
    language,
    fontSize,
    currentUser,
    toggleTheme,
    toggleLanguage,
    changeFontSize,
    updateCurrentUser,
    logout,
    t,
  } = useApp();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    department: "",
    title: "",
  });

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const openEdit = () => {
    setProfileForm({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      department: currentUser?.department || "",
      title: currentUser?.title || "",
    });
    setEditingProfile(true);
  };

  const saveProfile = () => {
    updateCurrentUser(profileForm);
    setEditingProfile(false);
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const iStyle = { borderColor, backgroundColor: bg, color: textPrimary };

  const OptionBtn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 ${active ? "ring-2 ring-blue-600" : ""}`}
      style={{ borderColor }}
    >
      {children}
    </button>
  );

  return (
    <AppShell title={t("settings.title")}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: bg, borderColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: textPrimary }}
            >
              {t("settings.profile")}
            </h2>
            {!editingProfile ? (
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor, color: "#2563EB" }}
              >
                <Pencil size={13} /> {t("settings.editProfile")}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="p-1.5 rounded-lg border"
                  style={{ borderColor, color: textMuted }}
                >
                  <X size={14} />
                </button>
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  <Save size={13} /> {t("settings.saveProfile")}
                </button>
              </div>
            )}
          </div>

          {!editingProfile ? (
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold flex-shrink-0"
                style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
              >
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold" style={{ color: textPrimary }}>
                  {currentUser?.name}
                </p>
                <p className="text-sm" style={{ color: textMuted }}>
                  {currentUser?.email}
                </p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>
                  {currentUser?.title}
                  {currentUser?.title && currentUser?.department ? " — " : ""}
                  {currentUser?.department}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["name", "Nom complet"],
                ["email", "Email"],
                ["title", "Titre / Fonction"],
                ["department", "Département"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    {label}
                  </label>
                  <input
                    value={profileForm[key]}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className={inputCls}
                    style={iStyle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: bg, borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-5"
            style={{ color: textPrimary }}
          >
            {t("settings.appearance")}
          </h2>
          <div className="space-y-6">
            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: textPrimary }}
              >
                {t("settings.theme")}
              </label>
              <div className="flex gap-3">
                <OptionBtn
                  active={theme === "light"}
                  onClick={() => theme === "dark" && toggleTheme()}
                >
                  <Sun
                    size={20}
                    style={{ color: theme === "light" ? "#2563EB" : textMuted }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: theme === "light" ? "#2563EB" : textPrimary,
                    }}
                  >
                    {t("settings.light")}
                  </span>
                </OptionBtn>
                <OptionBtn
                  active={theme === "dark"}
                  onClick={() => theme === "light" && toggleTheme()}
                >
                  <Moon
                    size={20}
                    style={{ color: theme === "dark" ? "#2563EB" : textMuted }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: theme === "dark" ? "#2563EB" : textPrimary,
                    }}
                  >
                    {t("settings.dark")}
                  </span>
                </OptionBtn>
              </div>
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: textPrimary }}
              >
                {t("settings.language")}
              </label>
              <div className="flex gap-3">
                <OptionBtn
                  active={language === "en"}
                  onClick={() => language === "fr" && toggleLanguage()}
                >
                  <Globe
                    size={20}
                    style={{ color: language === "en" ? "#2563EB" : textMuted }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: language === "en" ? "#2563EB" : textPrimary,
                    }}
                  >
                    English
                  </span>
                </OptionBtn>
                <OptionBtn
                  active={language === "fr"}
                  onClick={() => language === "en" && toggleLanguage()}
                >
                  <Globe
                    size={20}
                    style={{ color: language === "fr" ? "#2563EB" : textMuted }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: language === "fr" ? "#2563EB" : textPrimary,
                    }}
                  >
                    Français
                  </span>
                </OptionBtn>
              </div>
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: textPrimary }}
              >
                <Type
                  size={14}
                  className="inline mr-1.5"
                  style={{ color: textMuted }}
                />
                {t("settings.fontSize")}
              </label>
              <div className="flex gap-3">
                {[
                  { id: "small", label: t("settings.small"), px: "11px" },
                  { id: "medium", label: t("settings.medium"), px: "14px" },
                  { id: "large", label: t("settings.large"), px: "18px" },
                ].map(({ id, label, px }) => (
                  <OptionBtn
                    key={id}
                    active={fontSize === id}
                    onClick={() => changeFontSize(id)}
                  >
                    <span
                      className="font-bold"
                      style={{
                        fontSize: px,
                        color: fontSize === id ? "#2563EB" : textMuted,
                      }}
                    >
                      Aa
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: fontSize === id ? "#2563EB" : textPrimary,
                      }}
                    >
                      {label}
                    </span>
                  </OptionBtn>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: bg, borderColor }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: textPrimary }}
          >
            {t("settings.account")}
          </h2>
          <button
            onClick={logout}
            className="w-full px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
            style={{ borderColor, color: "#DC2626" }}
          >
            <LogOut size={16} /> {t("common.logout")}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
