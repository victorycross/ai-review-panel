import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPdfDocument } from "./pdf-document";
import type { RiskReport } from "@/lib/types";

export default function PdfDownloadSection({ report }: { report: RiskReport }) {
  const filename = `${report.systemName.replace(/\s+/g, "-").toLowerCase()}-risk-assessment-${new Date(report.assessmentDate).toISOString().split("T")[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<ReportPdfDocument report={report} />}
      fileName={filename}
    >
      {({ loading, error }) => (
        <button
          disabled={loading || !!error}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm text-slate-800 transition-colors"
        >
          {loading ? "Generating PDF…" : error ? "PDF error" : "Export PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
