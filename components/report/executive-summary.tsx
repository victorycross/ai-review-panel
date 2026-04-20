import { RiskBadge } from "@/components/panel/risk-badge";
import type { RiskReport } from "@/lib/types";

interface ExecutiveSummaryProps {
  report: RiskReport;
}

export function ExecutiveSummary({ report }: ExecutiveSummaryProps) {
  const date = new Date(report.assessmentDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-neutral-100 tracking-tight">
            {report.systemName}
          </h1>
          <p className="text-sm text-muted">
            {report.vendor} · AI Risk Assessment · {date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Overall</span>
          <RiskBadge level={report.overallRisk} size="lg" />
        </div>
      </div>

      {/* Executive summary */}
      <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest">
          Executive Summary
        </p>
        <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
          {report.executiveSummary.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Prioritised recommendations */}
      {report.prioritizedRecommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
            Prioritised Recommendations
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted w-8">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Finding</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted hidden md:table-cell">Action</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Timeline</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.prioritizedRecommendations.map((rec) => (
                  <tr key={rec.priority} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted font-mono">
                      {rec.priority}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-sm text-neutral-200 font-medium">
                          {rec.findingTitle}
                        </p>
                        <p className="text-xs text-muted">{rec.dimension}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 hidden md:table-cell max-w-xs">
                      {rec.action}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 hidden sm:table-cell">
                      {rec.suggestedOwner}
                    </td>
                    <td className="px-4 py-3">
                      <TimelineBadge timeline={rec.timeline} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={rec.riskLevel} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineBadge({ timeline }: { timeline: string }) {
  const colorClass =
    timeline === "Immediate"
      ? "text-risk-critical bg-risk-critical/10 border-risk-critical/30"
      : timeline === "30 days"
        ? "text-risk-high bg-risk-high/10 border-risk-high/30"
        : timeline === "90 days"
          ? "text-risk-medium bg-risk-medium/10 border-risk-medium/30"
          : "text-risk-low bg-risk-low/10 border-risk-low/30";

  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-mono ${colorClass}`}
    >
      {timeline}
    </span>
  );
}
