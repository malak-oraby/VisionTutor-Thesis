// Text-mode harness: simulated learners talk to a tutor version and every
// session is saved as one JSON line. Judging happens later (Part 5).
//
//   npm run harness -- --run pilot --limit 4
//   npm run harness -- --run main --versions baseline,strategy,adaptive --repeats 2
//
// Options (all optional):
//   --run NAME            output folder results/harness/NAME (default "pilot")
//   --versions a,b        tutor versions (default baseline,strategy,adaptive)
//   --learners a,b        learner types (default all 6)
//   --scenarios a,b       scenario ids (default all 8)
//   --repeats N           repeats per combination (default 2)
//   --limit N             stop after N new sessions (for quick tests)
//   --concurrency N       sessions run at the same time (default 2)
// Models: HARNESS_TUTOR_MODEL, HARNESS_LEARNER_MODEL (default gemini-flash-lite-latest).
// Already finished sessions are skipped, so a stopped run can be restarted.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  TUTOR_VERSIONS,
  MAX_STUDENT_TURNS,
  buildSystemInstruction,
  parseTutorVersion,
  type TutorVersion,
} from "../../app/lib/tutorStrategy";
import { SCENARIOS, type Scenario } from "./scenarios";
import {
  LEARNER_TYPES,
  DONE_TOKEN,
  learnerSystemPrompt,
  learnerOpeningInstruction,
  type LearnerType,
} from "./learners";
import { generate, loadApiKey, type Turn } from "./gemini";

type Job = { version: TutorVersion; learner: LearnerType; scenario: Scenario; repeat: number; key: string };
type Message = { role: "student" | "tutor"; text: string; at: string };

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function list<T extends string>(name: string, all: readonly T[]): T[] {
  const v = arg(name);
  if (!v) return [...all];
  const picked = v.split(",").map((s) => s.trim()) as T[];
  const bad = picked.filter((p) => !all.includes(p));
  if (bad.length) throw new Error(`Unknown --${name}: ${bad.join(", ")} (choose from ${all.join(", ")})`);
  return picked;
}

const runName = arg("run") ?? "pilot";
const versions = list("versions", TUTOR_VERSIONS).map(parseTutorVersion);
const learners = list("learners", LEARNER_TYPES);
const scenarioIds = list("scenarios", SCENARIOS.map((s) => s.id));
const repeats = Number(arg("repeats") ?? 2);
const limit = arg("limit") ? Number(arg("limit")) : Infinity;
const concurrency = Number(arg("concurrency") ?? 2);
const tutorModel = process.env.HARNESS_TUTOR_MODEL || "gemini-flash-lite-latest";
const learnerModel = process.env.HARNESS_LEARNER_MODEL || "gemini-flash-lite-latest";

const outDir = path.join("results", "harness", runName);
const outFile = path.join(outDir, "sessions.jsonl");
fs.mkdirSync(outDir, { recursive: true });

const done = new Set<string>();
if (fs.existsSync(outFile)) {
  for (const line of fs.readFileSync(outFile, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const rec = JSON.parse(line);
      if (rec.ended !== "error") done.add(rec.key);
    } catch {}
  }
}

// Order: repeat, scenario, learner, version - so a partial run stays balanced
// across versions (each combination is finished for all versions together).
const jobs: Job[] = [];
for (let repeat = 1; repeat <= repeats; repeat++)
  for (const scenario of SCENARIOS.filter((s) => scenarioIds.includes(s.id)))
    for (const learner of learners)
      for (const version of versions) {
        const key = `${version}|${learner}|${scenario.id}|${repeat}`;
        if (!done.has(key)) jobs.push({ version, learner, scenario, repeat, key });
      }
const todo = jobs.slice(0, limit);

const apiKey = loadApiKey();
const hash = (s: string | undefined) =>
  s ? crypto.createHash("sha256").update(s).digest("hex").slice(0, 12) : null;

async function runSession(job: Job) {
  const system = buildSystemInstruction(job.version);
  const learnerSystem = learnerSystemPrompt(job.learner, job.scenario);
  const messages: Message[] = [];
  const startedAt = new Date().toISOString();
  let ended: "learner-done" | "max-turns" | "error" = "max-turns";
  let error: string | undefined;

  try {
    for (let turn = 1; turn <= MAX_STUDENT_TURNS; turn++) {
      // The learner sees the tutor as "user" and itself as "model".
      const learnerTurns: Turn[] = [{ role: "user", text: learnerOpeningInstruction() }];
      for (const m of messages) learnerTurns.push({ role: m.role === "student" ? "model" : "user", text: m.text });
      let studentText = await generate({ key: apiKey, model: learnerModel, system: learnerSystem, turns: learnerTurns, temperature: 0.9 });
      const finished = studentText.includes(DONE_TOKEN);
      studentText = studentText.replace(DONE_TOKEN, "").trim();
      if (studentText) messages.push({ role: "student", text: studentText, at: new Date().toISOString() });
      if (finished) {
        ended = "learner-done";
        break;
      }

      const tutorTurns: Turn[] = messages.map((m) => ({ role: m.role === "student" ? "user" : "model", text: m.text }));
      const tutorText = await generate({ key: apiKey, model: tutorModel, system, turns: tutorTurns, temperature: 0.7 });
      messages.push({ role: "tutor", text: tutorText, at: new Date().toISOString() });
    }
  } catch (err: any) {
    ended = "error";
    error = String(err?.message ?? err).slice(0, 300);
  }

  const record = {
    key: job.key,
    run: runName,
    version: job.version,
    learner: job.learner,
    scenario: job.scenario.id,
    domain: job.scenario.domain,
    repeat: job.repeat,
    tutorModel,
    learnerModel,
    tutorInstructionHash: hash(system), // identifies the exact strategy text used
    startedAt,
    finishedAt: new Date().toISOString(),
    studentTurns: messages.filter((m) => m.role === "student").length,
    ended,
    ...(error && { error }),
    messages,
  };
  fs.appendFileSync(outFile, JSON.stringify(record) + "\n");
  return record;
}

async function main() {
  console.log(
    `Run "${runName}": ${todo.length} sessions to do (${done.size} already done). ` +
      `Tutor model ${tutorModel}, learner model ${learnerModel}. Saving to ${outFile}`
  );
  let next = 0;
  let finished = 0;
  const worker = async () => {
    while (next < todo.length) {
      const job = todo[next++];
      const rec = await runSession(job);
      finished++;
      console.log(
        `[${finished}/${todo.length}] ${job.key} -> ${rec.ended}, ${rec.studentTurns} student turns` +
          (rec.error ? ` (${rec.error})` : "")
      );
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  console.log("Done.");
}

main();
