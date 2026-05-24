import { FileText, ExternalLink } from "lucide-react";

export function FollowUpTab({ issue, t, textPrimary, textMuted, borderColor }) {
  const hasContent =
    issue.investigation ||
    issue.investigation_report_url ||
    issue.action_recommendation ||
    issue.corrective_action;

  if (!hasContent) {
    return (
      <p className="text-sm text-center py-8" style={{ color: textMuted }}>
        No follow-up recorded yet
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {issue.investigation && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>
            Investigation
          </p>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: textPrimary }}
          >
            {issue.investigation}
          </p>
        </div>
      )}
      {issue.investigation_report_url && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: textMuted }}>
            Investigation Report
          </p>
          <a
            href={issue.investigation_report_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor, color: "#2563EB" }}
          >
            <FileText size={15} />
            View Report
            <ExternalLink size={13} />
          </a>
        </div>
      )}
      {issue.action_recommendation && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>
            Action Recommendation
          </p>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: textPrimary }}
          >
            {issue.action_recommendation}
          </p>
        </div>
      )}
      {issue.corrective_action && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>
            {t("admin.issues.corrective")}
          </p>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: textPrimary }}
          >
            {issue.corrective_action}
          </p>
        </div>
      )}
    </div>
  );
}
