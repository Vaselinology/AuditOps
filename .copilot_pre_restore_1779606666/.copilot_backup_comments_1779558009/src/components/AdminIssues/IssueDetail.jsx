import { AlertCircle, Download } from "lucide-react";
import { IssueDetailHeader } from "./IssueDetailHeader";
import { TabNavigation } from "./TabNavigation";
import { DetailsTab } from "./DetailsTab";
import { RiskTab } from "./RiskTab";
import { FollowUpTab } from "./FollowUpTab";
import { ManageTab } from "./ManageTab";

export function IssueDetail({
  selectedIssue,
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  users,
  onUpdate,
  onGenerateReport,
  saving,
  downloading,
  getStatusLabel,
  t,
  bg,
  bgMuted,
  textPrimary,
  textMuted,
  borderColor,
  reportHtml,
}) {
  const tabs = [
    { id: "details", label: "Détails" },
    { id: "risk", label: "Risque initial" },
    { id: "followup", label: "Suivi" },
    { id: "manage", label: t("admin.issues.update") },
    { id: "report", label: "Rapport" },
  ];

  if (!selectedIssue) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{ backgroundColor: bg, borderColor }}
      >
        <AlertCircle
          size={36}
          className="mx-auto mb-3"
          style={{ color: textMuted, opacity: 0.3 }}
        />
        <p className="text-sm" style={{ color: textMuted }}>
          {t("admin.issues.select")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: bg, borderColor }}
    >
      <IssueDetailHeader
        issue={selectedIssue}
        getStatusLabel={getStatusLabel}
        textPrimary={textPrimary}
        textMuted={textMuted}
        borderColor={borderColor}
        bgMuted={bgMuted}
      />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        textMuted={textMuted}
        borderColor={borderColor}
      />

      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {activeTab === "details" && (
          <DetailsTab
            issue={selectedIssue}
            textPrimary={textPrimary}
            textMuted={textMuted}
          />
        )}
        {activeTab === "risk" && (
          <RiskTab
            issue={selectedIssue}
            textPrimary={textPrimary}
            textMuted={textMuted}
            borderColor={borderColor}
          />
        )}
        {activeTab === "followup" && (
          <FollowUpTab
            issue={selectedIssue}
            t={t}
            textPrimary={textPrimary}
            textMuted={textMuted}
            borderColor={borderColor}
          />
        )}
        {activeTab === "manage" && (
          <ManageTab
            formData={formData}
            setFormData={setFormData}
            users={users}
            onSubmit={onUpdate}
            onGenerateReport={onGenerateReport}
            selectedIssue={selectedIssue}
            saving={saving}
            downloading={downloading}
            t={t}
            textPrimary={textPrimary}
            textMuted={textMuted}
            borderColor={borderColor}
            bg={bg}
          />
        )}
        {activeTab === "report" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p
                className="text-sm font-semibold"
                style={{ color: textPrimary }}
              >
                Rapport d'analyse de risque
              </p>
              <button
                onClick={onGenerateReport}
                disabled={downloading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
                style={{ borderColor, color: "#2563EB" }}
              >
                <Download size={12} />{" "}
                {downloading ? t("common.loading") : t("common.download")}
              </button>
            </div>
            {reportHtml ? (
              <iframe
                srcDoc={reportHtml}
                className="w-full rounded-lg border"
                style={{
                  height: 500,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: "#fff",
                }}
                title="Rapport"
              />
            ) : (
              <div className="p-10 text-center" style={{ color: textMuted }}>
                <p className="text-sm">
                  Aucun rapport généré. Allez dans l'onglet{" "}
                  <strong>{t("admin.issues.update")}</strong> et cliquez sur{" "}
                  {t("admin.issues.generateReport")}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
