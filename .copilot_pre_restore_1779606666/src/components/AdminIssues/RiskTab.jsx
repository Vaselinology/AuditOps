import { getRiskInfo, PROB_LABELS, SEV_LABELS } from "@/utils/riskCalculations";
import { DetailRow } from "./DetailRow";

export function RiskTab({ issue, textPrimary, textMuted, borderColor }) {
  const initRisk = getRiskInfo(
    issue.initial_probability,
    issue.initial_severity,
  );
  const reassRisk = getRiskInfo(issue.reass_probability, issue.reass_severity);

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: textPrimary }}
        >
          Évaluation initiale
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Probabilité (P)",
              value: issue.initial_probability,
              desc: PROB_LABELS[issue.initial_probability],
            },
            {
              label: "Gravité (G)",
              value: issue.initial_severity,
              desc: SEV_LABELS[issue.initial_severity],
            },
          ].map(({ label, value, desc }) => (
            <div
              key={label}
              className="text-center p-3 rounded-lg border"
              style={{ borderColor }}
            >
              <p className="text-xs mb-1" style={{ color: textMuted }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color: "#2563EB" }}>
                {value || "—"}
              </p>
              {desc && (
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  {desc}
                </p>
              )}
            </div>
          ))}
          <div
            className="text-center p-3 rounded-lg"
            style={{ backgroundColor: initRisk.bg, color: initRisk.color }}
          >
            <p className="text-xs mb-1 font-medium">Risque (R)</p>
            <p className="text-2xl font-bold">{initRisk.r || "—"}</p>
            <p className="text-xs mt-0.5 font-semibold">{initRisk.level}</p>
          </div>
        </div>

        {initRisk.r > 0 && (
          <div
            className="mt-3 p-3 rounded-lg border text-xs"
            style={{
              borderColor,
              color: "#EA580C",
              backgroundColor: "#FFF7ED",
            }}
          >
            <strong>Délai réglementaire :</strong>{" "}
            {initRisk.r > 14
              ? "72 heures (risque élevé)"
              : "15 jours (risque modéré ou faible)"}
          </div>
        )}
      </div>

      {(issue.reass_probability || issue.reass_severity) && (
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: textPrimary }}
          >
            Réévaluation
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Probabilité (P)", value: issue.reass_probability },
              { label: "Gravité (G)", value: issue.reass_severity },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center p-3 rounded-lg border"
                style={{ borderColor }}
              >
                <p className="text-xs mb-1" style={{ color: textMuted }}>
                  {label}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2563EB" }}>
                  {value || "—"}
                </p>
              </div>
            ))}
            <div
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: reassRisk.bg, color: reassRisk.color }}
            >
              <p className="text-xs mb-1 font-medium">Risque (R)</p>
              <p className="text-2xl font-bold">{reassRisk.r || "—"}</p>
              <p className="text-xs mt-0.5 font-semibold">{reassRisk.level}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: textPrimary }}
        >
          Analyse du risque
        </h3>
        <div className="flex gap-6">
          {[
            ["P — Probabilité", "risk_analysis_p"],
            ["G — Gravité", "risk_analysis_s"],
            ["R — Risque", "risk_analysis_r"],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border flex items-center justify-center"
                style={{
                  borderColor,
                  backgroundColor: issue[key] ? "#2563EB" : "transparent",
                }}
              >
                {issue[key] && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: textPrimary }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(issue.effectiveness_suitability || issue.effectiveness_date) && (
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: textPrimary }}
          >
            Efficacité
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow
              label="Adéquation"
              value={issue.effectiveness_suitability}
              textPrimary={textPrimary}
              textMuted={textMuted}
            />
            <DetailRow
              label="Date"
              value={
                issue.effectiveness_date
                  ? new Date(issue.effectiveness_date).toLocaleDateString(
                      "fr-FR",
                    )
                  : null
              }
              textPrimary={textPrimary}
              textMuted={textMuted}
            />
          </div>
        </div>
      )}
    </div>
  );
}
