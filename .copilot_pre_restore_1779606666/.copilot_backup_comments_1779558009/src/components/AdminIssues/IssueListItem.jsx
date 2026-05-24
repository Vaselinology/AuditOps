import { RiskPill } from "./RiskPill";

export function IssueListItem({
  issue,
  isSelected,
  onSelect,
  getUrgencyColor,
  getStatusLabel,
  t,
  isDark,
  textPrimary,
  textMuted,
  borderColor,
}) {
  return (
    <button
      onClick={() => onSelect(issue)}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${isSelected ? "ring-2 ring-blue-600" : ""}`}
      style={{ borderColor }}
    >
      <div className="flex items-start gap-2 mb-1">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            backgroundColor: isDark ? "#1F2937" : "#EFF6FF",
            color: getUrgencyColor(issue.urgency),
          }}
        >
          {t(`issue.urgency.${issue.urgency}`)}
        </span>
        {issue.event_id && (
          <span className="text-xs font-mono" style={{ color: textMuted }}>
            {issue.event_id}
          </span>
        )}
      </div>
      <h3
        className="font-semibold text-sm line-clamp-1"
        style={{ color: textPrimary }}
      >
        {issue.event_name || issue.title}
      </h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: textMuted }}>
          {issue.event_type || issue.category || "—"}
        </span>
        <RiskPill p={issue.initial_probability} s={issue.initial_severity} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: textMuted }}>
          {issue.event_date
            ? new Date(issue.event_date).toLocaleDateString()
            : new Date(issue.created_at).toLocaleDateString()}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full border"
          style={{ borderColor, color: textMuted }}
        >
          {getStatusLabel(issue.status)}
        </span>
      </div>
    </button>
  );
}
