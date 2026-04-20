export const ASSESSMENT_MODEL = "claude-opus-4-7";
export const INTAKE_MODEL = "claude-haiku-4-5-20251001";

export const RISK_LEVEL_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
  Informational: "#64748b",
};

export const RISK_LEVEL_BG: Record<string, string> = {
  Critical: "bg-risk-critical/10 text-risk-critical border-risk-critical/30",
  High: "bg-risk-high/10 text-risk-high border-risk-high/30",
  Medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
  Low: "bg-risk-low/10 text-risk-low border-risk-low/30",
  Informational: "bg-risk-informational/10 text-risk-informational border-risk-informational/30",
};

export const DIMENSION_COLORS: Record<string, string> = {
  "Responsible AI": "#7c3aed",
  Independence: "#0d9488",
  "Cyber & Data Security": "#2563eb",
  "Legal & Privacy": "#dc2626",
  "AI Governance": "#4f46e5",
  "Performance & Safety": "#059669",
};

export const DATA_TYPE_OPTIONS = [
  "Personal Identifiable Information (PII)",
  "Financial / Payment Data",
  "Health / Medical Information",
  "Employment / HR Data",
  "Authentication / Credentials",
  "Location / Tracking Data",
  "Legal / Compliance Records",
  "Proprietary Business Data",
  "Third-Party / Client Data",
  "Public / Non-sensitive Data",
];

export const SECTOR_OPTIONS = [
  "Financial Services",
  "Healthcare & Life Sciences",
  "Legal Services",
  "Insurance",
  "Government / Public Sector",
  "Professional Services",
  "Technology",
  "Other",
];
