"use client";

import type { Assessment, ComponentScore } from "../lib/assessment";

type Props = {
  status: "scoring" | "done" | "error";
  assessment: Assessment | null;
  error?: string | null;
  onClose: () => void;
};

function levelLabel(score: number) {
  if (score < 1) return "Getting started";
  if (score < 2) return "Developing";
  if (score < 3) return "Proficient";
  return "Advanced";
}

function Row({ label, item }: { label: string; item: ComponentScore }) {
  const na = item.score === null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-100">{label}</span>
        <span className="text-zinc-300">{na ? "N/A" : `${item.score}/4`}</span>
      </div>
      <div className="h-2 w-full rounded bg-white/10">
        <div
          className="h-2 rounded bg-coral-500"
          style={{ width: na ? "0%" : `${((item.score as number) / 4) * 100}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400">{item.evidence}</p>
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide">{title}</div>
      <ul className="list-disc space-y-1 pl-4 text-sm">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function SessionSummary({ status, assessment, error, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-vt-panel text-zinc-100 shadow-2xl">
        <div className="flex items-center justify-between bg-coral-600 px-5 py-3">
          <h2 className="text-base font-semibold">Session Assessment Summary</h2>
          <button onClick={onClose} className="text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="space-y-5 p-5">
          {status === "scoring" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-coral-500 border-t-transparent" />
              <p className="text-sm text-zinc-300">Scoring your session...</p>
            </div>
          )}

          {status === "error" && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error || "Something went wrong while scoring the session."}
            </p>
          )}

          {status === "done" && assessment && (
            <>
              <div className="text-center">
                {assessment.overall === null ? (
                  <div className="text-lg font-semibold">Not scored</div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-coral-400">
                      {assessment.overall.toFixed(1)}
                      <span className="text-lg text-zinc-400">/4</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{levelLabel(assessment.overall)}</div>
                  </>
                )}
                <div className="mt-1 text-xs text-zinc-400">
                  Based on {assessment.studentMessages} student message
                  {assessment.studentMessages === 1 ? "" : "s"}
                </div>
              </div>

              <div className="space-y-4">
                <Row label="AI Proficiency" item={assessment.aiProficiency} />
                <Row label="Engagement Depth" item={assessment.engagementDepth} />
                <Row label="Early Prompt" item={assessment.earlyPrompt} />
                <Row label="Tool Usage" item={assessment.toolUsage} />
                <Row label="Visual Context" item={assessment.visualContext} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <List title="Strengths" items={assessment.strengths} tone="border-green-500/40 bg-green-500/10 text-green-200" />
                <List title="Areas to improve" items={assessment.improvements} tone="border-amber-500/40 bg-amber-500/10 text-amber-200" />
              </div>
              <List title="Recommended next steps" items={assessment.nextSteps} tone="border-coral-500/40 bg-coral-500/10 text-coral-200" />

              <p className="border-t border-white/10 pt-3 text-xs text-zinc-500">
                Scoring rubric v{assessment.rubricVersion} - scorer: {assessment.scorer}. {assessment.scorerNote}
              </p>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-md bg-coral-600 py-2 text-sm font-medium hover:bg-coral-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
