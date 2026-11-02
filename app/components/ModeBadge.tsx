"use client";

// Shows the adaptive tutor's current teaching mode (V2 only).
import type { TutorMode } from "../lib/adaptation";

const STYLES: Record<TutorMode, { label: string; className: string; tip: string }> = {
  scaffold: {
    label: "Scaffold",
    className: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    tip: "More support: smaller steps and simpler hints",
  },
  standard: {
    label: "Standard",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    tip: "Normal hint ladder",
  },
  challenge: {
    label: "Challenge",
    className: "bg-green-500/20 text-green-300 border-green-500/40",
    tip: "Fewer hints, asks why, gives a harder follow-up",
  },
};

export default function ModeBadge({ mode, mean }: { mode: TutorMode; mean: number | null }) {
  const s = STYLES[mode];
  return (
    <span
      title={s.tip}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.className}`}
    >
      Mode: {s.label}
      {mean !== null && <span className="opacity-70">· score {mean.toFixed(1)}/4</span>}
    </span>
  );
}
