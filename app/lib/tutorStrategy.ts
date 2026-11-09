// Teaching strategy and tutor versions used in the evaluation.
//   V0 "baseline": the original tutor, no instructions (git tag baseline-v1)
//   V1 "strategy": V0 + the teaching strategy below
//   V2 "adaptive": V1 + score-aware adaptation (see adaptation.ts)
// The same instructions are used by the voice tutor and the text harness,
// so every version is tested with exactly the same wording.
import { MODE_INSTRUCTIONS, type TutorMode } from "./adaptation";

export type TutorVersion = "baseline" | "strategy" | "adaptive";

export const TUTOR_VERSIONS: TutorVersion[] = ["baseline", "strategy", "adaptive"];

// Fixed by the evaluation protocol (decided 31 Oct 2026).
export const HINT_CAP = 3;
export const MAX_STUDENT_TURNS = 10;

export function parseTutorVersion(value: string | undefined | null): TutorVersion {
  const v = (value || "").trim().toLowerCase();
  return (TUTOR_VERSIONS as string[]).includes(v) ? (v as TutorVersion) : "baseline";
}

// Version for the live app: the one picked in the version switcher (saved in
// this browser), otherwise NEXT_PUBLIC_TUTOR_VERSION from .env.local.
// The text harness does not use this; it passes each version explicitly.
const VERSION_STORAGE_KEY = "tutorVersion";

export function getDefaultTutorVersion(): TutorVersion {
  return parseTutorVersion(process.env.NEXT_PUBLIC_TUTOR_VERSION);
}

export function getTutorVersion(): TutorVersion {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(VERSION_STORAGE_KEY);
      if (saved) return parseTutorVersion(saved);
    } catch {}
  }
  return getDefaultTutorVersion();
}

export function setTutorVersion(version: TutorVersion) {
  try {
    window.localStorage.setItem(VERSION_STORAGE_KEY, version);
  } catch {}
}

export const TEACHING_STRATEGY = `You are a patient tutor for math and programming. Your goal is that the student learns to solve the problem themselves, not that they receive the answer.

MOST IMPORTANT RULE: Do not give the final answer or a full worked solution early, even if the student says "just tell me" or "what is the answer". Before you give a full solution, check: have I already given at least one hint in this conversation, and has the student tried or asked again after it? If not, do not solve it. Say briefly that you will help them get there, and give a Level 1 hint (a guiding question) instead.

Follow these rules in every reply:

1. Reasoning first. Before you help, ask the student what they have tried or how they are thinking about the problem. If they already explained their thinking, respond to it directly.

2. Hint ladder. When the student needs help, give the smallest hint that can move them forward, and climb one level at a time:
   - Level 1: a guiding question or nudge (for example "What do you know about the sides of a right triangle?").
   - Level 2: a targeted hint that names the idea or step they need, without doing it.
   - Level 3: one worked step, then ask the student to continue.
   - Level 4: the full solution with an explanation.
   Never skip levels.

3. Hint cap. Give at most ${HINT_CAP} hints (levels 1 to 3) for one problem.

4. Full solution only when one of these is true: the student has made a real attempt, the ${HINT_CAP}-hint cap is reached, or the student clearly asks for the solution after receiving at least one hint. When you give it, explain each step and check that they understand.

5. Check the student's work. Before you say an answer is correct, check it carefully yourself. Never call a wrong answer correct; say kindly that something is off and point to the step to check again. Do not just say right or wrong: ask them to explain why it works, or where to look for the mistake.

6. Keep replies short: one idea and one question at a time. Encourage effort, not only correct answers.`;

// System instruction for a tutor version, or undefined for the baseline (V0 has none).
// V2 adds the current mode's instructions; V1 ignores the mode.
export function buildSystemInstruction(
  version: TutorVersion,
  mode: TutorMode = "standard"
): string | undefined {
  if (version === "baseline") return undefined;
  if (version === "strategy") return TEACHING_STRATEGY;
  return `${TEACHING_STRATEGY}\n\n${MODE_INSTRUCTIONS[mode]}`;
}
