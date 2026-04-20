import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { INTAKE_MODEL } from "@/lib/constants";
import type { ClarifyingQuestion, RiskDimension } from "@/lib/types";

const client = new Anthropic();

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured." }, { status: 503 });
  }

  const { intake } = await request.json();
  if (!intake?.systemName) {
    return NextResponse.json({ error: "Invalid intake data." }, { status: 400 });
  }

  const prompt = `You are a senior AI risk analyst preparing an AI system for multi-dimensional risk review.

Based on this AI system intake, generate exactly 5 clarifying questions that will meaningfully improve the quality of the risk assessment. Each question must target a specific risk gap evident from the intake data.

AI System:
- Name: ${intake.systemName}
- Vendor: ${intake.vendor}
- Use Case: ${intake.useCase}
- Data Types: ${intake.dataTypesProcessed?.join(", ")}
- Deployment Scope: ${intake.deploymentScope}
- Human in Loop: ${intake.humanInLoop}
- Regulated Sector: ${intake.regulatedSector ? intake.sectorType : "No"}
- Existing Governance: ${intake.existingGovernance}

Output valid JSON only — no other text:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear, specific question",
      "dimension": "Responsible AI"
    }
  ]
}

Valid dimensions: Responsible AI, Independence, Cyber & Data Security, Legal & Privacy, AI Governance, Performance & Safety
Ask 5 questions. Each must target a different dimension. Be specific to this system, not generic.`;

  try {
    const response = await client.messages.create({
      model: INTAKE_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
    const parsed = JSON.parse(text.trim());

    const questions: ClarifyingQuestion[] = (parsed.questions ?? []).map(
      (q: { id: string; question: string; dimension: RiskDimension }, i: number) => ({
        id: q.id ?? `q${i + 1}`,
        question: q.question,
        dimension: q.dimension,
      })
    );

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
