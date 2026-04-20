"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AISystemIntake,
  ClarifyingAnswer,
  ClarifyingQuestion,
  CrossChallenge,
  FlowStep,
  PersonaAssessment,
  ReviewSessionEvent,
  RiskReport,
  SessionStatus,
} from "./types";

interface ReviewContextValue {
  step: FlowStep;
  intake: AISystemIntake | null;
  clarifyingQuestions: ClarifyingQuestion[];
  clarifyingAnswers: Record<string, string>;
  sessionStatus: SessionStatus;
  assessments: PersonaAssessment[];
  activePersonaId: string | null;
  examinationText: string;
  challenges: CrossChallenge[];
  report: RiskReport | null;
  savedAssessmentId: string | null;
  error: string | null;
  questionsLoading: boolean;
  setIntake: (intake: AISystemIntake) => void;
  setClarifyingAnswer: (id: string, answer: string) => void;
  generateClarifyingQuestions: (intake: AISystemIntake) => Promise<void>;
  startReview: (intake: AISystemIntake, answers: ClarifyingAnswer[]) => Promise<void>;
  reset: () => void;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function useReviewContext() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviewContext must be used within ReviewProvider");
  return ctx;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const tokenBufferRef = useRef<Map<string, string>>(new Map());
  const rafPendingRef = useRef(false);

  const [step, setStep] = useState<FlowStep>("intake");
  const [intake, setIntake] = useState<AISystemIntake | null>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarifyingAnswers, setClarifyingAnswersState] = useState<Record<string, string>>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [assessments, setAssessments] = useState<PersonaAssessment[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [examinationText, setExaminationText] = useState("");
  const [challenges, setChallenges] = useState<CrossChallenge[]>([]);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setClarifyingAnswer = useCallback((id: string, answer: string) => {
    setClarifyingAnswersState((prev) => ({ ...prev, [id]: answer }));
  }, []);

  const generateClarifyingQuestions = useCallback(async (intakeData: AISystemIntake) => {
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/intake/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: intakeData }),
      });
      const data = await res.json();
      setClarifyingQuestions(data.questions ?? []);
    } catch {
      // Silent fail — reviewer can proceed without clarifying questions
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  function scheduleTokenFlush() {
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      const buffered = new Map(tokenBufferRef.current);
      tokenBufferRef.current.clear();
      if (buffered.size === 0) return;
      setAssessments((prev) =>
        prev.map((a) => {
          const extra = buffered.get(a.personaId);
          return extra ? { ...a, narrative: a.narrative + extra } : a;
        })
      );
    });
  }

  function handleEvent(event: ReviewSessionEvent) {
    switch (event.type) {
      case "assessment_start":
        setSessionStatus("assessing");
        break;

      case "persona_start":
        setActivePersonaId(event.personaId);
        setAssessments((prev) => [
          ...prev,
          {
            personaId: event.personaId,
            personaName: event.personaName,
            dimension: event.dimension,
            color: event.color,
            overallDimensionRisk: "Informational",
            findings: [],
            narrative: "",
            isComplete: false,
          },
        ]);
        break;

      case "persona_token": {
        const buf = tokenBufferRef.current;
        buf.set(event.personaId, (buf.get(event.personaId) ?? "") + event.token);
        scheduleTokenFlush();
        break;
      }

      case "persona_complete":
        setActivePersonaId(null);
        setAssessments((prev) =>
          prev.map((a) =>
            a.personaId === event.personaId ? { ...event.assessment } : a
          )
        );
        break;

      case "examination_start":
        setSessionStatus("examining");
        break;

      case "examination_token":
        setExaminationText((prev) => prev + event.token);
        break;

      case "examination_complete":
        setChallenges(event.challenges);
        setExaminationText(event.text);
        setSessionStatus("synthesizing");
        break;

      case "synthesis_complete":
        setReport(event.report);
        break;

      case "session_complete":
        setSessionStatus("saving");
        break;

      case "error":
        setError(event.message);
        setSessionStatus("error");
        break;
    }
  }

  const startReview = useCallback(
    async (intakeData: AISystemIntake, answers: ClarifyingAnswer[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStep("reviewing");
      setSessionStatus("loading");
      setAssessments([]);
      setActivePersonaId(null);
      setExaminationText("");
      setChallenges([]);
      setReport(null);
      setSavedAssessmentId(null);
      setError(null);
      router.push("/review");

      try {
        const res = await fetch("/api/review/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intake: intakeData, clarifyingAnswers: answers }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Assessment failed (${res.status})`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const match = line.match(/^data: (.+)$/m);
            if (!match) continue;
            try {
              const event: ReviewSessionEvent = JSON.parse(match[1]);
              handleEvent(event);

              if (event.type === "session_complete") {
                // Flush remaining tokens
                const buffered = new Map(tokenBufferRef.current);
                tokenBufferRef.current.clear();
                if (buffered.size > 0) {
                  setAssessments((prev) =>
                    prev.map((a) => {
                      const extra = buffered.get(a.personaId);
                      return extra ? { ...a, narrative: a.narrative + extra } : a;
                    })
                  );
                }

                // Save to Supabase
                setReport((completedReport) => {
                  if (!completedReport) return completedReport;
                  fetch("/api/report/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      intake: intakeData,
                      clarifyingQa: answers,
                      report: completedReport,
                    }),
                  })
                    .then((r) => r.json())
                    .then((data) => {
                      setSavedAssessmentId(data.assessmentId);
                      setSessionStatus("complete");
                      setStep("complete");
                      router.push(`/report/${data.assessmentId}`);
                    })
                    .catch(() => {
                      setSessionStatus("complete");
                      setStep("complete");
                    });
                  return completedReport;
                });
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setSessionStatus("error");
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStep("intake");
    setIntake(null);
    setClarifyingQuestions([]);
    setClarifyingAnswersState({});
    setSessionStatus("idle");
    setAssessments([]);
    setActivePersonaId(null);
    setExaminationText("");
    setChallenges([]);
    setReport(null);
    setSavedAssessmentId(null);
    setError(null);
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        step,
        intake,
        clarifyingQuestions,
        clarifyingAnswers,
        sessionStatus,
        assessments,
        activePersonaId,
        examinationText,
        challenges,
        report,
        savedAssessmentId,
        error,
        questionsLoading,
        setIntake,
        setClarifyingAnswer,
        generateClarifyingQuestions,
        startReview,
        reset,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}
