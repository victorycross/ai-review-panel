import { NextResponse } from "next/server";
import { createAnthropicClient, checkApiKey } from "@/lib/client";
import { loadPanelPersonas } from "@/lib/personas";
import {
  buildPersonaSystemPrompt,
  buildAssessmentUserMessage,
  buildExaminationSystemPrompt,
  buildSynthesisUserMessage,
} from "@/lib/prompt-builder";
import { ASSESSMENT_MODEL } from "@/lib/constants";
import { extractJson } from "@/lib/json-extract";
import type {
  AISystemIntake,
  ClarifyingAnswer,
  CrossChallenge,
  Finding,
  LoadedPersona,
  PersonaAssessment,
  PrioritizedRecommendation,
  ReviewSessionEvent,
  RiskLevel,
  RiskReport,
} from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: Request) {
  const keyError = checkApiKey();
  if (keyError) return keyError;

  const body = await request.json();
  const intake: AISystemIntake = body.intake;
  const clarifyingAnswers: ClarifyingAnswer[] = body.clarifyingAnswers ?? [];

  if (!intake?.systemName) {
    return NextResponse.json({ error: "Invalid intake data." }, { status: 400 });
  }

  const stream = runFullAssessment(intake, clarifyingAnswers);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function runFullAssessment(
  intake: AISystemIntake,
  clarifyingAnswers: ClarifyingAnswer[]
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cancelled = false;
  let activeStream: { abort(): void } | null = null;

  return new ReadableStream({
    async start(controller) {
      function emit(event: ReviewSessionEvent) {
        if (cancelled) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        const personas = await loadPanelPersonas();
        const anthropic = createAnthropicClient();
        const completedAssessments: PersonaAssessment[] = [];

        emit({ type: "assessment_start", totalPersonas: personas.length });

        // Phase 1: Independent assessments
        for (const persona of personas) {
          if (cancelled) break;

          emit({
            type: "persona_start",
            personaId: persona.id,
            personaName: persona.metadata.name,
            dimension: persona.panel_role.dimension,
            color: persona.panel_role.color,
          });

          const systemPrompt = buildPersonaSystemPrompt(persona);
          const userMessage = buildAssessmentUserMessage(persona, intake, clarifyingAnswers);
          let fullText = "";

          const stream = anthropic.messages.stream({
            model: ASSESSMENT_MODEL,
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
          });
          activeStream = stream;

          for await (const event of stream) {
            if (cancelled) break;
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const token = event.delta.text;
              fullText += token;
              // Stream only the narrative (before the structured data tag)
              if (!fullText.includes("<assessment_data>")) {
                emit({ type: "persona_token", personaId: persona.id, token });
              }
            }
          }

          if (cancelled) return;

          const assessment = parsePersonaAssessment(persona, fullText);
          completedAssessments.push(assessment);
          emit({ type: "persona_complete", personaId: persona.id, assessment });
        }

        if (cancelled) return;

        // Phase 2: Cross-examination
        emit({ type: "examination_start" });

        const assessmentSummary = completedAssessments
          .map(
            (a) =>
              `### ${a.personaName} (${a.dimension})\nOverall Risk: ${a.overallDimensionRisk}\nFindings:\n${a.findings.map((f) => `- [${f.riskLevel}] ${f.title}: ${f.description.slice(0, 200)}`).join("\n")}`
          )
          .join("\n\n");

        let examinationText = "";
        const examinationStream = anthropic.messages.stream({
          model: ASSESSMENT_MODEL,
          max_tokens: 2000,
          system: buildExaminationSystemPrompt(),
          messages: [
            {
              role: "user",
              content: `Review these specialist assessments for cross-dimensional risk interactions:\n\n${assessmentSummary}`,
            },
          ],
        });
        activeStream = examinationStream;

        for await (const event of examinationStream) {
          if (cancelled) break;
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const token = event.delta.text;
            examinationText += token;
            if (!examinationText.includes("<examination_data>")) {
              emit({ type: "examination_token", token });
            }
          }
        }

        if (cancelled) return;

        const challenges = parseExaminationData(examinationText);
        const examinationNarrative = examinationText.split("<examination_data>")[0].trim();
        emit({
          type: "examination_complete",
          challenges,
          text: examinationNarrative,
        });

        // Phase 3: Synthesis
        const allFindingsText = completedAssessments
          .map(
            (a) =>
              `### ${a.personaName} (${a.dimension})\nOverall: ${a.overallDimensionRisk}\n${a.findings
                .map(
                  (f) =>
                    `- [${f.riskLevel}] ${f.title}\n  ${f.description}\n  Reference: ${f.guidelineReference}\n  Recommendation: ${f.recommendation}\n  Owner: ${f.suggestedOwner}`
                )
                .join("\n")}`
          )
          .join("\n\n");

        const challengesText =
          challenges.length > 0
            ? challenges
                .map((c) => `• ${c.challengingPersona} → ${c.targetPersona}: ${c.issue}`)
                .join("\n")
            : "No significant cross-dimensional issues identified.";

        const synthesisMessage = buildSynthesisUserMessage(
          allFindingsText,
          challengesText,
          intake
        );

        const synthesisResponse = await anthropic.messages.create({
          model: ASSESSMENT_MODEL,
          max_tokens: 3000,
          messages: [{ role: "user", content: synthesisMessage }],
        });

        const synthesisText =
          synthesisResponse.content.find((b) => b.type === "text")?.text ?? "{}";
        let synthesisData: {
          overallRisk?: RiskLevel;
          dimensionRisks?: Record<string, RiskLevel>;
          crossDimensionalIssues?: string[];
          executiveSummary?: string;
          prioritizedRecommendations?: PrioritizedRecommendation[];
        } = {};
        try {
          synthesisData = extractJson(synthesisText);
        } catch (err) {
          console.error("[assess] synthesis JSON parse failed:", err);
        }

        const allFindings: Finding[] = completedAssessments.flatMap((a) => a.findings);

        const report: RiskReport = {
          systemName: intake.systemName,
          vendor: intake.vendor,
          assessmentDate: new Date().toISOString(),
          overallRisk: synthesisData.overallRisk ?? "High",
          dimensionRisks: synthesisData.dimensionRisks ?? {},
          allFindings,
          crossDimensionalIssues: synthesisData.crossDimensionalIssues ?? [],
          executiveSummary: synthesisData.executiveSummary ?? "",
          prioritizedRecommendations: synthesisData.prioritizedRecommendations ?? [],
          assessments: completedAssessments,
          examinationText: examinationNarrative,
        };

        emit({ type: "synthesis_complete", report });
        emit({ type: "session_complete" });
        controller.close();
      } catch (err) {
        if (!cancelled) {
          emit({
            type: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
          controller.close();
        }
      }
    },
    cancel() {
      cancelled = true;
      activeStream?.abort();
    },
  });
}

function parsePersonaAssessment(
  persona: LoadedPersona,
  fullText: string
): PersonaAssessment {
  const narrative = fullText.split("<assessment_data>")[0].trim();
  let overallDimensionRisk: RiskLevel = "Medium";
  let findings: Finding[] = [];

  const match = fullText.match(/<assessment_data>([\s\S]*?)<\/assessment_data>/);
  if (match) {
    try {
      const data = extractJson<{
        overallDimensionRisk?: RiskLevel;
        findings?: Array<{
          title: string;
          riskLevel: RiskLevel;
          description: string;
          guidelineReference: string;
          recommendation: string;
          suggestedOwner: string;
        }>;
      }>(match[1]);
      overallDimensionRisk = data.overallDimensionRisk ?? "Medium";
      findings = (data.findings ?? []).map((f, i) => ({
        id: `${persona.id}-${i}`,
        dimension: persona.panel_role.dimension,
        riskLevel: f.riskLevel ?? "Medium",
        title: f.title ?? "",
        description: f.description ?? "",
        guidelineReference: f.guidelineReference ?? "",
        recommendation: f.recommendation ?? "",
        suggestedOwner: f.suggestedOwner ?? "",
      }));
    } catch (err) {
      console.error(`[assess] parsePersonaAssessment(${persona.id}) failed:`, err);
    }
  }

  return {
    personaId: persona.id,
    personaName: persona.metadata.name,
    dimension: persona.panel_role.dimension,
    color: persona.panel_role.color,
    overallDimensionRisk,
    findings,
    narrative,
    isComplete: true,
  };
}

function parseExaminationData(text: string): CrossChallenge[] {
  const match = text.match(/<examination_data>([\s\S]*?)<\/examination_data>/);
  if (!match) return [];
  try {
    return extractJson<CrossChallenge[]>(match[1]);
  } catch (err) {
    console.error("[assess] parseExaminationData failed:", err);
    return [];
  }
}

function checkApiKeyLocal() {
  return checkApiKey();
}
void checkApiKeyLocal;
