"use client";

import { useReviewContext } from "@/lib/review-context";
import { PersonaCard } from "./persona-card";
import { RiskBadge } from "./risk-badge";

const STATUS_LABELS: Record<string, string> = {
  idle: "Idle",
  loading: "Starting…",
  assessing: "Assessing",
  examining: "Cross-examining",
  synthesizing: "Synthesising",
  saving: "Saving report…",
  complete: "Complete",
  error: "Error",
};

export function PanelStream() {
  const {
    sessionStatus,
    assessments,
    activePersonaId,
    examinationText,
    challenges,
    error,
  } = useReviewContext();

  const completedCount = assessments.filter((a) => a.isComplete).length;
  const totalPersonas = 6;

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sessionStatus !== "complete" && sessionStatus !== "error" && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-muted">
                {STATUS_LABELS[sessionStatus]}
              </span>
            </div>
          )}
          {sessionStatus === "assessing" && (
            <span className="text-sm text-muted">
              {completedCount} / {totalPersonas} complete
            </span>
          )}
        </div>
        {/* Progress bar */}
        {sessionStatus === "assessing" && (
          <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${(completedCount / totalPersonas) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-risk-critical/30 bg-risk-critical/10 p-4">
          <p className="text-sm text-risk-critical font-medium">Assessment failed</p>
          <p className="text-xs text-muted mt-1">{error}</p>
        </div>
      )}

      {/* Persona grid */}
      {assessments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <PersonaCard
              key={assessment.personaId}
              assessment={assessment}
              isActive={assessment.personaId === activePersonaId}
            />
          ))}
        </div>
      )}

      {/* Waiting for first persona */}
      {assessments.length === 0 && sessionStatus !== "error" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface h-32 flex items-center justify-center"
            >
              <p className="text-xs text-muted">Preparing…</p>
            </div>
          ))}
        </div>
      )}

      {/* Cross-examination */}
      {(sessionStatus === "examining" ||
        sessionStatus === "synthesizing" ||
        sessionStatus === "saving" ||
        sessionStatus === "complete") &&
        examinationText && (
          <div className="rounded-lg border border-border bg-surface p-5 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-accent" />
              <p className="text-sm font-semibold text-ink">
                Cross-Dimensional Examination
              </p>
              {sessionStatus === "examining" && (
                <span className="text-xs text-muted animate-pulse">Analysing…</span>
              )}
            </div>
            <p className="text-sm text-slate-600 streaming-text leading-relaxed">
              {examinationText}
              {sessionStatus === "examining" && (
                <span className="animate-blink">▋</span>
              )}
            </p>
            {challenges.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs text-muted uppercase tracking-wide font-medium">
                  Key Intersections
                </p>
                {challenges.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs text-slate-700 font-medium">
                      {c.challengingPersona} → {c.targetPersona}
                    </p>
                    <p className="text-xs text-slate-600">{c.issue}</p>
                    {c.response && (
                      <p className="text-xs text-muted italic">{c.response}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Synthesis in progress */}
      {(sessionStatus === "synthesizing" || sessionStatus === "saving") && (
        <div className="rounded-lg border border-border bg-surface p-5 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <p className="text-sm text-muted">
              {sessionStatus === "synthesizing"
                ? "Synthesising final risk report…"
                : "Saving report…"}
            </p>
          </div>
        </div>
      )}

      {/* Overall risk summary when done */}
      {sessionStatus === "saving" && assessments.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5 space-y-3 animate-fade-in">
          <p className="text-xs text-muted uppercase tracking-wide font-medium">
            Dimension Summary
          </p>
          <div className="flex flex-wrap gap-3">
            {assessments.map((a) => (
              <div key={a.personaId} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="text-xs text-slate-600">{a.dimension}</span>
                <RiskBadge level={a.overallDimensionRisk} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
