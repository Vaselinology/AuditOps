"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import {
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

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

function getRiskInfo(p, s) {
  const r = (p || 0) * (s || 0);
  if (!r) return { level: "—", color: "#6B7280", bg: "#F3F4F6", r: 0 };
  if (r <= 4) return { level: "Faible", color: "#059669", bg: "#D1FAE5", r };
  if (r <= 9) return { level: "Moyen", color: "#D97706", bg: "#FEF3C7", r };
  if (r <= 14)
    return { level: "Significatif", color: "#EA580C", bg: "#FFEDD5", r };
  return { level: "Élevé", color: "#DC2626", bg: "#FEE2E2", r };
}

function RiskMatrix({ selectedP, selectedS, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th
              className="p-1 text-right text-xs"
              style={{ color: "#6B7280", minWidth: 90 }}
            >
              S ↓ / P →
            </th>
            {[1, 2, 3, 4, 5].map((p) => (
              <th
                key={p}
                className="p-1 text-center font-semibold"
                style={{ color: "#6B7280", minWidth: 48 }}
              >
                P{p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((s) => (
            <tr key={s}>
              <td
                className="p-1 pr-2 text-right text-xs font-semibold"
                style={{ color: "#6B7280" }}
              >
                S{s}
              </td>
              {[1, 2, 3, 4, 5].map((p) => {
                const { color, bg, r } = getRiskInfo(p, s);
                const active = selectedP === p && selectedS === s;
                return (
                  <td key={p} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => onSelect(p, s)}
                      className="w-11 h-11 rounded flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: bg,
                        color,
                        border: active
                          ? `2.5px solid ${color}`
                          : `1px solid ${color}50`,
                        transform: active ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {r}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 mt-3 flex-wrap">
        {[
          { l: "Faible ≤4", c: "#059669", b: "#D1FAE5" },
          { l: "Moyen ≤9", c: "#D97706", b: "#FEF3C7" },
          { l: "Significatif ≤14", c: "#EA580C", b: "#FFEDD5" },
          { l: "Élevé ≤25", c: "#DC2626", b: "#FEE2E2" },
        ].map(({ l, c, b }) => (
          <span
            key={l}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ color: c, backgroundColor: b }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  bg,
  borderColor,
  textPrimary,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: bg, borderColor }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: open ? borderColor : "transparent" }}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={17} style={{ color: "#2563EB", flexShrink: 0 }} />
          <span
            className="font-semibold text-sm"
            style={{ color: textPrimary }}
          >
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} style={{ color: "#6B7280" }} />
        ) : (
          <ChevronDown size={15} style={{ color: "#6B7280" }} />
        )}
      </button>
      {open && <div className="px-6 py-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function ReportIssue() {
  const { theme, t, currentUser } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const blank = {
    event_id: "",
    event_type: "",
    event_date: "",
    event_references: "",
    ac_mat: "",
    event_name: "",
    location: "",
    source: "",
    description: "",
    urgency: "normal",
    initial_probability: null,
    initial_severity: null,
  };
  const [form, setForm] = useState({ ...blank });

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handle = (e) => set(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, reported_by: currentUser?.id }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
      setForm({ ...blank });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const iStyle = { borderColor, backgroundColor: bg, color: textPrimary };
  const sProps = { bg, borderColor, textPrimary };

  const Field = ({ label, required, children, hint }) => (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: textPrimary }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: textMuted }}>
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <AppShell title={t("issue.report")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitted && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{
              backgroundColor: isDark ? "#064E3B" : "#D1FAE5",
              borderColor: "#059669",
            }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                style={{ color: "#059669", flexShrink: 0 }}
              />
              <div>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "#059669" }}
                >
                  {t("issue.submitSuccess")}
                </h3>
                <p className="text-xs mt-1" style={{ color: "#059669" }}>
                  {t("issue.submitSuccessBody")}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Section
            title="Identification de l'événement"
            icon={Info}
            {...sProps}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="ID événement" hint="Laissez vide pour autogénérer">
                <input
                  name="event_id"
                  value={form.event_id}
                  onChange={handle}
                  placeholder="EVT-26-001"
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label="Type" required>
                <select
                  name="event_type"
                  value={form.event_type}
                  onChange={handle}
                  required
                  className={inputCls}
                  style={iStyle}
                >
                  <option value="">Sélectionner...</option>
                  <option>Non-conformité</option>
                  <option>Presque-accident</option>
                  <option>Incident</option>
                  <option>Observation</option>
                  <option>Réclamation</option>
                  <option>Autre</option>
                </select>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  name="event_date"
                  value={form.event_date}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Références">
                <input
                  name="event_references"
                  value={form.event_references}
                  onChange={handle}
                  placeholder="Documents de référence..."
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label="A/C Mat ou P/N & S/N équipement">
                <input
                  name="ac_mat"
                  value={form.ac_mat}
                  onChange={handle}
                  placeholder="Numéro de pièce / série..."
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
            </div>
          </Section>

          <Section title="Détails de l'événement" icon={FileText} {...sProps}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Événement" required>
                <input
                  name="event_name"
                  value={form.event_name}
                  onChange={handle}
                  required
                  placeholder="Nom / titre de l'événement..."
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label="Lieu">
                <input
                  name="location"
                  value={form.location}
                  onChange={handle}
                  placeholder="Site / département..."
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label="Source">
                <input
                  name="source"
                  value={form.source}
                  onChange={handle}
                  placeholder="Origine de l'événement..."
                  className={inputCls}
                  style={iStyle}
                />
              </Field>
              <Field label={t("issue.urgency")}>
                <select
                  name="urgency"
                  value={form.urgency}
                  onChange={handle}
                  className={inputCls}
                  style={iStyle}
                >
                  <option value="low">{t("issue.urgency.low")}</option>
                  <option value="normal">{t("issue.urgency.normal")}</option>
                  <option value="high">{t("issue.urgency.high")}</option>
                  <option value="critical">
                    {t("issue.urgency.critical")}
                  </option>
                </select>
              </Field>
            </div>
            <Field label="Description" required>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                required
                rows={4}
                placeholder="Description complète de l'événement..."
                className={inputCls}
                style={iStyle}
              />
            </Field>
          </Section>

          <Section
            title="Évaluation initiale du risque"
            icon={AlertTriangle}
            {...sProps}
          >
            <p className="text-xs -mt-1" style={{ color: textMuted }}>
              Cliquez sur une cellule de la matrice pour définir la Probabilité
              (P) et la Gravité (G).
            </p>
            <RiskMatrix
              selectedP={form.initial_probability}
              selectedS={form.initial_severity}
              onSelect={(p, s) => {
                set("initial_probability", p);
                set("initial_severity", s);
              }}
            />
            {form.initial_probability && form.initial_severity && (
              <div
                className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-lg"
                style={{
                  backgroundColor:
                    getRiskInfo(form.initial_probability, form.initial_severity)
                      .bg + "60",
                }}
              >
                {[
                  {
                    label: "Probabilité (P)",
                    value: form.initial_probability,
                    desc: PROB_LABELS[form.initial_probability],
                  },
                  {
                    label: "Gravité (G)",
                    value: form.initial_severity,
                    desc: SEV_LABELS[form.initial_severity],
                  },
                  {
                    label: "Risque (R = P×G)",
                    value: form.initial_probability * form.initial_severity,
                    desc: getRiskInfo(
                      form.initial_probability,
                      form.initial_severity,
                    ).level,
                  },
                ].map(({ label, value, desc }) => {
                  const { color } = getRiskInfo(
                    form.initial_probability,
                    form.initial_severity,
                  );
                  return (
                    <div key={label} className="text-center">
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "#6B7280" }}
                      >
                        {label}
                      </p>
                      <p className="text-2xl font-bold" style={{ color }}>
                        {value || "—"}
                      </p>
                      {desc && (
                        <p
                          className="text-xs mt-0.5 font-medium"
                          style={{ color }}
                        >
                          {desc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-3 pt-2">
            <a
              href="/"
              className="px-6 py-2 rounded-lg border text-sm font-medium"
              style={{ borderColor, color: textPrimary }}
            >
              {t("common.cancel")}
            </a>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: submitting ? "#93C5FD" : "#2563EB",
                color: "#FFFFFF",
              }}
            >
              {submitting ? t("common.loading") : t("issue.submit")}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
