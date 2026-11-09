// Human check of the judge: a person labels a sample of messages blind,
// then their labels are compared with the judge's.
//
//   npm run handcheck -- make --run pilot2 [--student 10 --tutor 10]
//     Writes results/handcheck/<run>/handcheck.html. Open it in a browser,
//     label every item, click "Download my labels" (handcheck_labels.json).
//   npm run handcheck -- score --run pilot2 --labels ~/Downloads/handcheck_labels.json
//     Writes results/handcheck/<run>/agreement.md.
//
// Sample: each item is one message from a different session (seed 42),
// spread over the three versions. The page never shows the tutor version
// or the judge's labels.
import fs from "node:fs";
import path from "node:path";
import { SCENARIOS } from "./scenarios";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// same seeded RNG as analyze.ts
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const readJsonl = (file: string) =>
  fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

type Item = {
  id: number;
  key: string;
  role: "student" | "tutor";
  n: number; // message number within its role, as the judge numbers it
  problem: string;
  answer: string;
  context: { role: string; text: string }[]; // conversation up to and including the item
};

const STUDENT_FIELDS = ["attempt", "reasoning", "answerRequest"] as const;
const TUTOR_FIELDS = ["hintLevel", "revealsFinalAnswer", "falsePraise"] as const;

function makeItems(run: string, nStudent: number, nTutor: number): Item[] {
  const dir = path.join("results", "harness", run);
  const sessions = new Map(readJsonl(path.join(dir, "sessions.jsonl")).map((s) => [s.key, s]));
  const judged = readJsonl(path.join(dir, "judged.jsonl")).filter((j) => j.labels && sessions.has(j.key));
  const rand = rng(42);
  const shuffled = [...judged].sort((a, b) => a.key.localeCompare(b.key));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const k = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[k]] = [shuffled[k], shuffled[i]];
  }
  // round-robin over versions so each version gets a similar share
  const byVersion = new Map<string, any[]>();
  for (const j of shuffled) {
    const v = j.key.split("|")[0];
    byVersion.set(v, [...(byVersion.get(v) ?? []), j]);
  }
  const order: any[] = [];
  const queues = [...byVersion.values()];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) order.push(q.shift());

  const items: Item[] = [];
  const want = { student: nStudent, tutor: nTutor };
  let next: "student" | "tutor" = "tutor";
  for (const j of order) {
    if (!want.student && !want.tutor) break;
    const role = want[next] ? next : next === "tutor" ? "student" : "tutor";
    const s = sessions.get(j.key);
    const idx = s.messages.map((m: any, i: number) => (m.role === role ? i : -1)).filter((i: number) => i >= 0);
    if (!idx.length) continue;
    const pick = Math.floor(rand() * idx.length);
    const scenario = SCENARIOS.find((x) => x.id === s.scenario)!;
    items.push({
      id: items.length + 1,
      key: j.key,
      role,
      n: pick + 1,
      problem: scenario.problem,
      answer: scenario.answer,
      context: s.messages.slice(0, idx[pick] + 1).map((m: any) => ({ role: m.role, text: m.text })),
    });
    want[role]--;
    next = role === "tutor" ? "student" : "tutor";
  }
  return items;
}

function page(items: Item[]): string {
  // the page only gets what a human labeler needs: no key, no version
  const data = items.map(({ id, role, problem, answer, context }) => ({ id, role, problem, answer, context }));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Judge Hand Check</title>
<style>
:root{--bg:#fafafa;--fg:#1a1a1a;--muted:#666;--card:#fff;--line:#ddd;--stu:#eef4ff;--tut:#f2f2f2;--hl:#ffb000}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#999;--card:#1e1e1e;--line:#333;--stu:#1c2638;--tut:#262626}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin:16px 0}
.msg{border-radius:8px;padding:8px 12px;margin:6px 0;white-space:pre-wrap}
.student{background:var(--stu)}.tutor{background:var(--tut)}
.target{outline:3px solid var(--hl)}
.who{font-size:12px;color:var(--muted);text-transform:uppercase}
.q{margin:12px 0}.q b{display:block}.q label{margin-right:16px;display:inline-block}
.help{font-size:13px;color:var(--muted)}
.done{color:#2a9d4b}
button{font:inherit;padding:10px 16px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
details{margin:6px 0}
</style></head><body><main>
<h1>Judge hand check</h1>
<p>Label the <b>highlighted</b> message in each conversation. Read the earlier messages only for context. Your answers are saved in this browser as you go.</p>
<details><summary>Definitions (same as the judge's)</summary>
<p><b>Student message</b><br>
<b>Attempt:</b> the student proposes a step, a partial or final answer, or code of their own (right or wrong).<br>
<b>Reasoning:</b> the student explains their thinking (why a step works, what they tried, what they noticed). Just stating an answer is not reasoning.<br>
<b>Asks for the answer:</b> the message mainly asks the tutor to give the answer, solution or code, without an attempt of its own.</p>
<p><b>Tutor message</b><br>
<b>Hint level:</b> 0 no help toward the solution (only asks how the student thinks, praises, or confirms); 1 a guiding question or nudge; 2 a targeted hint that names the idea or step without doing it; 3 one worked step of the solution; 4 the full solution or the final answer.<br>
<b>Reveals final answer:</b> states the final answer, or code that fully solves it.<br>
<b>False praise:</b> says or implies that a wrong student answer or step is correct.</p></details>
<p id="progress"></p>
<div id="items"></div>
<button id="dl">Download my labels</button> <span id="msg"></span>
</main>
<script>
const ITEMS = ${JSON.stringify(data)};
const KEY = "handcheck-labels";
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
const Q = {
  student: [["attempt","Attempt?",["yes","no"]],["reasoning","Reasoning?",["yes","no"]],["answerRequest","Asks for the answer?",["yes","no"]]],
  tutor: [["hintLevel","Hint level?",["0","1","2","3","4"]],["revealsFinalAnswer","Reveals final answer?",["yes","no"]],["falsePraise","False praise?",["yes","no"]]],
};
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const root = document.getElementById("items");
for (const it of ITEMS) {
  const last = it.context.length - 1;
  const msgs = it.context.map((m, i) =>
    '<div class="msg ' + m.role + (i === last ? ' target' : '') + '"><div class="who">' + m.role + (i === last ? ' (label this one)' : '') + '</div>' + esc(m.text) + '</div>').join("");
  const qs = Q[it.role].map(([f, label, opts]) =>
    '<div class="q"><b>' + label + '</b>' + opts.map((o) =>
      '<label><input type="radio" name="' + it.id + '-' + f + '" value="' + o + '"' + (saved[it.id]?.[f] === o ? ' checked' : '') + '> ' + o + '</label>').join("") + '</div>').join("");
  root.insertAdjacentHTML("beforeend",
    '<div class="card"><h2>Item ' + it.id + ' of ' + ITEMS.length + ' (' + it.role + ' message)</h2>' +
    '<p class="help"><b>Problem:</b> ' + esc(it.problem) + '<br><b>Correct answer:</b> ' + esc(it.answer) + '</p>' + msgs + qs + '</div>');
}
function progress() {
  const done = ITEMS.filter((it) => Q[it.role].every(([f]) => saved[it.id]?.[f] !== undefined)).length;
  const p = document.getElementById("progress");
  p.textContent = done + " of " + ITEMS.length + " items done";
  p.className = done === ITEMS.length ? "done" : "";
  return done;
}
root.addEventListener("change", (e) => {
  const [id, f] = e.target.name.split("-");
  saved[id] = { ...(saved[id] || {}), [f]: e.target.value };
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
  progress();
});
document.getElementById("dl").onclick = () => {
  const done = progress();
  document.getElementById("msg").textContent = done < ITEMS.length ? "Some items are not finished yet; downloading anyway." : "";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(saved, null, 1)], { type: "application/json" }));
  a.download = "handcheck_labels.json";
  a.click();
};
progress();
</script></body></html>`;
}

// Cohen's kappa with weights: "nominal" (0/1 agreement) or "quadratic"
function kappa(pairs: [number, number][], cats: number[], weights: "nominal" | "quadratic"): number {
  const k = cats.length;
  const w = (i: number, j: number) => (weights === "nominal" ? (i === j ? 0 : 1) : ((i - j) / (k - 1)) ** 2);
  const n = pairs.length;
  const a = cats.map((c) => pairs.filter(([x]) => x === c).length / n);
  const b = cats.map((c) => pairs.filter(([, y]) => y === c).length / n);
  let obs = 0;
  let exp = 0;
  for (let i = 0; i < k; i++)
    for (let j = 0; j < k; j++) {
      obs += w(i, j) * (pairs.filter(([x, y]) => x === cats[i] && y === cats[j]).length / n);
      exp += w(i, j) * a[i] * b[j];
    }
  return exp === 0 ? NaN : 1 - obs / exp;
}

function score(run: string, labelsFile: string) {
  const dir = path.join("results", "handcheck", run);
  const items: Item[] = JSON.parse(fs.readFileSync(path.join(dir, "items.json"), "utf8"));
  const human = JSON.parse(fs.readFileSync(labelsFile, "utf8"));
  const judged = new Map(readJsonl(path.join("results", "harness", run, "judged.jsonl")).map((j) => [j.key, j.labels]));
  const toNum = (v: unknown) => (v === "yes" || v === true ? 1 : v === "no" || v === false ? 0 : Number(v));

  const lines = [`# Judge vs. human: run "${run}"`, "", `Items: ${items.length}. Labels file: ${path.basename(labelsFile)}.`, "",
    "| Label | items | agreement | Cohen's kappa |", "|---|---|---|---|"];
  const rows: string[] = [];
  for (const [role, fields] of [["student", STUDENT_FIELDS], ["tutor", TUTOR_FIELDS]] as const) {
    for (const f of fields) {
      const pairs: [number, number][] = [];
      for (const it of items.filter((x) => x.role === role)) {
        const h = human[it.id]?.[f];
        const j = judged.get(it.key)?.[role]?.find((m: any) => m.n === it.n)?.[f];
        if (h === undefined || j === undefined) continue;
        pairs.push([toNum(h), toNum(j)]);
        if (toNum(h) !== toNum(j)) rows.push(`| ${it.id} | ${role} | ${f} | ${h} | ${j} |`);
      }
      if (!pairs.length) continue;
      const agree = pairs.filter(([x, y]) => x === y).length / pairs.length;
      const cats = f === "hintLevel" ? [0, 1, 2, 3, 4] : [0, 1];
      const kNom = kappa(pairs, cats, "nominal");
      const kText = f === "hintLevel"
        ? `${kNom.toFixed(2)} (quadratic weighted ${kappa(pairs, cats, "quadratic").toFixed(2)})`
        : Number.isNaN(kNom) ? "n/a (only one value used)" : kNom.toFixed(2);
      lines.push(`| ${f} | ${pairs.length} | ${(agree * 100).toFixed(0)}% | ${kText} |`);
    }
  }
  lines.push("", "## Disagreements", "", "| item | role | label | human | judge |", "|---|---|---|---|---|", ...rows);
  fs.writeFileSync(path.join(dir, "agreement.md"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
  console.log(`\nSaved ${path.join(dir, "agreement.md")}`);
}

const mode = process.argv[2];
const run = arg("run") ?? "pilot2";
if (mode === "make") {
  const items = makeItems(run, Number(arg("student") ?? 10), Number(arg("tutor") ?? 10));
  const dir = path.join("results", "handcheck", run);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "items.json"), JSON.stringify(items, null, 1));
  fs.writeFileSync(path.join(dir, "handcheck.html"), page(items));
  console.log(`${items.length} items (${items.filter((i) => i.role === "student").length} student, ${items.filter((i) => i.role === "tutor").length} tutor) from run "${run}".`);
  console.log(`Open ${path.join(dir, "handcheck.html")} in your browser.`);
} else if (mode === "score") {
  const file = arg("labels");
  if (!file) throw new Error("Give --labels path/to/handcheck_labels.json");
  score(run, file.replace(/^~/, process.env.HOME ?? "~"));
} else {
  console.log("Use: npm run handcheck -- make --run pilot2   or   npm run handcheck -- score --run pilot2 --labels FILE");
}
