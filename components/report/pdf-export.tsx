"use client";

import dynamic from "next/dynamic";
import type { RiskReport } from "@/lib/types";

// Load the entire PDF section client-side to avoid SSR issues with @react-pdf/renderer
const PdfDownloadSection = dynamic(() => import("./pdf-download-section"), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm text-muted cursor-not-allowed"
    >
      Preparing PDF…
    </button>
  ),
});

export function PdfExportButton({ report }: { report: RiskReport }) {
  return <PdfDownloadSection report={report} />;
}
