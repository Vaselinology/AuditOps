"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import {CheckCircle2,FileText,AlertTriangle,ChevronDown,ChevronUp} from "lucide-react";

const getRiskInfo = (p, s) => {
  const r = (p || 0) * (s || 0);
  if (!r) return { level: "—", color: "#6B7280", bg: "#F3F4F6", r: 0 };
  if (r <= 4) return { level: "Faible", color: "#059669", bg: "#D1FAE5", r };
  if (r <= 9) return { level: "Moyen", color: "#D97706", bg: "#FEF3C7", r };
  if (r <= 14)
    return { level: "Significatif", color: "#EA580C", bg: "#FFEDD5", r };
  return { level: "Élevé", color: "#DC2626", bg: "#FEE2E2", r };
};

export default function ReportIssue() {
  const { theme, t, currentUser } = useApp();
  const [form, setForm] = useState({event_name: "", location: "", source: "", description: "", urgency: "normal", initial_probability: null,initial_severity: null});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handle = (e) => set(e.target.name, e.target.value);
  const risk = getRiskInfo(form.initial_probability, form.initial_severity);
  //validayion
  const validate = () => {
    if (!currentUser) return "You must be logged in";
    if (!form.event_name.trim()) return "Event name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.initial_probability || !form.initial_severity)
      return "Please select a risk level";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reported_by: currentUser.id,
        }),
      });

      const data = await res.json();
      console.log("BACKEND RESPONSE:", data);
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setForm({event_name: "",location: "",source: "",description: "",urgency: "normal",initial_probability: null,initial_severity: null,});
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <AppShell title={t("issue.report")}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* success message */}
        {success && (
          <div className="mb-4 flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            Issue submitted successfully.
          </div>
        )}

        {/* error message */}
        {error && (
          <div className="mb-4 text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DETAILS */}
          <div className="border rounded-xl p-5" style={{ borderColor }}>
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <FileText size={16} /> Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="event_name"
                placeholder="Event name *"
                value={form.event_name}
                onChange={handle}
                className={inputCls}
              />

              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handle}
                className={inputCls}
              />

              <input
                name="source"
                placeholder="Source"
                value={form.source}
                onChange={handle}
                className={inputCls}
              />

              <select
                name="urgency"
                value={form.urgency}
                onChange={handle}
                className={inputCls}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <textarea
              name="description"
              placeholder="Description *"
              value={form.description}
              onChange={handle}
              rows={4}
              className={`${inputCls} mt-4`}
            />
          </div>

          {/* risk*/}
          <div className="border rounded-xl p-5" style={{ borderColor }}>
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <AlertTriangle size={16} /> Risk Evaluation
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((p) =>
                [1, 2, 3, 4, 5].map((s) => {
                  const r = getRiskInfo(p, s);
                  const active =
                    form.initial_probability === p &&
                    form.initial_severity === s;

                  return (
                    <button
                      key={`${p}-${s}`}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          initial_probability: p,
                          initial_severity: s,
                        }));
                      }}
                      className="h-12 rounded font-bold"
                      style={{
                        backgroundColor: r.bg,
                        color: r.color,
                        border: active
                          ? `2px solid ${r.color}`
                          : "1px solid #ccc",
                      }}
                    >
                      {r.r}
                    </button>
                  );
                })
              )}
            </div>

            {/* risk preview */}
            {risk.r > 0 && (
              <div
                className="mt-4 px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: risk.bg,
                  color: risk.color,
                }}
              >
                Risk Level: {risk.level} (Score: {risk.r})
              </div>
            )}
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}