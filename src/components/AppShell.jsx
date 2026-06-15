"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Bell,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  CalendarRange,
  Megaphone,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Users,
  LogOut,
} from "lucide-react";

export default function AppShell({ title, actions, children }) {
  const { theme, t, currentUser, authChecked, logout } = useApp();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const sidebarBg = isDark ? "#0F172A" : "#F8FAFC";
  const sidebarBorderColor = isDark ? "#1E293B" : "#E2E8F0";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      if (localStorage.getItem("sidebarCollapsed") === "true")
        setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/notifications?user_id=${currentUser.id}`)
        .then((r) => (r.ok ? r.json() : { notifications: [] }))
        .then((d) => setNotifications((d.notifications || []).slice(0, 10)))
        .catch(() => {});
    }
  }, [currentUser]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined")
      localStorage.setItem("sidebarCollapsed", String(next));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const role = currentUser?.role || "auditee";

  const mainNav = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/audits", label: t("nav.audits"), icon: ClipboardList },
    { href: "/calendar", label: t("nav.calendar"), icon: Calendar },
    { href: "/issue/report", label: t("issue.report"), icon: AlertTriangle },
  ];

  const adminNav = [
    {
      href: "/admin/audits",
      label: t("nav.manageAudits"),
      icon: ClipboardList,
      roles: ["admin", "audit_manager"],
    },
    {
      href: "/yearly-plan",
      label: t("nav.yearlyPlan"),
      icon: CalendarRange,
      roles: ["admin", "audit_manager"],
    },
    {
      href: "/admin/issues",
      label: t("nav.reviewIssues"),
      icon: AlertCircle,
      roles: ["admin", "quality_safety_manager"],
    },
    {
      href: "/admin/announcements",
      label: t("nav.manageAnnouncements"),
      icon: Megaphone,
      roles: ["admin"],
    },
    {
      href: "/admin/users",
      label: t("nav.manageUsers"),
      icon: Users,
      roles: ["admin"],
    },
  ].filter((item) => item.roles.includes(role));

  const isActive = (href) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  const NavLink = ({ href, label, icon: Icon, onNavigate }) => {
    const active = isActive(href);
    return (
      <a
        href={href}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className="flex items-center rounded-lg transition-colors"
        style={{
          gap: collapsed ? 0 : 12,
          padding: collapsed ? "8px" : "8px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundColor: active
            ? isDark
              ? "#1E3A5F"
              : "#EFF6FF"
            : "transparent",
          color: active ? "#2563EB" : textMuted,
        }}
      >
        <Icon
          size={17}
          strokeWidth={active ? 2.2 : 1.8}
          style={{ flexShrink: 0 }}
        />
        {!collapsed && (
          <span className="flex-1 text-sm font-medium truncate">{label}</span>
        )}
        {!collapsed && active && (
          <ChevronRight size={13} style={{ color: "#2563EB", flexShrink: 0 }} />
        )}
      </a>
    );
  };

  const SidebarInner = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b flex-shrink-0"
        style={{
          borderColor: sidebarBorderColor,
          height: 64,
          padding: collapsed ? "0 8px" : "0 16px",
          gap: 8,
        }}
      >
        {!currentPath?.startsWith("/audits") && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
          >
            AO
          </div>
        )}
        {!collapsed && (
          <span
            className="font-semibold text-sm flex-1 truncate"
            style={{ color: textPrimary }}
          >
            {t("app.name")}
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center flex-shrink-0"
          style={{
            color: textMuted,
            backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto space-y-1"
        style={{ padding: collapsed ? "16px 6px" : "16px 12px" }}
      >
        {mainNav.map((item) => (
          <NavLink key={item.href} {...item} onNavigate={onNavigate} />
        ))}

        {adminNav.length > 0 && (
          <div className="pt-4">
            {!collapsed && (
              <p
                className="pb-2 text-xs font-semibold uppercase tracking-wider px-3"
                style={{ color: textMuted, opacity: 0.55 }}
              >
                {t("nav.adminPanel")}
              </p>
            )}
            {collapsed && (
              <div
                className="border-t my-2"
                style={{ borderColor: sidebarBorderColor }}
              />
            )}
            <div className="space-y-1">
              {adminNav.map((item) => (
                <NavLink key={item.href} {...item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div
        className="flex-shrink-0 border-t space-y-1"
        style={{
          borderColor: sidebarBorderColor,
          padding: collapsed ? "12px 6px 16px" : "12px 12px 16px",
        }}
      >
        <NavLink
          href="/settings"
          label={t("nav.settings")}
          icon={Settings}
          onNavigate={onNavigate}
        />
        {currentUser && !collapsed && (
          <div>
            <div
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: isDark ? "#1E293B" : "#EFF6FF" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                {currentUser.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: textPrimary }}
                >
                  {currentUser.name}
                </p>
                <p
                  className="text-xs truncate capitalize"
                  style={{ color: textMuted }}
                >
                  {currentUser.role?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 mt-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ color: "#DC2626" }}
            >
              <LogOut size={13} />
              {t("common.logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-4"
            style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
          >
            AO
          </div>
          <div
            className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <style
            jsx
            global
          >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div
      className="min-h-screen font-inter flex"
      style={{ backgroundColor: bgMuted }}
    >
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen border-r overflow-hidden transition-all duration-200"
        style={{
          width: collapsed ? 64 : 240,
          backgroundColor: sidebarBg,
          borderColor: sidebarBorderColor,
        }}
      >
        <SidebarInner onNavigate={undefined} />
      </aside>

      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col border-r overflow-hidden"
            style={{
              width: 240,
              backgroundColor: sidebarBg,
              borderColor: sidebarBorderColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarInner onNavigate={() => setShowMobileSidebar(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header
          className="sticky top-0 z-20 border-b flex-shrink-0"
          style={{ backgroundColor: bg, borderColor }}
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg"
                style={{ color: textPrimary }}
                onClick={() => setShowMobileSidebar(true)}
              >
                <Menu size={20} />
              </button>
              <h1
                className="text-lg font-semibold tracking-tight truncate"
                style={{ color: textPrimary }}
              >
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {actions}

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg border"
                  style={{ borderColor, color: textPrimary }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="absolute right-0 top-12 w-80 rounded-xl border shadow-lg z-50"
                    style={{ backgroundColor: bg, borderColor }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ borderColor }}
                    >
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: textPrimary }}
                      >
                        {t("notifications.title")}
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{ color: textMuted }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div
                          className="p-8 text-center"
                          style={{ color: textMuted }}
                        >
                          <Bell size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">{t("notifications.none")}</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b"
                            style={{
                              borderColor,
                              backgroundColor: n.is_read
                                ? "transparent"
                                : isDark
                                  ? "#1E3A5F"
                                  : "#EFF6FF",
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "opacity-0" : ""}`}
                                style={{ backgroundColor: "#2563EB" }}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: textPrimary }}
                                >
                                  {n.title}
                                </p>
                                <p
                                  className="text-xs mt-0.5 line-clamp-2"
                                  style={{ color: textMuted }}
                                >
                                  {n.message}
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: textMuted }}
                                >
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-2 pl-2 border-l"
                style={{ borderColor }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
                >
                  {currentUser?.name?.charAt(0) || "U"}
                </div>
                <div className="hidden md:block">
                  <p
                    className="text-sm font-medium leading-tight"
                    style={{ color: textPrimary }}
                  >
                    {currentUser?.name}
                  </p>
                  <p
                    className="text-xs leading-tight capitalize"
                    style={{ color: textMuted }}
                  >
                    {currentUser?.role?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto"
          onClick={() => showNotifications && setShowNotifications(false)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
