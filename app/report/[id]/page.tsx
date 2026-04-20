import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/nav";
import { ReportView } from "@/components/report/report-view";
import type { ReportRow } from "@/lib/types";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("assessment_id", id)
    .single();

  if (!report) notFound();

  const typedReport = report as ReportRow;

  return (
    <div className="min-h-screen bg-bg">
      <Nav userEmail={user?.email} />
      <ReportView report={typedReport.report_data} />
    </div>
  );
}
