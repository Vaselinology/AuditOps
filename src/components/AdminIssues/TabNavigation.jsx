export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  textMuted,
  borderColor,
}) {
  return (
    <div className="flex border-b" style={{ borderColor }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex-1 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px"
          style={{
            color: activeTab === tab.id ? "#2563EB" : textMuted,
            borderColor: activeTab === tab.id ? "#2563EB" : "transparent",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
