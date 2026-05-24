"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Plus, Trash2, X, ChevronRight, Pencil } from "lucide-react";

const MONTHS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const WEEKS = [1, 2, 3, 4];

// Color constants
const COLOR_PLANNED = { bg: "#F97316", text: "#FFFFFF" }; // orange
const COLOR_POSTPONED = { bg: "#3B82F6", text: "#FFFFFF" }; // blue  (original week, postponed)
const COLOR_COMPLETED = { bg: "#059669", text: "#FFFFFF" }; // green
const COLOR_RESCHEDULED = { bg: "#F97316", text: "#FFFFFF" }; // orange (new week after postponement)

function getCellInfo(rowId, month, week, slots) {
  // Check if original slot exists here
  const original = slots.find(
    (s) =>
      s.row_id === rowId &&
      s.original_month === month &&
      s.original_week === week,
  );
  if (original) {
    if (original.status === "postponed")
      return { slot: original, role: "postponed_origin", ...COLOR_POSTPONED };
    if (original.status === "completed")
      return { slot: original, role: "original", ...COLOR_COMPLETED };
    return { slot: original, role: "original", ...COLOR_PLANNED };
  }
  // Check if this cell is the rescheduled destination
  const rescheduled = slots.find(
    (s) =>
      s.row_id === rowId &&
      s.postponed_month === month &&
      s.postponed_week === week &&
      s.status === "postponed",
  );
  if (rescheduled)
    return { slot: rescheduled, role: "rescheduled", ...COLOR_RESCHEDULED };
  return null;
}

function WeekCell({ rowId, month, week, slots, onClick, borderColor }) {
  const info = getCellInfo(rowId, month, week, slots);
  return (
    <td
      className="p-0 border-b border-r cursor-pointer"
      style={{ borderColor, width: 28, minWidth: 28 }}
      onClick={() => onClick({ rowId, month, week, info })}
    >
      <div
        className="w-7 h-7 flex items-center justify-center rounded-sm mx-auto my-0.5"
        style={{
          backgroundColor: info ? info.bg : "transparent",
          cursor: "pointer",
        }}
        title={info?.slot?.title || ""}
      >
        {info && (
          <span
            className="text-xs font-bold leading-none"
            style={{ color: info.text, fontSize: 9 }}
          >
            {info.role === "postponed_origin" ? "R" : "A"}
          </span>
        )}
      </div>
    </td>
  );
}

export default function YearlyPlan() {
  const { theme, t, language } = useApp();
  const [activePlan, setActivePlan] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [slots, setSlots] = useState([]);
  const [modal, setModal] = useState(null); // { rowId, month, week, info }
  const [addRowModal, setAddRowModal] = useState(false);
  const [newRow, setNewRow] = useState({ domain: "", referentiel: "" });
  const [slotForm, setSlotForm] = useState({
    title: "",
    audit_day: "",
    notes: "",
    status: "planned",
    postponed_month: "",
    postponed_week: "",
  });

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/programme?plan_id=${activePlan}&year=${year}`,
      );
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [activePlan, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group rows by domain
  const domains = [];
  const domainMap = {};
  rows.forEach((row) => {
    if (!domainMap[row.domain]) {
      domainMap[row.domain] = [];
      domains.push(row.domain);
    }
    domainMap[row.domain].push(row);
  });

  const openCellModal = ({ rowId, month, week, info }) => {
    setModal({ rowId, month, week, info });
    if (info) {
      setSlotForm({
        title: info.slot.title || "",
        audit_day: info.slot.audit_day || "",
        notes: info.slot.notes || "",
        status: info.slot.status || "planned",
        postponed_month: info.slot.postponed_month || "",
        postponed_week: info.slot.postponed_week || "",
      });
    } else {
      setSlotForm({
        title: "",
        audit_day: "",
        notes: "",
        status: "planned",
        postponed_month: "",
        postponed_week: "",
      });
    }
  };

  const handleSaveSlot = async () => {
    try {
      const { rowId, month, week, info } = modal;
      if (info?.slot && info.role !== "rescheduled") {
        // Update existing slot
        await fetch("/api/programme/slots", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: info.slot.id,
            title: slotForm.title,
            audit_day: slotForm.audit_day || null,
            notes: slotForm.notes,
            status: slotForm.status,
            postponed_month:
              slotForm.status === "postponed"
                ? slotForm.postponed_month || null
                : null,
            postponed_week:
              slotForm.status === "postponed"
                ? slotForm.postponed_week || null
                : null,
          }),
        });
      } else if (!info) {
        // Create new slot
        await fetch("/api/programme/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            row_id: rowId,
            original_month: month,
            original_week: week,
            title: slotForm.title,
            audit_day: slotForm.audit_day || null,
            notes: slotForm.notes,
            status: "planned",
          }),
        });
      }
      setModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async () => {
    if (!modal?.info?.slot) return;
    try {
      await fetch(`/api/programme/slots/${modal.info.slot.id}`, {
        method: "DELETE",
      });
      setModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRow = async () => {
    if (!newRow.domain || !newRow.referentiel) return;
    try {
      await fetch("/api/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: activePlan, year, ...newRow }),
      });
      setNewRow({ domain: "", referentiel: "" });
      setAddRowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    try {
      await fetch(`/api/programme/rows/${rowId}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const plans = [
    { id: 1, label: "Programme d'audit interne 1" },
    { id: 2, label: "Programme d'audit interne 2" },
  ];

  const topbarActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="p-1.5 rounded-lg border"
          style={{ borderColor, color: textPrimary }}
        >
          <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
        </button>
        <span
          className="text-sm font-semibold px-2"
          style={{ color: textPrimary }}
        >
          {year}
        </span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="p-1.5 rounded-lg border"
          style={{ borderColor, color: textPrimary }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <button
        onClick={() => setAddRowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
      >
        <Plus size={15} />
        <span className="hidden sm:inline">Ajouter une ligne</span>
      </button>
    </div>
  );

  return (
    <AppShell title={t("yearlyPlan.title")} actions={topbarActions}>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Plan tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setActivePlan(plan.id)}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{
                backgroundColor:
                  activePlan === plan.id ? "#2563EB" : "transparent",
                color: activePlan === plan.id ? "#FFFFFF" : textMuted,
                borderColor: activePlan === plan.id ? "#2563EB" : borderColor,
              }}
            >
              {plan.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
          {[
            { bg: "#F97316", label: "Audit planifié" },
            { bg: "#3B82F6", label: "Report (semaine originale)" },
            { bg: "#059669", label: "Réalisé" },
          ].map(({ bg: b, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-sm flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: b, fontSize: 9 }}
              >
                A
              </div>
              <span style={{ color: textMuted }}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-sm border"
              style={{ borderColor }}
            />
            <span style={{ color: textMuted }}>Semaine vide</span>
          </div>
        </div>

        {/* ── Big scrollable table ── */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor }}
        >
          <div className="overflow-x-auto">
            <table
              className="border-collapse text-xs"
              style={{ minWidth: 1100 }}
            >
              <thead>
                {/* Row 1: month labels */}
                <tr style={{ backgroundColor: bgMuted }}>
                  <th
                    rowSpan={2}
                    className="text-left px-4 py-3 font-semibold border-b border-r sticky left-0 z-10"
                    style={{
                      borderColor,
                      backgroundColor: bgMuted,
                      color: textPrimary,
                      minWidth: 170,
                      maxWidth: 170,
                    }}
                  >
                    Domaine / Activité / Site / Produit
                  </th>
                  <th
                    rowSpan={2}
                    className="text-left px-4 py-3 font-semibold border-b border-r sticky z-10"
                    style={{
                      borderColor,
                      backgroundColor: bgMuted,
                      color: textPrimary,
                      minWidth: 150,
                      maxWidth: 150,
                      left: 170,
                    }}
                  >
                    Référentiels
                  </th>
                  {MONTHS_SHORT.map((m, i) => (
                    <th
                      key={i}
                      colSpan={4}
                      className="text-center py-2 border-b border-r font-semibold"
                      style={{
                        borderColor,
                        color: textPrimary,
                        backgroundColor: bgMuted,
                      }}
                    >
                      {m}
                    </th>
                  ))}
                  <th
                    rowSpan={2}
                    className="text-center px-3 py-3 font-semibold border-b"
                    style={{
                      borderColor,
                      backgroundColor: bgMuted,
                      color: textMuted,
                      minWidth: 48,
                    }}
                  />
                </tr>
                {/* Row 2: week numbers */}
                <tr style={{ backgroundColor: bgMuted }}>
                  {Array.from({ length: 12 }).flatMap((_, mi) =>
                    WEEKS.map((w) => (
                      <th
                        key={`${mi}-${w}`}
                        className="text-center py-1.5 border-b border-r"
                        style={{
                          borderColor,
                          color: textMuted,
                          width: 28,
                          minWidth: 28,
                          fontWeight: 500,
                        }}
                      >
                        S{w}
                      </th>
                    )),
                  )}
                </tr>
              </thead>

              <tbody style={{ backgroundColor: bg }}>
                {domains.length === 0 ? (
                  <tr>
                    <td
                      colSpan={50}
                      className="px-6 py-12 text-center"
                      style={{ color: textMuted }}
                    >
                      Aucune ligne — cliquez « Ajouter une ligne » pour
                      commencer.
                    </td>
                  </tr>
                ) : (
                  domains.flatMap((domain) => {
                    const domainRows = domainMap[domain];
                    return domainRows.map((row, rIdx) => (
                      <tr
                        key={row.id}
                        className="border-b"
                        style={{ borderColor }}
                      >
                        {/* Domain cell — rowspan for first row */}
                        {rIdx === 0 && (
                          <td
                            rowSpan={domainRows.length}
                            className="px-4 py-2 border-r align-middle font-semibold sticky left-0 z-10"
                            style={{
                              borderColor,
                              backgroundColor: bg,
                              color: textPrimary,
                              verticalAlign: "middle",
                              maxWidth: 170,
                            }}
                          >
                            {domain}
                          </td>
                        )}
                        {/* Référentiel cell */}
                        <td
                          className="px-4 py-2 border-r sticky z-10"
                          style={{
                            borderColor,
                            backgroundColor: bg,
                            color: textMuted,
                            left: 170,
                            minWidth: 150,
                            maxWidth: 150,
                          }}
                        >
                          {row.referentiel}
                        </td>
                        {/* Week cells: 12 months × 4 weeks */}
                        {Array.from({ length: 12 }).flatMap((_, mi) =>
                          WEEKS.map((w) => (
                            <WeekCell
                              key={`${row.id}-${mi + 1}-${w}`}
                              rowId={row.id}
                              month={mi + 1}
                              week={w}
                              slots={slots}
                              onClick={openCellModal}
                              borderColor={borderColor}
                            />
                          )),
                        )}
                        {/* Delete row button */}
                        <td
                          className="px-2 text-center"
                          style={{ borderColor }}
                        >
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 rounded hover:bg-red-50"
                            style={{ color: "#DC2626" }}
                            title="Supprimer la ligne"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Cell Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="rounded-xl border p-6 w-full max-w-md"
            style={{ backgroundColor: bg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: textPrimary }}>
                {modal.info ? "Modifier l'audit" : "Planifier un audit"}
                <span
                  className="ml-2 text-xs font-normal"
                  style={{ color: textMuted }}
                >
                  {MONTHS_SHORT[modal.month - 1]} – S{modal.week}
                </span>
              </h3>
              <button
                onClick={() => setModal(null)}
                style={{ color: textMuted }}
              >
                <X size={16} />
              </button>
            </div>

            {modal.info?.role === "rescheduled" ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: textMuted }}>
                  Cette semaine est le remplacement d'un audit reporté.
                </p>
                <p
                  className="font-semibold mt-2"
                  style={{ color: textPrimary }}
                >
                  {modal.info.slot.title}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    Titre de l'audit
                  </label>
                  <input
                    type="text"
                    value={slotForm.title}
                    onChange={(e) =>
                      setSlotForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="ex. Audit ISO 9001 Production"
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor,
                      backgroundColor: bg,
                      color: textPrimary,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: textPrimary }}
                    >
                      Jour (dans la semaine)
                    </label>
                    <select
                      value={slotForm.audit_day}
                      onChange={(e) =>
                        setSlotForm((f) => ({
                          ...f,
                          audit_day: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        borderColor,
                        backgroundColor: bg,
                        color: textPrimary,
                      }}
                    >
                      <option value="">—</option>
                      <option value="1">Lundi</option>
                      <option value="2">Mardi</option>
                      <option value="3">Mercredi</option>
                      <option value="4">Jeudi</option>
                      <option value="5">Vendredi</option>
                    </select>
                  </div>
                  {modal.info && (
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: textPrimary }}
                      >
                        Statut
                      </label>
                      <select
                        value={slotForm.status}
                        onChange={(e) =>
                          setSlotForm((f) => ({ ...f, status: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor,
                          backgroundColor: bg,
                          color: textPrimary,
                        }}
                      >
                        <option value="planned">Planifié</option>
                        <option value="postponed">Reporté</option>
                        <option value="completed">Réalisé</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Postponement: new date */}
                {slotForm.status === "postponed" && (
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      borderColor: "#F97316",
                      backgroundColor: isDark ? "#431407" : "#FFF7ED",
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#EA580C" }}
                    >
                      Nouvelle date
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: "#EA580C" }}
                        >
                          Mois
                        </label>
                        <select
                          value={slotForm.postponed_month}
                          onChange={(e) =>
                            setSlotForm((f) => ({
                              ...f,
                              postponed_month: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{
                            borderColor: "#F97316",
                            backgroundColor: bg,
                            color: textPrimary,
                          }}
                        >
                          <option value="">—</option>
                          {MONTHS_SHORT.map((m, i) => (
                            <option key={i} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: "#EA580C" }}
                        >
                          Semaine
                        </label>
                        <select
                          value={slotForm.postponed_week}
                          onChange={(e) =>
                            setSlotForm((f) => ({
                              ...f,
                              postponed_week: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{
                            borderColor: "#F97316",
                            backgroundColor: bg,
                            color: textPrimary,
                          }}
                        >
                          <option value="">—</option>
                          {WEEKS.map((w) => (
                            <option key={w} value={w}>
                              S{w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={slotForm.notes}
                    onChange={(e) =>
                      setSlotForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor,
                      backgroundColor: bg,
                      color: textPrimary,
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {modal.info && (
                    <button
                      onClick={handleDeleteSlot}
                      className="px-4 py-2 rounded-lg border text-sm font-medium"
                      style={{ borderColor, color: "#DC2626" }}
                    >
                      Supprimer
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-lg border text-sm font-medium"
                    style={{ borderColor, color: textPrimary }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveSlot}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                  >
                    {modal.info ? "Mettre à jour" : "Planifier"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add Row Modal ── */}
      {addRowModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setAddRowModal(false)}
        >
          <div
            className="rounded-xl border p-6 w-full max-w-sm"
            style={{ backgroundColor: bg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: textPrimary }}>
                Ajouter une ligne
              </h3>
              <button
                onClick={() => setAddRowModal(false)}
                style={{ color: textMuted }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: textPrimary }}
                >
                  Domaine / Activité / Site / Produit
                </label>
                <input
                  type="text"
                  value={newRow.domain}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, domain: e.target.value }))
                  }
                  placeholder="ex. Production"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor,
                    backgroundColor: bg,
                    color: textPrimary,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: textPrimary }}
                >
                  Référentiel
                </label>
                <input
                  type="text"
                  value={newRow.referentiel}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, referentiel: e.target.value }))
                  }
                  placeholder="ex. ISO 9001:2015"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor,
                    backgroundColor: bg,
                    color: textPrimary,
                  }}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAddRowModal(false)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor, color: textPrimary }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRow}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
