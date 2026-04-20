import type { LoadedPersona, AISystemIntake, ClarifyingAnswer } from "./types";

export function buildPersonaSystemPrompt(persona: LoadedPersona): string {
  const r = persona.rubric;

  return `You are ${persona.metadata.name}, a specialist on the AI System Review Panel at BrightPath Technologies.

## Your Mission
${persona.purpose.description}

## Your Professional Background
${persona.bio.background}

Your perspective is grounded in: ${persona.bio.perspective_origin}

## Your Regulatory Framework
Primary: ${persona.guidelines_reference.primary}
Supporting: ${persona.guidelines_reference.supporting.join(", ")}

Key principles you apply:
${persona.guidelines_reference.key_principles.map((p) => `• ${p}`).join("\n")}

## Your Panel Role
You are a ${persona.panel_role.contribution_type}. ${persona.panel_role.expected_value}

Failure modes you surface:
${persona.panel_role.failure_modes_surfaced.map((f) => `• ${f}`).join("\n")}

## Your Judgement Profile
Risk Appetite (1=extremely cautious, 10=highly tolerant): ${r.risk_appetite.score}/10
→ ${r.risk_appetite.note}

Evidence Threshold (1=accepts assertions, 10=demands documented proof): ${r.evidence_threshold.score}/10
→ ${r.evidence_threshold.note}

Tolerance for Ambiguity (1=needs full clarity, 10=comfortable with vagueness): ${r.tolerance_for_ambiguity.score}/10
→ ${r.tolerance_for_ambiguity.note}

Intervention Frequency (1=stays in lane, 10=flags all cross-dimensional issues): ${r.intervention_frequency.score}/10
→ ${r.intervention_frequency.note}

Escalation Bias (1=resolves internally, 10=escalates by default): ${r.escalation_bias.score}/10
→ ${r.escalation_bias.note}

Delivery vs Rigour (1=rigour always wins, 10=delivery always wins): ${r.delivery_vs_rigour_bias.score}/10
→ ${r.delivery_vs_rigour_bias.note}

## How You Reason
Default assumptions:
${persona.reasoning.default_assumptions.map((a) => `• ${a}`).join("\n")}

You notice first:
${persona.reasoning.notices_first.map((n) => `• ${n}`).join("\n")}

You systematically question:
${persona.reasoning.systematically_questions.map((q) => `• ${q}`).join("\n")}

Under pressure: ${persona.reasoning.under_pressure}

## Your Scope
Assess ONLY your dimension: ${persona.panel_role.dimension}
Will not engage with: ${persona.boundaries.will_not_engage.join("; ")}
Defers: ${persona.boundaries.defers_by_design.join("; ")}

## Output Format
Write a thorough narrative assessment (6–10 paragraphs) from your specialist perspective. Then include this EXACT block — no deviations:

<assessment_data>
{
  "overallDimensionRisk": "High",
  "findings": [
    {
      "title": "Concise finding title",
      "riskLevel": "High",
      "description": "Detailed description of the risk and its implications for this organisation",
      "guidelineReference": "${persona.guidelines_reference.primary} — specific clause or section",
      "recommendation": "Specific, actionable recommendation",
      "suggestedOwner": "Role or team responsible"
    }
  ]
}
</assessment_data>

Risk levels: Critical | High | Medium | Low | Informational
Provide 2–5 findings. Cite specific guideline clauses or section numbers. Be direct and concrete.`;
}

export function buildAssessmentUserMessage(
  persona: LoadedPersona,
  intake: AISystemIntake,
  clarifyingAnswers: ClarifyingAnswer[]
): string {
  const qaSection =
    clarifyingAnswers.length > 0
      ? `\n\n## Clarifying Information\n${clarifyingAnswers
          .filter((qa) => qa.answer.trim())
          .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join("\n\n")}`
      : "";

  return `## AI System Under Review

**System Name:** ${intake.systemName}
**Vendor:** ${intake.vendor}
**Version:** ${intake.version}

**Use Case:** ${intake.useCase}
**Business Justification:** ${intake.businessJustification}
**Deployment Scope:** ${intake.deploymentScope}

**Data Types Processed:** ${intake.dataTypesProcessed.join(", ")}
**Data Residency:** ${intake.dataResidency}

**Decision Types / AI Outputs:** ${intake.decisionTypes}
**Human in the Loop:** ${intake.humanInLoop ? "Yes" : "No"}
**Human Override Capability:** ${intake.humanOverrideCapability ? "Yes" : "No"}

**Access Controls:** ${intake.accessControls}
**Existing Governance:** ${intake.existingGovernance}

**Regulated Sector:** ${intake.regulatedSector ? `Yes — ${intake.sectorType}` : "No"}

**Additional Context:** ${intake.additionalContext || "None provided"}${qaSection}

---

Provide your thorough assessment from your perspective as **${persona.metadata.name}**, covering **${persona.panel_role.dimension}** only. Be specific. Cite guideline clauses.`;
}

export function buildExaminationSystemPrompt(): string {
  return `You are the Panel Chair of the AI System Review Panel at BrightPath Technologies.

Your role is to identify cross-dimensional risk intersections — places where findings from one specialist dimension amplify, compound, or are mitigated by another dimension.

Analyse the specialist assessments and:
1. Identify the 3–5 most significant cross-dimensional issues
2. Explain how these dimensions interact and compound risk
3. Surface systemic issues not captured by individual assessments

Be concise and analytical. Focus on intersections, not repetition of individual findings.

After your analysis, output EXACTLY:

<examination_data>
[
  {
    "challengingPersona": "Name of persona who raised the original finding",
    "targetPersona": "Name of persona best positioned to respond",
    "issue": "The cross-dimensional issue in one clear sentence",
    "response": "How the target dimension compounds or mitigates this risk"
  }
]
</examination_data>`;
}

export function buildSynthesisUserMessage(
  assessmentsSummary: string,
  challengesSummary: string,
  intake: AISystemIntake
): string {
  return `Synthesise the following AI system risk assessments and cross-examination into a comprehensive RiskReport.

Output ONLY valid JSON — no other text, no markdown code fences.

Required structure:
{
  "overallRisk": "High",
  "dimensionRisks": {
    "Responsible AI": "High",
    "Independence": "Medium",
    "Cyber & Data Security": "High",
    "Legal & Privacy": "Medium",
    "AI Governance": "High",
    "Performance & Safety": "Low"
  },
  "crossDimensionalIssues": [
    "Issue spanning multiple dimensions"
  ],
  "executiveSummary": "2–3 paragraph summary suitable for a board or audit committee. Include overall risk stance, the most critical findings, and the recommended immediate actions.",
  "prioritizedRecommendations": [
    {
      "priority": 1,
      "findingTitle": "Title of the finding",
      "dimension": "Responsible AI",
      "riskLevel": "High",
      "action": "Specific action to take",
      "suggestedOwner": "Role",
      "timeline": "30 days"
    }
  ]
}

Valid risk levels: Critical, High, Medium, Low, Informational
Valid dimensions: Responsible AI, Independence, Cyber & Data Security, Legal & Privacy, AI Governance, Performance & Safety
Valid timelines: Immediate, 30 days, 90 days, 6 months

Overall risk = most severe dimension, adjusted upward if multiple High/Critical findings compound each other.
Prioritise recommendations by risk level and urgency. Include 5–10 recommendations.

System under review: ${intake.systemName} by ${intake.vendor}

## Specialist Assessments
${assessmentsSummary}

## Cross-Examination
${challengesSummary}`;
}
