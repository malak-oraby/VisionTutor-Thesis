"use client";

// Picks the tutor version (V0/V1/V2) for this browser. The page reloads so
// the new version starts from a clean session. Locked while a session runs.
import { useEffect, useState } from "react";
import {
  getDefaultTutorVersion,
  getTutorVersion,
  setTutorVersion,
  parseTutorVersion,
  type TutorVersion,
} from "../lib/tutorStrategy";

const LABELS: Record<TutorVersion, string> = {
  baseline: "V0 · Original",
  strategy: "V1 · Strategy",
  adaptive: "V2 · Adaptive",
};

export default function VersionSwitcher({ disabled }: { disabled?: boolean }) {
  // start from the server default so the first render matches, then read the saved choice
  const [version, setVersion] = useState<TutorVersion>(getDefaultTutorVersion());
  useEffect(() => setVersion(getTutorVersion()), []);

  return (
    <select
      aria-label="Tutor version"
      title={disabled ? "Stop the session to change the version" : "Tutor version"}
      value={version}
      disabled={disabled}
      onChange={(e) => {
        setTutorVersion(parseTutorVersion(e.target.value));
        window.location.reload();
      }}
      className="border rounded px-2 py-1 text-sm bg-vt-raised border-vt-line-strong text-zinc-300 hover:border-brand-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:opacity-50"
    >
      {(Object.keys(LABELS) as TutorVersion[]).map((v) => (
        <option key={v} value={v}>
          {LABELS[v]}
        </option>
      ))}
    </select>
  );
}
