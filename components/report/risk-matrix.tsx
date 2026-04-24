import { RISK_DIMENSIONS, RISK_LEVELS, type RiskDimension, type RiskLevel, type RiskReport } from "@/lib/types";
import { DIMENSION_COLORS, RISK_LEVEL_COLORS } from "@/lib/constants";
import { RiskBadge } from "@/components/panel/risk-badge";

interface RiskMatrixProps {
  report: RiskReport;
}

export function RiskMatrix({ report }: RiskMatrixProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
        Risk Heat Map
      </h2>

      {/* Dimension rows */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] divide-y divide-border">
          {RISK_DIMENSIONS.map((dim) => {
            const level = report.dimensionRisks[dim];
            const color = DIMENSION_COLORS[dim];
            const assessment = report.assessments.find((a) => a.dimension === dim);
            const findingCount = assessment?.findings.length ?? 0;

            return (
              <div key={dim} className="grid grid-cols-[1fr_auto] items-center p-3 gap-4 hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-slate-700 truncate">{dim}</span>
                  {findingCount > 0 && (
                    <span className="text-xs text-muted shrink-0">
                      {findingCount} finding{findingCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <RiskBadge level={level} />
              </div>
            );
          })}
        </div>

        {/* Overall */}
        <div className="border-t-2 border-border bg-surface-2 p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Overall Risk</span>
          <RiskBadge level={report.overallRisk} size="lg" />
        </div>
      </div>

      {/* Cross-dimensional issues */}
      {report.crossDimensionalIssues.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Cross-Dimensional Issues
          </p>
          <ul className="space-y-1.5">
            {report.crossDimensionalIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted mt-1">•</span>
                <span className="text-sm text-slate-600">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
