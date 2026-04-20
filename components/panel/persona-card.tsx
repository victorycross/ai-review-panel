"use client";

import { RiskBadge } from "./risk-badge";
import type { PersonaAssessment } from "@/lib/types";

interface PersonaCardProps {
  assessment: PersonaAssessment;
  isActive: boolean;
}

export function PersonaCard({ assessment, isActive }: PersonaCardProps) {
  const { personaName, dimension, color, overallDimensionRisk, narrative, isComplete, findings } =
    assessment;

  return (
    <div
      className={`rounded-lg border bg-surface transition-all duration-300 overflow-hidden ${
        isActive ? "border-opacity-60 shadow-lg" : "border-border"
      }`}
      style={isActive ? { borderColor: color } : undefined}
    >
      {/* Colour accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-muted uppercase tracking-wide truncate">
              {dimension}
            </p>
            <p className="text-sm font-semibold text-neutral-100 leading-tight">
              {personaName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: color }}
                />
                Evaluating
              </span>
            )}
            {isComplete && <RiskBadge level={overallDimensionRisk} />}
          </div>
        </div>

        {/* Streaming narrative */}
        {(isActive || isComplete) && narrative && (
          <div className="text-xs text-neutral-400 streaming-text max-h-48 overflow-y-auto border-t border-border pt-3 leading-relaxed">
            {narrative}
            {isActive && <span className="animate-blink ml-0.5">▋</span>}
          </div>
        )}

        {/* Findings summary when complete */}
        {isComplete && findings.length > 0 && (
          <div className="border-t border-border pt-3 space-y-1.5">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">
              {findings.length} Finding{findings.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-1">
              {findings.slice(0, 3).map((f) => (
                <div key={f.id} className="flex items-start gap-2">
                  <RiskBadge level={f.riskLevel} size="sm" />
                  <p className="text-xs text-neutral-400 leading-tight">{f.title}</p>
                </div>
              ))}
              {findings.length > 3 && (
                <p className="text-xs text-muted">+{findings.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Waiting state */}
        {!isActive && !isComplete && (
          <div className="h-8 flex items-center">
            <p className="text-xs text-muted italic">Waiting to evaluate…</p>
          </div>
        )}
      </div>
    </div>
  );
}
