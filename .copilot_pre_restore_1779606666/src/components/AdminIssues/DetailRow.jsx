export function DetailRow({ label, value, textPrimary, textMuted }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: textPrimary }}>
        {value}
      </p>
    </div>
  );
}
