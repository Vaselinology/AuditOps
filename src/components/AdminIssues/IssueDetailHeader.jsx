import { RiskPill } from "./RiskPill";

export function IssueDetailHeader({
  issue,
  getStatusLabel,
  textPrimary,
  textMuted,
  borderColor,
  bgMuted,
}) {
  return (
    <div
      className="px-6 py-4 border-b"
      style={{ borderColor, backgroundColor: bgMuted }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {issue.event_id && (
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded border"
                style={{ borderColor, color: "#2563EB" }}
              >
                {issue.event_id}
              </span>
            )}
            {issue.event_type && (
              <span
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{ borderColor, color: textMuted }}
              >
                {issue.event_type}
              </span>
            )}
            <RiskPill
              p={issue.initial_probability}
              s={issue.initial_severity}
            />
          </div>
          <h2
            className="font-semibold text-base truncate"
            style={{ color: textPrimary }}
          >
            {issue.event_name || issue.title}
          </h2>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full border flex-shrink-0"
          style={{ borderColor, color: textMuted }}
        >
          {getStatusLabel(issue.status)}
        </span>
      </div>
    </div>
  );
}
