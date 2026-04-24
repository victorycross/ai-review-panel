import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/nav";
import { AssessmentList } from "@/components/history/assessment-list";
import type { ReportRow } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, assessments(system_name, vendor, created_at)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-bg">
      <Nav userEmail={user?.email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-ink">Assessments</h1>
            <p className="text-sm text-muted">
              {reports?.length ?? 0} review{reports?.length !== 1 ? "s" : ""} in this workspace
            </p>
          </div>
        </div>

        <AssessmentList reports={(reports as ReportRow[]) ?? []} />
      </main>
    </div>
  );
}
