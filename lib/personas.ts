import path from "path";
import fs from "fs/promises";
import yaml from "yaml";
import type { LoadedPersona } from "./types";

const PERSONA_FILES = [
  { id: "responsible-ai-auditor", file: "responsible-ai-auditor.yaml" },
  { id: "independence-officer", file: "independence-officer.yaml" },
  { id: "cyber-security-analyst", file: "cyber-security-analyst.yaml" },
  { id: "legal-privacy-counsel", file: "legal-privacy-counsel.yaml" },
  { id: "ai-governance-lead", file: "ai-governance-lead.yaml" },
  { id: "performance-safety-evaluator", file: "performance-safety-evaluator.yaml" },
];

let cachedPersonas: LoadedPersona[] | null = null;

export async function loadPanelPersonas(): Promise<LoadedPersona[]> {
  if (cachedPersonas) return cachedPersonas;

  const personaDir = path.join(process.cwd(), "personas");

  const personas = await Promise.all(
    PERSONA_FILES.map(async ({ id, file }) => {
      const content = await fs.readFile(path.join(personaDir, file), "utf-8");
      const parsed = yaml.parse(content);
      return { ...parsed, id } as LoadedPersona;
    })
  );

  cachedPersonas = personas;
  return cachedPersonas;
}
