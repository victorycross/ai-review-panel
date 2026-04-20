"use client";

import Link from "next/link";
import { ExecutiveSummary } from "./executive-summary";
import { RiskMatrix } from "./risk-matrix";
import { FindingList } from "./finding-list";
import { PdfExportButton } from "./pdf-export";
import type { RiskReport } from "@/lib/types";

interface ReportViewProps {
  report: RiskReport;
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/history"
          className="text-xs text-muted hover:text-neutral-300 transition-colors flex items-center gap-1"
        >
          ← All assessments
        </Link>
        <PdfExportButton report={report} />
      </div>

      {/* Executive summary + recommendations */}
      <ExecutiveSummary report={report} />

      {/* Risk heat map */}
      <RiskMatrix report={report} />

      {/* Cross-examination */}
      {report.examinationText && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
            Cross-Dimensional Examination
          </h2>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
              {report.examinationText}
            </p>
          </div>
        </div>
      )}

      {/* Findings */}
      <FindingList assessments={report.assessments} />
    </div>
  );
}
