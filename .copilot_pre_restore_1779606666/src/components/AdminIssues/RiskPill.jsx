import { getRiskInfo } from "@/utils/riskCalculations";

export function RiskPill({ p, s }) {
  const { level, color, bg, r } = getRiskInfo(p, s);
  if (!r) return <span style={{ color: "#6B7280" }}>—</span>;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{ color, backgroundColor: bg }}
    >
      R={r} {level}
    </span>
  );
}
