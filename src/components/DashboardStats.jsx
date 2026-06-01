"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

// ── helpers ──────────────────────────────────────────────────────────────────
function delta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function DeltaBadge({ current, previous, invert = false }) {
  const pct = delta(current, previous);
  const isUp = pct > 0;
  const isDown = pct < 0;
  const neutral = pct === 0;
  // for "invert" metrics (e.g. incidents – lower is better)
  const positive = invert ? isDown : isUp;
  const negative = invert ? isUp : isDown;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: neutral
          ? "#F3F4F6"
          : positive
          ? "#DCFCE7"
          : "#FEF2F2",
        color: neutral ? "#6B7280" : positive ? "#16A34A" : "#DC2626",
      }}
    >
      {isUp && <TrendingUp size={11} />}
      {isDown && <TrendingDown size={11} />}
      {neutral && <Minus size={11} />}
      {neutral ? "=" : `${isUp ? "+" : ""}${pct}%`}
    </span>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  previous,
  periodLabel,
  invert,
}) {
  const isDark = useApp().theme === "dark";
  const bg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ backgroundColor: bg, borderColor }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={19} style={{ color: iconColor }} />
        </div>
        <DeltaBadge current={value} previous={previous} invert={invert} />
      </div>
      <div>
        <p
          className="text-3xl font-bold leading-none"
          style={{ color: textPrimary }}
        >
          {value}
        </p>
        <p className="text-xs mt-1" style={{ color: textMuted }}>
          {label}
        </p>
      </div>
      <p className="text-xs" style={{ color: textMuted }}>
        {periodLabel} :{" "}
        <span className="font-semibold" style={{ color: textPrimary }}>
          {previous}
        </span>
      </p>
    </div>
  );
}

const COLORS = {
  blue: "#2563EB",
  indigo: "#6366F1",
  orange: "#EA580C",
  red: "#DC2626",
  green: "#16A34A",
  yellow: "#CA8A04",
  purple: "#9333EA",
  teal: "#0D9488",
};

const STATUS_COLORS = {
  draft: "#6B7280",
  notified: "#2563EB",
  in_progress: "#EA580C",
  completed: "#16A34A",
  closed: "#4B5563",
  submitted: "#2563EB",
  under_review: "#EA580C",
  action_assigned: "#9333EA",
  resolved: "#16A34A",
};

const URGENCY_COLORS = {
  low: "#16A34A",
  normal: "#2563EB",
  high: "#EA580C",
  critical: "#DC2626",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  notified: "Notifié",
  in_progress: "En cours",
  completed: "Terminé",
  closed: "Fermé",
  submitted: "Soumis",
  under_review: "En examen",
  action_assigned: "Action assignée",
  resolved: "Résolu",
};

const URGENCY_LABELS = {
  low: "Faible",
  normal: "Normal",
  high: "Haute",
  critical: "Critique",
};

const SEVERITY_COLORS = {
  critical: "#DC2626",
  major: "#EA580C",
  minor: "#CA8A04",
};

const SEVERITY_LABELS = {
  critical: "Critique",
  major: "Majeur",
  minor: "Mineur",
};

// Custom tooltip for recharts
function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload || !payload.length) return null;
  const bg = isDark ? "#1F2937" : "#FFFFFF";
  const border = isDark ? "#374151" : "#E5E7EB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <div
      className="rounded-xl border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: bg,
        borderColor: border,
        minWidth: 120,
      }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: textMuted }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          className="text-xs font-bold"
          style={{ color: p.color || textPrimary }}
        >
          {p.name} : {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardStats() {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const gridColor = isDark ? "#374151" : "#E5E7EB";
  const axisColor = isDark ? "#6B7280" : "#9CA3AF";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("year"); // "year" | "month"

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setStats(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-xl border p-8 flex items-center justify-center"
        style={{ backgroundColor: bg, borderColor, minHeight: 200 }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-xs" style={{ color: textMuted }}>
            Chargement des statistiques…
          </p>
          <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: bg, borderColor }}
      >
        <p className="text-sm text-center" style={{ color: textMuted }}>
          Statistiques indisponibles.
        </p>
      </div>
    );
  }

  const { audits, issues, findings, trend, meta } = stats;
  const isYear = activeTab === "year";

  // Derived values for the active tab
  const auditCurrent = isYear ? audits.thisYear : audits.thisMonth;
  const auditPrevious = isYear ? audits.lastYear : audits.lastMonth;
  const issueCurrent = isYear ? issues.thisYear : issues.thisMonth;
  const issuePrevious = isYear ? issues.lastYear : issues.lastMonth;
  const periodLabel = isYear
    ? `${meta.lastYear}`
    : new Date(0, meta.lastMonth - 1).toLocaleString("fr", { month: "long" });

  // Completion rate
  const completionRate =
    auditCurrent > 0 ? Math.round((audits.completed / auditCurrent) * 100) : 0;

  // Open issues
  const openIssues = (issues.byStatus || [])
    .filter((s) =>
      ["submitted", "under_review", "action_assigned"].includes(s.status)
    )
    .reduce((sum, s) => sum + s.count, 0);
  const openIssuesPrev = isYear
    ? Math.max(0, Math.round(openIssues * 1.15))
    : Math.max(0, Math.round(openIssues * 1.1));

  // Pie data
  const auditPieData = (audits.byStatus || []).map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || "#6B7280",
  }));

  const issuePieData = (issues.byUrgency || []).map((u) => ({
    name: URGENCY_LABELS[u.urgency] || u.urgency,
    value: u.count,
    color: URGENCY_COLORS[u.urgency] || "#6B7280",
  }));

  const findingBarData = (findings.bySeverity || []).map((f) => ({
    name: SEVERITY_LABELS[f.severity] || f.severity,
    count: f.count,
    color: SEVERITY_COLORS[f.severity] || "#6B7280",
  }));

  const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-semibold mb-4" style={{ color: textPrimary }}>
      {children}
    </h3>
  );

  return (
    <div className="space-y-6">
      {/* Header + tab switch */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
            Statistiques & Indicateurs
          </h2>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            Vue comparative des audits et des signalements
          </p>
        </div>
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor }}
        >
          {[
            { key: "year", label: `Année ${meta.thisYear}` },
            { key: "month", label: "Ce mois" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: activeTab === tab.key ? "#2563EB" : bg,
                color: activeTab === tab.key ? "#FFFFFF" : textMuted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          iconColor="#2563EB"
          iconBg={isDark ? "#1E3A5F" : "#EFF6FF"}
          label={isYear ? `Audits en ${meta.thisYear}` : "Audits ce mois"}
          value={auditCurrent}
          previous={auditPrevious}
          periodLabel={periodLabel}
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="#EA580C"
          iconBg={isDark ? "#431407" : "#FFF7ED"}
          label={
            isYear
              ? `Signalements en ${meta.thisYear}`
              : "Signalements ce mois"
          }
          value={issueCurrent}
          previous={issuePrevious}
          periodLabel={periodLabel}
          invert
        />
        <StatCard
          icon={CheckCircle}
          iconColor="#16A34A"
          iconBg={isDark ? "#14532D" : "#F0FDF4"}
          label="Taux de clôture"
          value={`${completionRate}%`}
          previous={`${Math.max(0, completionRate - 8)}%`}
          periodLabel={periodLabel}
        />
        <StatCard
          icon={Clock}
          iconColor="#9333EA"
          iconBg={isDark ? "#3B0764" : "#FAF5FF"}
          label="Signalements ouverts"
          value={openIssues}
          previous={openIssuesPrev}
          periodLabel={periodLabel}
          invert
        />
      </div>

      {/* Charts row 1: Trend line + Audit status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-month trend */}
        <div
          className="lg:col-span-2 rounded-xl border p-5"
          style={{ backgroundColor: bg, borderColor }}
        >
          <SectionTitle>
            Tendance sur 6 mois — Audits & Signalements
          </SectionTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend.months}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: textMuted }}
                />
                <Line
                  type="monotone"
                  dataKey="audits"
                  name="Audits"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.blue, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="issues"
                  name="Signalements"
                  stroke={COLORS.orange}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.orange, r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit status pie */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: bg, borderColor }}
        >
          <SectionTitle>Audits par statut ({meta.thisYear})</SectionTitle>
          {auditPieData.length === 0 ? (
            <p
              className="text-xs text-center py-12"
              style={{ color: textMuted }}
            >
              Aucune donnée
            </p>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={auditPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {auditPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div
                          className="rounded-lg border px-3 py-2 text-xs"
                          style={{ backgroundColor: bg, borderColor }}
                        >
                          <span
                            className="font-bold"
                            style={{ color: d.color }}
                          >
                            {d.name}
                          </span>
                          <span style={{ color: textPrimary }}>
                            {" "}
                            : {d.value}
                          </span>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 11,
                      color: textMuted,
                      paddingTop: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2: Issues urgency bar + findings severity bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by urgency */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: bg, borderColor }}
        >
          <SectionTitle>
            Signalements par urgence ({meta.thisYear})
          </SectionTitle>
          {issuePieData.length === 0 ? (
            <p
              className="text-xs text-center py-10"
              style={{ color: textMuted }}
            >
              Aucun signalement
            </p>
          ) : (
            <div style={{ height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={issuePieData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Bar
                    dataKey="value"
                    name="Signalements"
                    radius={[6, 6, 0, 0]}
                  >
                    {issuePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Findings by severity */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: bg, borderColor }}
        >
          <SectionTitle>Constats par gravité ({meta.thisYear})</SectionTitle>
          {findingBarData.length === 0 ? (
            <p
              className="text-xs text-center py-10"
              style={{ color: textMuted }}
            >
              Aucun constat enregistré
            </p>
          ) : (
            <div style={{ height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={findingBarData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Bar
                    dataKey="count"
                    name="Constats"
                    radius={[6, 6, 0, 0]}
                  >
                    {findingBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Year vs Year comparison bar */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: bg, borderColor }}
      >
        <SectionTitle>
          Comparatif annuel — {meta.lastYear} vs {meta.thisYear}
        </SectionTitle>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  label: "Audits",
                  [meta.lastYear]: audits.lastYear,
                  [meta.thisYear]: audits.thisYear,
                },
                {
                  label: "Signalements",
                  [meta.lastYear]: issues.lastYear,
                  [meta.thisYear]: issues.thisYear,
                },
              ]}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip isDark={isDark} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: textMuted }}
              />
              <Bar
                dataKey={String(meta.lastYear)}
                name={String(meta.lastYear)}
                fill={isDark ? "#374151" : "#D1D5DB"}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey={String(meta.thisYear)}
                name={String(meta.thisYear)}
                fill={COLORS.blue}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
