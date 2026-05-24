export const PROB_LABELS = {
  1: "Rare",
  2: "Improbable",
  3: "Possible",
  4: "Probable",
  5: "Quasi-certain",
};

export const SEV_LABELS = {
  1: "Négligeable",
  2: "Mineur",
  3: "Modéré",
  4: "Majeur",
  5: "Catastrophique",
};

export function getRiskInfo(p, s) {
  const r = (p || 0) * (s || 0);
  if (!r) return { level: "—", color: "#6B7280", bg: "#F3F4F6", r: 0 };
  if (r <= 4) return { level: "Faible", color: "#059669", bg: "#D1FAE5", r };
  if (r <= 9) return { level: "Moyen", color: "#D97706", bg: "#FEF3C7", r };
  if (r <= 14)
    return { level: "Significatif", color: "#EA580C", bg: "#FFEDD5", r };
  return { level: "Élevé", color: "#DC2626", bg: "#FEE2E2", r };
}
