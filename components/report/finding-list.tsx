"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/panel/risk-badge";
import { DIMENSION_COLORS } from "@/lib/constants";
import type { PersonaAssessment, RiskDimension } from "@/lib/types";

interface FindingListProps {
  assessments: PersonaAssessment[];
}

export function FindingList({ assessments }: FindingListProps) {
  const [openDimension, setOpenDimension] = useState<RiskDimension | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
        Findings by Dimension
      </h2>

      <div className="space-y-2">
        {assessments.map((assessment) => {
          const isOpen = openDimension === assessment.dimension;
          const color = DIMENSION_COLORS[assessment.dimension];

          return (
            <div
              key={assessment.personaId}
              className="rounded-lg border border-border bg-surface overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenDimension(isOpen ? null : assessment.dimension)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    {assessment.dimension}
                  </span>
                  <span className="text-xs text-muted">
                    {assessment.personaName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {assessment.findings.length} finding
                    {assessment.findings.length !== 1 ? "s" : ""}
                  </span>
                  <RiskBadge level={assessment.overallDimensionRisk} />
                  <span className="text-muted text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {/* Narrative */}
                  {assessment.narrative && (
                    <div className="p-4 bg-bg">
                      <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                        Assessment Narrative
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed streaming-text">
                        {assessment.narrative}
                      </p>
                    </div>
                  )}

                  {/* Findings */}
                  {assessment.findings.map((finding, i) => (
                    <div key={finding.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted font-mono">
                            {i + 1}.
                          </span>
                          <p className="text-sm font-medium text-slate-800">
                            {finding.title}
                          </p>
                        </div>
                        <RiskBadge level={finding.riskLevel} />
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {finding.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <DetailCell
                          label="Guideline Reference"
                          value={finding.guidelineReference}
                        />
                        <DetailCell
                          label="Recommendation"
                          value={finding.recommendation}
                        />
                        <DetailCell
                          label="Suggested Owner"
                          value={finding.suggestedOwner}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{value}</p>
    </div>
  );
}
