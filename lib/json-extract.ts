/**
 * Robust JSON extraction for LLM-generated text that may include:
 * - Markdown code fences (```json ... ``` or ``` ... ```)
 * - Leading/trailing prose ("Here's the JSON:")
 * - XML-like tags around the JSON
 *
 * Returns the parsed JSON, or throws if no valid JSON object/array can be found.
 */
export function extractJson<T = unknown>(text: string): T {
  const trimmed = text.trim();

  // 1. Try direct parse first (fast path for clean responses)
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // fall through
  }

  // 2. Strip Markdown fences if present: ```json\n...\n``` or ```\n...\n```
  const fenceMatch = trimmed.match(/```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // fall through
    }
  }

  // 3. Find first balanced { ... } or [ ... ] in the text
  const objectSlice = sliceFirstBalanced(trimmed, "{", "}");
  if (objectSlice) {
    try {
      return JSON.parse(objectSlice) as T;
    } catch {
      // fall through
    }
  }
  const arraySlice = sliceFirstBalanced(trimmed, "[", "]");
  if (arraySlice) {
    try {
      return JSON.parse(arraySlice) as T;
    } catch {
      // fall through
    }
  }

  throw new Error(
    `Failed to extract JSON from LLM response (first 200 chars): ${trimmed.slice(0, 200)}`
  );
}

/**
 * Find the first balanced pair of open/close brackets in text,
 * respecting JSON string escaping.
 */
function sliceFirstBalanced(
  text: string,
  open: string,
  close: string
): string | null {
  const start = text.indexOf(open);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
