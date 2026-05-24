import { IssueListItem } from "./IssueListItem";

export function IssuesList({
  issues,
  selectedIssue,
  onSelectIssue,
  getUrgencyColor,
  getStatusLabel,
  t,
  isDark,
  textPrimary,
  textMuted,
  borderColor,
  bg,
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: bg, borderColor }}
    >
      <h2
        className="text-base font-semibold mb-3"
        style={{ color: textPrimary }}
      >
        {t("admin.issues.all")} ({issues.length})
      </h2>
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {issues.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: textMuted }}>
            No events yet
          </p>
        )}
        {issues.map((issue) => (
          <IssueListItem
            key={issue.id}
            issue={issue}
            isSelected={selectedIssue?.id === issue.id}
            onSelect={onSelectIssue}
            getUrgencyColor={getUrgencyColor}
            getStatusLabel={getStatusLabel}
            t={t}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
            borderColor={borderColor}
          />
        ))}
      </div>
    </div>
  );
}
