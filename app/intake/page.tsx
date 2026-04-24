import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/nav";
import { SystemForm } from "@/components/intake/system-form";
import { ClarifyingQuestions } from "@/components/intake/clarifying-questions";

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-bg">
      <Nav userEmail={user?.email} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-ink">New Assessment</h1>
          <p className="text-sm text-muted">
            Describe the AI system under review. The panel will evaluate it across 6 risk
            dimensions: Responsible AI, Independence, Cyber &amp; Data Security, Legal &amp;
            Privacy, AI Governance, and Performance &amp; Safety.
          </p>
        </div>

        <SystemForm />
        <ClarifyingQuestions />
      </main>
    </div>
  );
}
