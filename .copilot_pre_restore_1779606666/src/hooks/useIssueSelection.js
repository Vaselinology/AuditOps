import { useState } from "react";

export function useIssueSelection() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    status: "",
    corrective_action: "",
    assigned_to: "",
    urgency: "",
    deadline: "",
    investigation: "",
    action_recommendation: "",
    reass_probability: "",
    reass_severity: "",
    effectiveness_suitability: "",
    effectiveness_date: "",
    risk_analysis_p: false,
    risk_analysis_s: false,
    risk_analysis_r: false,
  });

  const selectIssue = (issue) => {
    setSelectedIssue(issue);
    setActiveTab("details");
    setFormData({
      status: issue.status || "",
      corrective_action: issue.corrective_action || "",
      assigned_to: issue.assigned_to || "",
      urgency: issue.urgency || "",
      deadline: issue.deadline || "",
      investigation: issue.investigation || "",
      action_recommendation: issue.action_recommendation || "",
      reass_probability: issue.reass_probability || "",
      reass_severity: issue.reass_severity || "",
      effectiveness_suitability: issue.effectiveness_suitability || "",
      effectiveness_date: issue.effectiveness_date || "",
      risk_analysis_p: issue.risk_analysis_p || false,
      risk_analysis_s: issue.risk_analysis_s || false,
      risk_analysis_r: issue.risk_analysis_r || false,
    });
  };

  return {
    selectedIssue,
    setSelectedIssue,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    selectIssue,
  };
}
