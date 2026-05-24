import { DetailRow } from "./DetailRow";

export function DetailsTab({ issue, textPrimary, textMuted }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DetailRow
          label="Date"
          value={
            issue.event_date
              ? new Date(issue.event_date).toLocaleDateString()
              : null
          }
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
        <DetailRow
          label="Location"
          value={issue.location}
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
        <DetailRow
          label="Source"
          value={issue.source}
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
        <DetailRow
          label="Références"
          value={issue.event_references}
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
        <DetailRow
          label="A/C Mat / P/N & S/N"
          value={issue.ac_mat}
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
        <DetailRow
          label="Reported by"
          value={issue.reported_by_name}
          textPrimary={textPrimary}
          textMuted={textMuted}
        />
      </div>
      {issue.description && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>
            Description
          </p>
          <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>
            {issue.description}
          </p>
        </div>
      )}
    </div>
  );
}
