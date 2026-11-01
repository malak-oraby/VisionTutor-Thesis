// Score-aware adaptation (V2). The live rubric score of the conversation so
// far chooses a teaching mode, and the mode adds instructions on top of the
// V1 teaching strategy. Every decision is logged so it can be analysed.

export type TutorMode = "scaffold" | "standard" | "challenge";

// Thresholds on the mean of AI Proficiency and Engagement Depth (0-4).
// Provisional, fixed before the experiment.
export const SCAFFOLD_BELOW = 1.5;
export const CHALLENGE_FROM = 3;

// The score is only trusted from this many student messages on (the same
// minimum as the end-of-session scorer); before that the mode is "standard".
export const MIN_MESSAGES_TO_ADAPT = 2;

export type LiveScore = { aiProficiency: number | null; engagementDepth: number | null };

export type AdaptationDecision = {
  studentTurn: number; // number of student messages when the decision was made
  score: LiveScore | null; // null when there was too little evidence or scoring failed
  mean: number | null;
  mode: TutorMode;
  reason: string;
};

export function chooseMode(
  studentTurn: number,
  score: LiveScore | null,
  previous: TutorMode = "standard"
): AdaptationDecision {
  if (studentTurn < MIN_MESSAGES_TO_ADAPT) {
    return { studentTurn, score: null, mean: null, mode: "standard", reason: "too few student messages" };
  }
  const values = score
    ? [score.aiProficiency, score.engagementDepth].filter((v): v is number => typeof v === "number")
    : [];
  if (!values.length) {
    return { studentTurn, score, mean: null, mode: previous, reason: "no score available, mode kept" };
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const mode: TutorMode = mean < SCAFFOLD_BELOW ? "scaffold" : mean >= CHALLENGE_FROM ? "challenge" : "standard";
  return { studentTurn, score, mean, mode, reason: `mean score ${mean.toFixed(2)}` };
}

export const MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  scaffold: `CURRENT MODE: SCAFFOLD. The student is struggling (they are not reasoning much or not using your hints). Give more support:
- Use simple words and break the problem into very small steps, one step per reply.
- Ask easy check questions to make sure they follow.
- If they are still stuck after trying once, you may move up one hint level.
- Praise effort. The rules about not giving the full solution early still apply.`,
  standard: `CURRENT MODE: STANDARD. Follow the rules above as they are.`,
  challenge: `CURRENT MODE: CHALLENGE. The student is doing well. Push their thinking:
- Give fewer and smaller hints. Let them try first, and do not offer hints they did not ask for.
- Ask them to explain why their step works, or to check their own answer.
- After they solve the problem, give one short follow-up question that is slightly harder.`,
};
