"use client";

import { useState } from "react";
import { useReviewContext } from "@/lib/review-context";
import { DATA_TYPE_OPTIONS, SECTOR_OPTIONS } from "@/lib/constants";
import type { AISystemIntake } from "@/lib/types";

const EMPTY_INTAKE: AISystemIntake = {
  systemName: "",
  vendor: "",
  version: "",
  useCase: "",
  businessJustification: "",
  dataTypesProcessed: [],
  dataResidency: "",
  decisionTypes: "",
  humanInLoop: false,
  humanOverrideCapability: false,
  accessControls: "",
  existingGovernance: "",
  deploymentScope: "Internal only",
  regulatedSector: false,
  sectorType: "",
  additionalContext: "",
};

export function SystemForm() {
  const { generateClarifyingQuestions, questionsLoading, setIntake } = useReviewContext();
  const [form, setForm] = useState<AISystemIntake>(EMPTY_INTAKE);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof AISystemIntake>(key: K, value: AISystemIntake[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleDataType = (type: string) =>
    set(
      "dataTypesProcessed",
      form.dataTypesProcessed.includes(type)
        ? form.dataTypesProcessed.filter((t) => t !== type)
        : [...form.dataTypesProcessed, type]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntake(form);
    setSubmitted(true);
    await generateClarifyingQuestions(form);
  };

  const isValid =
    form.systemName.trim() &&
    form.vendor.trim() &&
    form.useCase.trim() &&
    form.dataTypesProcessed.length > 0 &&
    form.decisionTypes.trim();

  if (submitted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* System Details */}
      <Section title="System Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="System Name *">
            <input
              type="text"
              value={form.systemName}
              onChange={(e) => set("systemName", e.target.value)}
              required
              placeholder="e.g. Copilot for Finance"
              className={inputClass}
            />
          </Field>
          <Field label="Vendor *">
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => set("vendor", e.target.value)}
              required
              placeholder="e.g. Microsoft"
              className={inputClass}
            />
          </Field>
          <Field label="Version / Release">
            <input
              type="text"
              value={form.version}
              onChange={(e) => set("version", e.target.value)}
              placeholder="e.g. 2024.3"
              className={inputClass}
            />
          </Field>
          <Field label="Deployment Scope *">
            <select
              value={form.deploymentScope}
              onChange={(e) =>
                set("deploymentScope", e.target.value as AISystemIntake["deploymentScope"])
              }
              className={inputClass}
            >
              <option>Internal only</option>
              <option>Client-facing</option>
              <option>Public</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Use Case */}
      <Section title="Use Case">
        <div className="space-y-4">
          <Field label="Use Case Description *">
            <textarea
              value={form.useCase}
              onChange={(e) => set("useCase", e.target.value)}
              required
              rows={3}
              placeholder="Describe what the AI system does and how it is used day-to-day"
              className={inputClass}
            />
          </Field>
          <Field label="Business Justification">
            <textarea
              value={form.businessJustification}
              onChange={(e) => set("businessJustification", e.target.value)}
              rows={2}
              placeholder="Why is this AI system being deployed? What problem does it solve?"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data Processing">
        <div className="space-y-4">
          <Field label="Data Types Processed *">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DATA_TYPE_OPTIONS.map((type) => (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.dataTypesProcessed.includes(type)}
                    onChange={() => toggleDataType(type)}
                    className="rounded border-border bg-bg accent-accent"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Data Residency">
            <input
              type="text"
              value={form.dataResidency}
              onChange={(e) => set("dataResidency", e.target.value)}
              placeholder="e.g. Canada East (Azure), or On-premises Toronto"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Decision Context */}
      <Section title="Decision Context">
        <div className="space-y-4">
          <Field label="Decision Types / AI Outputs *">
            <textarea
              value={form.decisionTypes}
              onChange={(e) => set("decisionTypes", e.target.value)}
              required
              rows={3}
              placeholder="What decisions does the AI make or influence? What outputs are acted upon?"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle
              label="Human in the Loop"
              description="A human reviews AI outputs before action"
              checked={form.humanInLoop}
              onChange={(v) => set("humanInLoop", v)}
            />
            <Toggle
              label="Human Override Capability"
              description="Humans can override or reverse AI decisions"
              checked={form.humanOverrideCapability}
              onChange={(v) => set("humanOverrideCapability", v)}
            />
          </div>
        </div>
      </Section>

      {/* Controls & Governance */}
      <Section title="Controls & Governance">
        <div className="space-y-4">
          <Field label="Access Controls">
            <textarea
              value={form.accessControls}
              onChange={(e) => set("accessControls", e.target.value)}
              rows={2}
              placeholder="Who has access? How is access managed? (e.g. SSO, RBAC, MFA)"
              className={inputClass}
            />
          </Field>
          <Field label="Existing Governance">
            <textarea
              value={form.existingGovernance}
              onChange={(e) => set("existingGovernance", e.target.value)}
              rows={2}
              placeholder="Any existing AI policies, vendor contracts, PIAs, or risk assessments already in place?"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Regulatory Context */}
      <Section title="Regulatory Context">
        <div className="space-y-4">
          <Toggle
            label="Regulated Sector"
            description="This system operates in a regulated industry"
            checked={form.regulatedSector}
            onChange={(v) => set("regulatedSector", v)}
          />
          {form.regulatedSector && (
            <Field label="Sector">
              <select
                value={form.sectorType}
                onChange={(e) => set("sectorType", e.target.value)}
                className={inputClass}
              >
                <option value="">Select sector…</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Additional Context">
            <textarea
              value={form.additionalContext}
              onChange={(e) => set("additionalContext", e.target.value)}
              rows={3}
              placeholder="Anything else the panel should know — client commitments, upcoming audits, recent incidents, etc."
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!isValid || questionsLoading}
          className="inline-flex items-center gap-2 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {questionsLoading ? (
            <>
              <span className="animate-pulse">Generating questions…</span>
            </>
          ) : (
            "Generate Clarifying Questions →"
          )}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
          {title}
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-border bg-surface p-3 hover:border-accent transition-colors">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 shrink-0 w-9 h-5 rounded-full transition-colors relative ${
          checked ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-slate-800 placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none";
