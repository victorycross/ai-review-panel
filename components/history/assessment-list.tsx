"use client";

import Link from "next/link";
import { RiskBadge } from "@/components/panel/risk-badge";
import type { ReportRow } from "@/lib/types";

interface AssessmentListProps {
  reports: ReportRow[];
}

export function AssessmentList({ reports }: AssessmentListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center space-y-3">
        <p className="text-sm font-medium text-slate-600">No assessments yet</p>
        <p className="text-xs text-muted">
          Run your first AI system risk assessment to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="text-left px-4 py-3 text-xs font-medium text-muted">System</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted hidden sm:table-cell">Vendor</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted hidden md:table-cell">Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted">Risk</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-muted"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-bg">
          {reports.map((row) => {
            const date = new Date(row.created_at).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <tr key={row.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3.5">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-800 leading-tight">
                      {row.report_data.systemName}
                    </p>
                    <p className="text-xs text-muted sm:hidden">{row.report_data.vendor}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 hidden sm:table-cell">
                  {row.report_data.vendor}
                </td>
                <td className="px-4 py-3.5 text-slate-600 text-xs hidden md:table-cell">
                  {date}
                </td>
                <td className="px-4 py-3.5">
                  <RiskBadge level={row.overall_risk} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/report/${row.assessment_id}`}
                    className="text-xs text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    View Report →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
