export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Informational";

export type RiskDimension =
  | "Responsible AI"
  | "Independence"
  | "Cyber & Data Security"
  | "Legal & Privacy"
  | "AI Governance"
  | "Performance & Safety";

export const RISK_DIMENSIONS: RiskDimension[] = [
  "Responsible AI",
  "Independence",
  "Cyber & Data Security",
  "Legal & Privacy",
  "AI Governance",
  "Performance & Safety",
];

export const RISK_LEVELS: RiskLevel[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
  "Informational",
];

export interface Finding {
  id: string;
  dimension: RiskDimension;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  guidelineReference: string;
  recommendation: string;
  suggestedOwner: string;
}

export interface PersonaAssessment {
  personaId: string;
  personaName: string;
  dimension: RiskDimension;
  color: string;
  overallDimensionRisk: RiskLevel;
  findings: Finding[];
  narrative: string;
  isComplete: boolean;
}

export interface CrossChallenge {
  challengingPersona: string;
  targetPersona: string;
  issue: string;
  response: string;
}

export interface PrioritizedRecommendation {
  priority: number;
  findingTitle: string;
  dimension: RiskDimension;
  riskLevel: RiskLevel;
  action: string;
  suggestedOwner: string;
  timeline: "Immediate" | "30 days" | "90 days" | "6 months";
}

export interface RiskReport {
  systemName: string;
  vendor: string;
  assessmentDate: string;
  overallRisk: RiskLevel;
  dimensionRisks: Record<RiskDimension, RiskLevel>;
  allFindings: Finding[];
  crossDimensionalIssues: string[];
  executiveSummary: string;
  prioritizedRecommendations: PrioritizedRecommendation[];
  assessments: PersonaAssessment[];
  examinationText: string;
}

export interface AISystemIntake {
  systemName: string;
  vendor: string;
  version: string;
  useCase: string;
  businessJustification: string;
  dataTypesProcessed: string[];
  dataResidency: string;
  decisionTypes: string;
  humanInLoop: boolean;
  humanOverrideCapability: boolean;
  accessControls: string;
  existingGovernance: string;
  deploymentScope: "Internal only" | "Client-facing" | "Public";
  regulatedSector: boolean;
  sectorType: string;
  additionalContext: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  dimension: RiskDimension;
}

export interface ClarifyingAnswer {
  questionId: string;
  question: string;
  answer: string;
}

// SSE event stream types
export type ReviewSessionEvent =
  | { type: "assessment_start"; totalPersonas: number }
  | {
      type: "persona_start";
      personaId: string;
      personaName: string;
      dimension: RiskDimension;
      color: string;
    }
  | { type: "persona_token"; personaId: string; token: string }
  | { type: "persona_complete"; personaId: string; assessment: PersonaAssessment }
  | { type: "examination_start" }
  | { type: "examination_token"; token: string }
  | {
      type: "examination_complete";
      challenges: CrossChallenge[];
      text: string;
    }
  | { type: "synthesis_complete"; report: RiskReport }
  | { type: "session_complete" }
  | { type: "error"; message: string };

export type FlowStep = "intake" | "reviewing" | "complete";

export type SessionStatus =
  | "idle"
  | "loading"
  | "assessing"
  | "examining"
  | "synthesizing"
  | "saving"
  | "complete"
  | "error";

// Persona YAML config
export interface PersonaRubricDimension {
  score: number;
  note: string;
}

export interface PersonaConfig {
  metadata: {
    name: string;
    version: string;
  };
  purpose: {
    description: string;
    invoke_when: string[];
  };
  bio: {
    background: string;
    perspective_origin: string;
  };
  panel_role: {
    dimension: RiskDimension;
    color: string;
    contribution_type: string;
    expected_value: string;
    failure_modes_surfaced: string[];
  };
  rubric: {
    risk_appetite: PersonaRubricDimension;
    evidence_threshold: PersonaRubricDimension;
    tolerance_for_ambiguity: PersonaRubricDimension;
    intervention_frequency: PersonaRubricDimension;
    escalation_bias: PersonaRubricDimension;
    delivery_vs_rigour_bias: PersonaRubricDimension;
  };
  reasoning: {
    default_assumptions: string[];
    notices_first: string[];
    systematically_questions: string[];
    under_pressure: string;
  };
  interaction: {
    primary_mode: string;
    challenge_strength: string;
    silent_when: string[];
    handles_poor_input: string;
  };
  boundaries: {
    will_not_engage: string[];
    will_not_claim: string[];
    defers_by_design: string[];
  };
  guidelines_reference: {
    primary: string;
    supporting: string[];
    key_principles: string[];
  };
}

export interface LoadedPersona extends PersonaConfig {
  id: string;
}

// Supabase DB row types
export interface AssessmentRow {
  id: string;
  user_id: string;
  system_name: string;
  vendor: string;
  intake_data: AISystemIntake;
  clarifying_qa: ClarifyingAnswer[];
  status: "in_progress" | "complete" | "failed";
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  assessment_id: string;
  user_id: string;
  report_data: RiskReport;
  overall_risk: RiskLevel;
  created_at: string;
  assessments?: AssessmentRow;
}
