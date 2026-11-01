// Turns judge labels into the protocol measures and compares the versions.
//
//   npm run analyze -- --run pilot
// Writes results/harness/NAME/summary.md and per_session.csv.
//
// Measures per session (all computed from the judge's per-message labels):
//   reasoning      share of student messages with reasoning
//   answerSeeking  share of student messages that only ask for the answer
//   hintApprop     share of tutor hints (level 1-4) that pass all 3 checks:
//                  (a) no skipped level: level <= previous hint level + 1
//                  (b) within the cap: at most HINT_CAP hints of level 1-3 so far
//                  (c) no giveaway: level 4 / final answer only when allowed
//   leakage        1 if the tutor revealed the final answer when not allowed
//   falsePraise    1 if the tutor called a wrong answer correct
//   success        1 if the student stated the correct answer
//   turnsToSolve   student message at which they solved it (successful only)
// "Allowed" follows rule 4 of the strategy: the student attempted before, or
// HINT_CAP hints were given, or the student asked for the answer after a hint.
// A reveal after the student already reached the answer is a confirmation,
// not a leak.
//
// Comparisons are paired on (learner, scenario, repeat): V1 - V0 (H1) and
// V2 - V1 (H2), with bootstrap 95% confidence intervals (10,000 resamples,
// fixed seed). H2 also checks success non-inferiority with a 10-point margin.
import fs from "node:fs";
import path from "node:path";
import { HINT_CAP } from "../../app/lib/tutorStrategy";

const MARGIN = 0.1;
const RESAMPLES = 10000;

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

type Row = {
  key: string;
  version: string;
  learner: string;
  scenario: string;
  repeat: number;
  pair: string;
  reasoning: number;
  answerSeeking: number;
  hintApprop: number | null;
  leakage: number;
  falsePraise: number;
  success: number;
  turnsToSolve: number | null;
  modes: string;
};

function measure(session: any, labels: any): Omit<Row, "key" | "version" | "learner" | "scenario" | "repeat" | "pair" | "modes"> {
  const S: any[] = labels.student ?? [];
  const T: any[] = labels.tutor ?? [];
  const n = Math.max(1, S.length);
  const reachedAt: number | null = labels.session?.studentReachedAnswer ? labels.session?.studentReachedAnswerAtTurn ?? null : null;

  let prevLevel = 0;
  let hintsSoFar = 0; // levels 1-3
  let anyHint = false;
  let hints = 0;
  let appropriate = 0;
  let leakage = 0;
  let falsePraise = 0;

  T.forEach((t, i) => {
    const turn = i + 1; // tutor message i replies to student message i
    const before = S.slice(0, turn);
    const attempted = before.some((s) => s.attempt);
    const askedAfterHint = anyHint && before.slice(-1).some((s) => s.answerRequest);
    const allowed = attempted || hintsSoFar >= HINT_CAP || askedAfterHint;
    const alreadySolved = reachedAt !== null && reachedAt <= turn;
    const level = Number(t.hintLevel) || 0;
    const reveals = Boolean(t.revealsFinalAnswer) || level === 4;

    if (t.falsePraise) falsePraise = 1;
    if (reveals && !allowed && !alreadySolved) leakage = 1;

    if (level >= 1) {
      hints++;
      const noSkip = level <= prevLevel + 1;
      const withinCap = level === 4 || hintsSoFar < HINT_CAP;
      const noGiveaway = !reveals || allowed || alreadySolved;
      if (noSkip && withinCap && noGiveaway) appropriate++;
      prevLevel = level;
      anyHint = true;
      if (level <= 3) hintsSoFar++;
    }
  });

  return {
    reasoning: S.filter((s) => s.reasoning).length / n,
    answerSeeking: S.filter((s) => s.answerRequest).length / n,
    hintApprop: hints ? appropriate / hints : null,
    leakage,
    falsePraise,
    success: labels.session?.studentReachedAnswer ? 1 : 0,
    turnsToSolve: reachedAt,
  };
}

// small seeded RNG so the confidence intervals are reproducible
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

function bootstrap(diffs: number[]) {
  const rand = rng(42);
  const means: number[] = [];
  for (let b = 0; b < RESAMPLES; b++) {
    let s = 0;
    for (let i = 0; i < diffs.length; i++) s += diffs[Math.floor(rand() * diffs.length)];
    means.push(s / diffs.length);
  }
  means.sort((a, b) => a - b);
  return { mean: mean(diffs), lo: means[Math.floor(0.025 * RESAMPLES)], hi: means[Math.floor(0.975 * RESAMPLES)] };
}

const MEASURES: { key: keyof Row; label: string; better: "higher" | "lower" }[] = [
  { key: "reasoning", label: "Reasoning rate", better: "higher" },
  { key: "answerSeeking", label: "Answer-seeking rate", better: "lower" },
  { key: "hintApprop", label: "Hint appropriateness", better: "higher" },
  { key: "leakage", label: "Solution leakage", better: "lower" },
  { key: "falsePraise", label: "False praise", better: "lower" },
  { key: "success", label: "Success", better: "higher" },
  { key: "turnsToSolve", label: "Turns to solve (successful)", better: "lower" },
];

const fmt = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : "-");

function main() {
  const runName = arg("run") ?? "pilot";
  const dir = path.join("results", "harness", runName);
  const read = (f: string) =>
    fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const sessions = new Map(read("sessions.jsonl").map((r: any) => [r.key, r]));
  const judged = read("judged.jsonl");

  const rows: Row[] = [];
  for (const j of judged) {
    const s: any = sessions.get(j.key);
    if (!s) continue;
    rows.push({
      key: s.key,
      version: s.version,
      learner: s.learner,
      scenario: s.scenario,
      repeat: s.repeat,
      pair: `${s.learner}|${s.scenario}|${s.repeat}`,
      ...measure(s, j.labels),
      modes: (s.adaptation ?? []).map((d: any) => d.mode).join(">"),
    });
  }

  const versions = ["baseline", "strategy", "adaptive"].filter((v) => rows.some((r) => r.version === v));
  const vals = (v: string, m: keyof Row, learner?: string) =>
    rows.filter((r) => r.version === v && (!learner || r.learner === learner)).map((r) => r[m]).filter((x): x is number => typeof x === "number");

  const out: string[] = [];
  out.push(`# Results: run "${runName}"`, "");
  out.push(`Sessions judged: ${rows.length} (${versions.map((v) => `${v} ${rows.filter((r) => r.version === v).length}`).join(", ")}). Hint cap ${HINT_CAP}.`, "");

  out.push("## Means per version", "");
  out.push(`| Measure | ${versions.join(" | ")} |`, `|---|${versions.map(() => "---").join("|")}|`);
  for (const m of MEASURES) out.push(`| ${m.label} (${m.better} is better) | ${versions.map((v) => fmt(mean(vals(v, m.key)))).join(" | ")} |`);
  out.push("");

  const compare = (a: string, b: string, title: string) => {
    if (!versions.includes(a) || !versions.includes(b)) return;
    out.push(`## ${title}: ${b} minus ${a} (paired, bootstrap 95% CI)`, "");
    out.push("| Measure | pairs | difference | 95% CI | direction |", "|---|---|---|---|---|");
    for (const m of MEASURES) {
      const diffs: number[] = [];
      const byPair = new Map<string, Row>();
      for (const r of rows) if (r.version === a) byPair.set(r.pair, r);
      for (const r of rows) {
        if (r.version !== b) continue;
        const o = byPair.get(r.pair);
        if (o && typeof r[m.key] === "number" && typeof o[m.key] === "number") diffs.push((r[m.key] as number) - (o[m.key] as number));
      }
      if (!diffs.length) continue;
      const ci = bootstrap(diffs);
      const clear = ci.lo > 0 || ci.hi < 0;
      const good = m.better === "higher" ? ci.lo > 0 : ci.hi < 0;
      out.push(`| ${m.label} | ${diffs.length} | ${fmt(ci.mean)} | [${fmt(ci.lo)}, ${fmt(ci.hi)}] | ${clear ? (good ? `${b} better` : `${b} worse`) : "no clear difference"} |`);
      if (title.startsWith("H2") && m.key === "success")
        out.push(`|  ↳ non-inferiority (margin ${MARGIN * 100} points) | | | lower bound ${fmt(ci.lo)} | ${ci.lo > -MARGIN ? "met" : "not met"} |`);
    }
    out.push("");
  };
  compare("baseline", "strategy", "H1");
  compare("strategy", "adaptive", "H2");

  out.push("## By learner type (means)", "");
  const learners = [...new Set(rows.map((r) => r.learner))].sort();
  for (const m of MEASURES.filter((m) => ["reasoning", "answerSeeking", "leakage", "success"].includes(m.key))) {
    out.push(`### ${m.label}`, "", `| Learner | ${versions.join(" | ")} |`, `|---|${versions.map(() => "---").join("|")}|`);
    for (const l of learners) out.push(`| ${l} | ${versions.map((v) => fmt(mean(vals(v, m.key, l)))).join(" | ")} |`);
    out.push("");
  }

  const adaptive = rows.filter((r) => r.version === "adaptive");
  if (adaptive.length) {
    const count = (mode: string) => adaptive.filter((r) => r.modes.split(">").includes(mode)).length;
    out.push("## V2 adaptation", "", `Sessions that used each mode at least once: scaffold ${count("scaffold")}, standard ${count("standard")}, challenge ${count("challenge")} (of ${adaptive.length}).`, "");
  }

  out.push("Limitations: simulated learners, LLM judge (not yet checked by a human), small sample in pilot runs.");
  fs.writeFileSync(path.join(dir, "summary.md"), out.join("\n") + "\n");

  const cols: (keyof Row)[] = ["key", "version", "learner", "scenario", "repeat", "reasoning", "answerSeeking", "hintApprop", "leakage", "falsePraise", "success", "turnsToSolve", "modes"];
  fs.writeFileSync(
    path.join(dir, "per_session.csv"),
    [cols.join(","), ...rows.map((r) => cols.map((c) => (r[c] === null ? "" : String(r[c]))).join(","))].join("\n") + "\n"
  );
  console.log(out.join("\n"));
  console.log(`\nSaved ${path.join(dir, "summary.md")} and per_session.csv`);
}

main();
