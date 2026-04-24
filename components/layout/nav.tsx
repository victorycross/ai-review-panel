"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useReviewContext } from "@/lib/review-context";

interface NavProps {
  userEmail?: string;
}

export function Nav({ userEmail }: NavProps) {
  const router = useRouter();
  const { reset } = useReviewContext();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleNewAssessment = () => {
    reset();
    router.push("/intake");
  };

  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-semibold text-ink text-sm tracking-tight">
              techassist
            </span>
          </Link>
          <Link
            href="/history"
            className="text-sm text-muted hover:text-slate-700 transition-colors"
          >
            History
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewAssessment}
            className="rounded-md bg-accent hover:bg-accent-hover px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            New Assessment
          </button>
          {userEmail && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted hidden sm:block">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-muted hover:text-slate-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
