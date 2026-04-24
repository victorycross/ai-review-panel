"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReviewContext } from "@/lib/review-context";
import { PanelStream } from "@/components/panel/panel-stream";

export default function ReviewPage() {
  const router = useRouter();
  const { step, sessionStatus } = useReviewContext();

  // Redirect if arrived here without an active session
  useEffect(() => {
    if (step === "intake" && sessionStatus === "idle") {
      router.replace("/intake");
    }
  }, [step, sessionStatus, router]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Minimal header during review */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold text-ink text-sm tracking-tight">
            techassist
          </span>
          <span className="text-muted text-sm">· Panel Review in Progress</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-base font-semibold text-ink">
            AI System Review Panel
          </h1>
          <p className="text-xs text-muted">
            Six specialist personas are independently evaluating the AI system.
            This takes 8–12 minutes. Do not close this tab.
          </p>
        </div>
        <PanelStream />
      </main>
    </div>
  );
}
