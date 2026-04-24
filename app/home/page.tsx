import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/nav";
import { RiskBadge } from "@/components/panel/risk-badge";
import type { ReportRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, assessments(system_name, vendor, created_at)")
    .order("created_at", { ascending: false })
    .limit(5);

  const recent = (reports as ReportRow[] | null) ?? [];
  const totalCount = recent.length;

  return (
    <div className="min-h-screen bg-bg">
      <Nav userEmail={user?.email} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Start a new panel review or pick up where you left off. Each assessment
            covers six specialist dimensions and produces a board-ready report.
          </p>
        </section>

        <Link
          href="/intake"
          className="block rounded-lg border-l-4 border-accent bg-accent-soft p-6 hover:bg-accent-tint transition-colors group"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="space-y-1 max-w-2xl">
              <p className="text-xs font-semibold text-accent tracking-widest uppercase">
                New Assessment
              </p>
              <p className="text-lg font-semibold text-ink">
                Start a fresh AI system risk review
              </p>
              <p className="text-sm text-slate-600">
                Describe your system. The panel delivers a rated report in 10–12 minutes.
              </p>
            </div>
            <div className="shrink-0 rounded-md bg-accent group-hover:bg-accent-hover px-5 py-2.5 text-sm font-semibold text-white transition-colors">
              Begin →
            </div>
          </div>
        </Link>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Assessments</h2>
            {totalCount > 0 && (
              <Link
                href="/history"
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center space-y-2">
              <p className="text-sm font-medium text-ink">No assessments yet</p>
              <p className="text-xs text-slate-600">
                Your recent reviews will appear here once you run your first assessment.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden bg-bg">
              {recent.map((row, i) => {
                const date = new Date(row.created_at).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <Link
                    key={row.id}
                    href={`/report/${row.assessment_id}`}
                    className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface transition-colors ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-medium text-ink leading-tight truncate">
                        {row.report_data.systemName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {row.report_data.vendor} · {date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <RiskBadge level={row.overall_risk} />
                      <span className="text-xs font-medium text-accent">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
