"use client";

import { useReviewContext } from "@/lib/review-context";
import { DIMENSION_COLORS } from "@/lib/constants";
import type { ClarifyingAnswer } from "@/lib/types";

export function ClarifyingQuestions() {
  const {
    intake,
    clarifyingQuestions,
    clarifyingAnswers,
    setClarifyingAnswer,
    startReview,
    questionsLoading,
    sessionStatus,
  } = useReviewContext();

  // Only hide entirely before the user has submitted the intake form.
  // Once `intake` is set (user clicked "Generate Clarifying Questions"),
  // always show this component — with skeletons while loading, with questions
  // if they arrived, or with a fallback "Begin Panel Review" button if the
  // clarify step failed / returned no questions.
  if (!intake && clarifyingQuestions.length === 0 && !questionsLoading) return null;

  const buildAnswers = (): ClarifyingAnswer[] =>
    clarifyingQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: clarifyingAnswers[q.id] ?? "",
    }));

  const handleBeginReview = () => {
    if (!intake) return;
    startReview(intake, buildAnswers());
  };

  const isLoading = sessionStatus === "loading";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-accent" />
        <h2 className="text-sm font-semibold text-ink">Clarifying Questions</h2>
        <p className="text-xs text-muted">Optional — answer what you can</p>
      </div>

      {questionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4 space-y-2 animate-pulse">
              <div className="h-3 w-16 bg-border rounded" />
              <div className="h-4 w-3/4 bg-border rounded" />
              <div className="h-16 w-full bg-bg rounded-md" />
            </div>
          ))}
        </div>
      ) : clarifyingQuestions.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          No clarifying questions were generated. You can proceed directly to the
          panel review — the assessors will evaluate the system based on the intake
          you provided.
        </div>
      ) : (
        <div className="space-y-3">
          {clarifyingQuestions.map((q) => {
            const color = DIMENSION_COLORS[q.dimension] ?? "#64748b";
            return (
              <div
                key={q.id}
                className="rounded-lg border border-border bg-surface p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {q.dimension}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{q.question}</p>
                <textarea
                  value={clarifyingAnswers[q.id] ?? ""}
                  onChange={(e) => setClarifyingAnswer(q.id, e.target.value)}
                  rows={2}
                  placeholder="Your answer (optional)…"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-slate-800 placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            );
          })}
        </div>
      )}

      {!questionsLoading && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">
            The panel will evaluate your AI system across 6 risk dimensions using Opus 4.7.
            This takes 8–12 minutes.
          </p>
          <button
            onClick={handleBeginReview}
            disabled={isLoading}
            className="shrink-0 inline-flex items-center gap-2 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {isLoading ? "Starting…" : "Begin Panel Review →"}
          </button>
        </div>
      )}
    </div>
  );
}
