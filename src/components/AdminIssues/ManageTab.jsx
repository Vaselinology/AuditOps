import { PROB_LABELS, SEV_LABELS, getRiskInfo } from "@/utils/riskCalculations";
import { Download } from "lucide-react";

function getAutoDeadline(p, s) {
  const r = (p || 0) * (s || 0);
  const d = new Date();
  d.setDate(d.getDate() + (r > 14 ? 3 : 15));
  return d.toISOString().split("T")[0];
}

export function ManageTab({
  formData,
  setFormData,
  users,
  onSubmit,
  onGenerateReport,
  selectedIssue,
  saving,
  downloading,
  t,
  textPrimary,
  textMuted,
  borderColor,
  bg,
}) {
  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const iStyle = { borderColor, backgroundColor: bg, color: textPrimary };
  const autoDeadline = getAutoDeadline(
    selectedIssue?.initial_probability,
    selectedIssue?.initial_severity,
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            {t("common.status")}
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className={inputCls}
            style={iStyle}
          >
            <option value="submitted">
              {t("admin.issues.status.submitted")}
            </option>
            <option value="under_review">
              {t("admin.issues.status.under_review")}
            </option>
            <option value="action_assigned">
              {t("admin.issues.status.action_assigned")}
            </option>
            <option value="resolved">
              {t("admin.issues.status.resolved")}
            </option>
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            {t("admin.issues.deadline")}
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
            className={inputCls}
            style={iStyle}
          />
          <p className="text-xs mt-1" style={{ color: textMuted }}>
            Délai auto : {autoDeadline} (
            {getRiskInfo(
              selectedIssue?.initial_probability,
              selectedIssue?.initial_severity,
            ).r > 14
              ? "72h — risque élevé"
              : "15 jours"}
            )
          </p>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            {t("admin.issues.assignTo")}
          </label>
          <select
            value={formData.assigned_to}
            onChange={(e) =>
              setFormData({ ...formData, assigned_to: e.target.value })
            }
            className={inputCls}
            style={iStyle}
          >
            <option value="">{t("admin.issues.selectUser")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            Responsable
          </label>
          <select
            value={formData.responsible_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, responsible_id: e.target.value }))
            }
            className={inputCls}
            style={iStyle}
          >
            <option value="">— Sélectionner —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            Date de révision
          </label>
          <input
            type="date"
            value={formData.review_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, review_date: e.target.value }))
            }
            className={inputCls}
            style={iStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: textPrimary }}
          >
            Risque potentiel
          </label>
          <input
            value={formData.potential_hazard || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, potential_hazard: e.target.value }))
            }
            className={inputCls}
            style={iStyle}
            placeholder="Description du risque potentiel..."
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: textPrimary }}
        >
          Mesures préventives existantes
        </label>
        <textarea
          value={formData.existing_measures || ""}
          onChange={(e) =>
            setFormData({ ...formData, existing_measures: e.target.value })
          }
          rows={2}
          className={inputCls}
          style={iStyle}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: textPrimary }}
        >
          Actions préventives proposées
        </label>
        <textarea
          value={formData.proposed_actions || ""}
          onChange={(e) =>
            setFormData({ ...formData, proposed_actions: e.target.value })
          }
          rows={2}
          className={inputCls}
          style={iStyle}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: textPrimary }}
        >
          Suivi — Investigation
        </label>
        <textarea
          value={formData.investigation}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, investigation: e.target.value }))
          }
          rows={3}
          className={inputCls}
          style={iStyle}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: textPrimary }}
        >
          {t("admin.issues.corrective")}
        </label>
        <textarea
          value={formData.corrective_action}
          onChange={(e) =>
            setFormData({ ...formData, corrective_action: e.target.value })
          }
          rows={3}
          placeholder={t("admin.issues.correctivePh")}
          className={inputCls}
          style={iStyle}
        />
      </div>

      <div className="border-t pt-4" style={{ borderColor }}>
        <p
          className="text-xs font-semibold uppercase mb-3"
          style={{ color: textMuted }}
        >
          Réévaluation du risque
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: textPrimary }}
            >
              Probabilité (P)
            </label>
            <select
              value={formData.reass_probability}
              onChange={(e) =>
                setFormData({ ...formData, reass_probability: e.target.value })
              }
              className={inputCls}
              style={iStyle}
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  P{v} — {PROB_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: textPrimary }}
            >
              Gravité (G)
            </label>
            <select
              value={formData.reass_severity}
              onChange={(e) =>
                setFormData({ ...formData, reass_severity: e.target.value })
              }
              className={inputCls}
              style={iStyle}
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  G{v} — {SEV_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: textPrimary }}
            >
              Efficacité
            </label>
            <select
              value={formData.effectiveness_suitability}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  effectiveness_suitability: e.target.value,
                })
              }
              className={inputCls}
              style={iStyle}
            >
              <option value="">—</option>
              <option value="effective">Efficace</option>
              <option value="partially_effective">
                Partiellement efficace
              </option>
              <option value="not_effective">Non efficace</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: textPrimary }}
            >
              Date d'efficacité
            </label>
            <input
              type="date"
              value={formData.effectiveness_date}
              onChange={(e) =>
                setFormData({ ...formData, effectiveness_date: e.target.value })
              }
              className={inputCls}
              style={iStyle}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
        >
          {saving ? t("common.loading") : t("admin.issues.update")}
        </button>
        <button
          type="button"
          onClick={onGenerateReport}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border"
          style={{ borderColor, color: "#059669" }}
        >
          <Download size={14} />{" "}
          {downloading ? t("common.loading") : t("admin.issues.generateReport")}
        </button>
      </div>
    </form>
  );
}
