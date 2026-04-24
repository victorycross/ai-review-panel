import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PERSONAS = [
  { dim: "Responsible AI", role: "The Responsible AI Auditor", frame: "PwC Canada RA v5.0", color: "#7c3aed" },
  { dim: "Independence", role: "The Independence Officer", frame: "CPA Canada / IESBA / CPAO", color: "#0d9488" },
  { dim: "Cyber & Data Security", role: "The Cyber & Data Security Analyst", frame: "ISO/IEC 27001, NIST CSF, MITRE ATLAS", color: "#2563eb" },
  { dim: "Legal & Privacy", role: "The Legal & Privacy Counsel", frame: "Quebec Law 25, PIPEDA, GDPR", color: "#dc2626" },
  { dim: "AI Governance", role: "The AI Governance Lead", frame: "NIST AI RMF 1.0, ISO/IEC 42001:2023, OSFI B-13", color: "#4f46e5" },
  { dim: "Performance & Safety", role: "The Performance & Safety Evaluator", frame: "ISO/IEC 42001 §8, NIST AI RMF MEASURE", color: "#059669" },
];

const FRAMEWORKS = [
  "PwC Canada Responsible AI Framework v5.0",
  "CPA Canada / IESBA Code · CPAO Independence",
  "NIST AI RMF 1.0",
  "ISO/IEC 42001:2023",
  "Quebec Law 25 · PIPEDA",
  "OSFI B-13 (Technology and Cyber Risk)",
  "ISO/IEC 27001:2022 · NIST CSF 2.0",
  "MITRE ATLAS · OWASP ML Security Top 10",
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primary = user
    ? { label: "Open dashboard", href: "/home" }
    : { label: "Sign in", href: "/auth/login" };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-bg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-semibold text-ink text-sm tracking-tight">techassist</span>
            <span className="text-xs text-muted hidden sm:inline">· BrightPath Technologies</span>
          </Link>
          <Link
            href={primary.href}
            className="rounded-md bg-accent hover:bg-accent-hover px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {primary.label}
          </Link>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-5">
            AI System Review Panel
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.05] max-w-3xl">
            Six specialists.<br />
            One defensible risk report.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">
            techassist evaluates AI system deployments across six independent risk dimensions
            and surfaces compounding risks a single reviewer would miss — producing a
            board-ready report in 10–12 minutes.
          </p>
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <Link
              href={primary.href}
              className="inline-flex items-center gap-2 rounded-md bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              {primary.label} →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-bg hover:bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">
              The Panel
            </p>
            <h2 className="text-3xl font-bold text-ink tracking-tight mb-4">
              Not a checklist — a specialist review
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Each persona carries its own regulatory framework, judgment profile, and
              failure modes it systematically questions. A Panel Chair then identifies
              cross-dimensional risks no single specialist sees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERSONAS.map((p) => (
              <div
                key={p.dim}
                className="rounded-lg border border-border bg-surface p-5 space-y-2 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <p className="text-xs font-semibold text-muted uppercase tracking-widest">
                    {p.dim}
                  </p>
                </div>
                <p className="text-base font-semibold text-ink">{p.role}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{p.frame}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">
              Process
            </p>
            <h2 className="text-3xl font-bold text-ink tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              From intake to audit-ready PDF in about fifteen minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              num="01"
              title="Intake"
              time="5 min"
              body="Describe the AI system, its data, decision context, and governance posture. Generate clarifying questions tailored to the highest-risk dimensions."
            />
            <Step
              num="02"
              title="Panel Review"
              time="10–12 min"
              body="Six specialists stream their assessments in parallel. A Panel Chair synthesises cross-dimensional risks and issues a rated report."
            />
            <Step
              num="03"
              title="Report"
              time="Instant"
              body="Board-ready PDF with executive summary, risk heat map, per-dimension findings, and a prioritised remediation plan with owners and timelines."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">
              Frameworks
            </p>
            <h2 className="text-3xl font-bold text-ink tracking-tight mb-4">
              Grounded in the standards your auditors actually cite
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every finding references a specific clause. No hand-waving, no bluffing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {FRAMEWORKS.map((f) => (
              <div
                key={f}
                className="rounded-md border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm text-ink"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
          <h2 className="text-3xl font-bold text-ink tracking-tight">
            Ready to review your first AI system?
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Internal tool for BrightPath Technologies. Access is by invitation.
          </p>
          <div>
            <Link
              href={primary.href}
              className="inline-flex items-center gap-2 rounded-md bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              {primary.label} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-bg">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs text-muted">
              techassist · BrightPath Technologies
            </span>
          </div>
          <p className="text-xs text-muted">Confidential — For internal use only</p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  num,
  title,
  time,
  body,
}: {
  num: string;
  title: string;
  time: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-6 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-accent tracking-tight tabular-nums">{num}</p>
        <p className="text-xs text-muted font-mono">{time}</p>
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
