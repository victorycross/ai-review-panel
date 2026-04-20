import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export function createAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function checkApiKey(): NextResponse | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured." },
      { status: 503 }
    );
  }
  return null;
}

export function apiErrorResponse(err: unknown): NextResponse {
  if (err instanceof Anthropic.AuthenticationError) {
    return NextResponse.json({ error: "API key is invalid." }, { status: 503 });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return NextResponse.json(
      { error: "Rate limit reached. Please try again shortly." },
      { status: 429 }
    );
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return NextResponse.json(
      { error: "Could not reach the AI service. Please try again." },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 }
  );
}
