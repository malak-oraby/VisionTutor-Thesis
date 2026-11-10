// Result charts for slides and the thesis, from a run's per_session.csv and
// summary.md (made by analyze.ts).
//
//   npm run charts -- --run pilot2
// Writes results/harness/NAME/charts/*.svg and charts.html (all three charts,
// for a quick look or a PNG screenshot).
//
//   h1_v0_v1.svg       V0 vs V1 means with 95% bootstrap CIs (per version)
//   h2_v2_minus_v1.svg paired V2 - V1 differences with 95% CIs (from summary.md)
//   success_by_learner.svg  success per learner type and version
import fs from "node:fs";
import path from "node:path";

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

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function bootstrapCI(xs: number[], resamples = 10000, seed = 42): [number, number] {
  const rand = rng(seed);
  const means: number[] = [];
  for (let r = 0; r < resamples; r++) {
    let s = 0;
    for (let i = 0; i < xs.length; i++) s += xs[Math.floor(rand() * xs.length)];
    means.push(s / xs.length);
  }
  means.sort((a, b) => a - b);
  return [means[Math.floor(0.025 * resamples)], means[Math.floor(0.975 * resamples) - 1]];
}

// Palette: validated categorical slots 1-3 (light mode); text and grid tokens.
const C = {
  surface: "#ffffff",
  text: "#0b0b0b",
  text2: "#52514e",
  grid: "#e4e3df",
  axis: "#b9b8b2",
  baseline: "#2a78d6",
  strategy: "#eb6834",
  adaptive: "#1baf7a",
};
const VERSIONS = [
  { id: "baseline", label: "V0 · Original", color: C.baseline },
  { id: "strategy", label: "V1 · Strategy", color: C.strategy },
  { id: "adaptive", label: "V2 · Adaptive", color: C.adaptive },
];
const FONT = "font-family='Helvetica, Arial, sans-serif'";
const W = 1200;
const H = 640;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${o.size ?? 16}" fill="${o.fill ?? C.text}" text-anchor="${o.anchor ?? "start"}" font-weight="${o.weight ?? 400}">${esc(s)}</text>`;

// column with a 4px rounded data end, square at the baseline
function column(x: number, w: number, yTop: number, yBase: number, fill: string) {
  const h = Math.max(0, yBase - yTop);
  if (h === 0) return `<line x1="${x}" x2="${x + w}" y1="${yBase}" y2="${yBase}" stroke="${fill}" stroke-width="2"/>`;
  const r = Math.min(4, h, w / 2);
  return `<path d="M${x},${yBase} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + w - r} Q${x + w},${yTop} ${x + w},${yTop + r} V${yBase} Z" fill="${fill}"><title>${fill}</title></path>`;
}

function legend(x: number, y: number, items: { label: string; color: string }[]) {
  let out = "";
  let cx = x;
  for (const it of items) {
    out += `<rect x="${cx}" y="${y - 12}" width="14" height="14" rx="3" fill="${it.color}"/>`;
    out += text(cx + 22, y, it.label, { size: 16, fill: C.text2 });
    cx += 22 + it.label.length * 8.6 + 28;
  }
  return out;
}

function svg(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.surface}"/>${body}</svg>`;
}

// grouped columns on a 0-1 scale; groups = metrics or learner types
function groupedColumns(opts: {
  title: string;
  subtitle: string;
  groups: { label: string; sub?: string }[];
  series: { label: string; color: string; values: (number | null)[]; ci?: ([number, number] | null)[] }[];
  note: string;
}) {
  const left = 80, right = W - 40, top = 160, base = H - 120;
  const yOf = (v: number) => base - v * (base - top);
  let body = text(left - 40, 44, opts.title, { size: 26, weight: 700 });
  body += text(left - 40, 74, opts.subtitle, { size: 16, fill: C.text2 });
  body += legend(left - 40, 110, opts.series);
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const y = yOf(t);
    body += `<line x1="${left}" x2="${right}" y1="${y}" y2="${y}" stroke="${t === 0 ? C.axis : C.grid}" stroke-width="1"/>`;
    body += text(left - 10, y + 5, t.toFixed(2), { size: 14, fill: C.text2, anchor: "end" });
  }
  const band = (right - left) / opts.groups.length;
  const barW = 40;
  const gap = 2;
  opts.groups.forEach((g, gi) => {
    const groupW = opts.series.length * barW + (opts.series.length - 1) * gap;
    const x0 = left + gi * band + (band - groupW) / 2;
    opts.series.forEach((s, si) => {
      const v = s.values[gi];
      const x = x0 + si * (barW + gap);
      if (v === null) {
        body += text(x + barW / 2, base - 8, "n/a", { size: 12, fill: C.text2, anchor: "middle" });
        return;
      }
      body += column(x, barW, yOf(v), base, s.color);
      const ci = s.ci?.[gi];
      let labelY = yOf(v) - 8;
      if (ci) {
        const cx = x + barW / 2;
        body += `<line x1="${cx}" x2="${cx}" y1="${yOf(ci[0])}" y2="${yOf(ci[1])}" stroke="${C.text}" stroke-width="1.5"/>`;
        body += `<line x1="${cx - 6}" x2="${cx + 6}" y1="${yOf(ci[1])}" y2="${yOf(ci[1])}" stroke="${C.text}" stroke-width="1.5"/>`;
        body += `<line x1="${cx - 6}" x2="${cx + 6}" y1="${yOf(ci[0])}" y2="${yOf(ci[0])}" stroke="${C.text}" stroke-width="1.5"/>`;
        labelY = Math.min(labelY, yOf(ci[1]) - 8);
      }
      body += text(x + barW / 2, labelY, v.toFixed(2), { size: 14, anchor: "middle", weight: 600 });
    });
    body += text(left + gi * band + band / 2, base + 26, g.label, { size: 16, anchor: "middle", weight: 600 });
    if (g.sub) body += text(left + gi * band + band / 2, base + 46, g.sub, { size: 14, fill: C.text2, anchor: "middle" });
  });
  body += text(left - 40, H - 22, opts.note, { size: 14, fill: C.text2 });
  return svg(body);
}

// horizontal dot-and-interval chart of paired differences around zero
function differenceChart(opts: {
  title: string;
  subtitle: string;
  rows: { label: string; sub: string; d: number; lo: number; hi: number }[];
  margin?: { row: string; value: number };
  color: string;
  note: string;
}) {
  const left = 330, right = W - 60, top = 130, rowH = 78;
  const lo = -0.6, hi = 0.6;
  const xOf = (v: number) => left + ((v - lo) / (hi - lo)) * (right - left);
  const bottom = top + opts.rows.length * rowH;
  let body = text(40, 44, opts.title, { size: 26, weight: 700 });
  body += text(40, 74, opts.subtitle, { size: 16, fill: C.text2 });
  for (const t of [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6]) {
    const x = xOf(t);
    body += `<line x1="${x}" x2="${x}" y1="${top - 10}" y2="${bottom}" stroke="${t === 0 ? C.axis : C.grid}" stroke-width="${t === 0 ? 1.5 : 1}"/>`;
    body += text(x, bottom + 24, (t > 0 ? "+" : "") + t.toFixed(1), { size: 14, fill: C.text2, anchor: "middle" });
  }
  body += text(xOf(0), bottom + 48, "difference (V2 − V1)", { size: 14, fill: C.text2, anchor: "middle" });
  opts.rows.forEach((r, i) => {
    const y = top + i * rowH + rowH / 2;
    body += text(40, y - 2, r.label, { size: 17, weight: 600 });
    body += text(40, y + 20, r.sub, { size: 14, fill: C.text2 });
    if (opts.margin && opts.margin.row === r.label) {
      const mx = xOf(opts.margin.value);
      body += `<line x1="${mx}" x2="${mx}" y1="${y - 26}" y2="${y + 26}" stroke="${C.text2}" stroke-width="1.5"/>`;
      body += text(mx - 6, y - 30, "non-inferiority margin −0.10", { size: 13, fill: C.text2, anchor: "end" });
    }
    body += `<line x1="${xOf(r.lo)}" x2="${xOf(r.hi)}" y1="${y}" y2="${y}" stroke="${opts.color}" stroke-width="4" stroke-linecap="round"/>`;
    body += `<circle cx="${xOf(r.d)}" cy="${y}" r="8" fill="${opts.color}" stroke="${C.surface}" stroke-width="2"/>`;
    const fmt = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2);
    // value under the interval, so it never runs past the right edge
    body += text(xOf((r.lo + r.hi) / 2), y + 28, `${fmt(r.d)}  [${fmt(r.lo)}, ${fmt(r.hi)}]`, { size: 14, anchor: "middle" });
  });
  body += text(40, H - 22, opts.note, { size: 14, fill: C.text2 });
  return svg(body);
}

function readCsv(file: string) {
  const [head, ...lines] = fs.readFileSync(file, "utf8").trim().split("\n");
  const cols = head.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

// rows of the H2 table in summary.md: | Measure | pairs | difference | [lo, hi] | direction |
function readH2(summary: string) {
  const part = summary.split("## H2")[1]?.split("\n## ")[0] ?? "";
  const rows: Record<string, { pairs: number; d: number; lo: number; hi: number }> = {};
  for (const line of part.split("\n")) {
    const m = line.match(/^\| ([^|↳]+?) \| (\d+) \| (-?[\d.]+) \| \[(-?[\d.]+), (-?[\d.]+)\] \|/);
    if (m) rows[m[1]] = { pairs: +m[2], d: +m[3], lo: +m[4], hi: +m[5] };
  }
  return rows;
}

const run = arg("run") ?? "pilot2";
const dir = path.join("results", "harness", run);
const rows = readCsv(path.join(dir, "per_session.csv"));
const summary = fs.readFileSync(path.join(dir, "summary.md"), "utf8");
const out = path.join(dir, "charts");
fs.mkdirSync(out, { recursive: true });
const n = (v: string) => rows.filter((r) => r.version === v).length;

// 1. H1: V0 vs V1
const metrics = [
  { key: "reasoning", label: "Reasoning rate", sub: "higher is better" },
  { key: "hintApprop", label: "Hint appropriateness", sub: "higher is better" },
  { key: "leakage", label: "Solution leakage", sub: "lower is better" },
  { key: "success", label: "Success", sub: "higher is better" },
];
const seriesFor = (v: (typeof VERSIONS)[number]) => {
  const vals = metrics.map((m) => rows.filter((r) => r.version === v.id && r[m.key] !== "").map((r) => +r[m.key]));
  return { label: `${v.label} (n = ${n(v.id)})`, color: v.color, values: vals.map(mean), ci: vals.map((xs) => bootstrapCI(xs)) };
};
fs.writeFileSync(
  path.join(out, "h1_v0_v1.svg"),
  groupedColumns({
    title: "H1 · Effect of the teaching strategy (V0 vs V1)",
    subtitle: `Run "${run}": mean per session, simulated learners`,
    groups: metrics,
    series: [seriesFor(VERSIONS[0]), seriesFor(VERSIONS[1])],
    note: "Error bars: 95% bootstrap CI of the mean (10,000 resamples, seed 42). Labels by a blind judge (Gemma 4 31B).",
  })
);

// 2. H2: paired V2 - V1 differences, from analyze.ts
const h2 = readH2(summary);
const h2rows = [
  { label: "Reasoning rate", sub: "higher is better" },
  { label: "Answer-seeking rate", sub: "lower is better" },
  { label: "Hint appropriateness", sub: "higher is better" },
  { label: "Success", sub: "higher is better" },
].filter((r) => h2[r.label]).map((r) => ({ ...r, ...h2[r.label] }));
const pairs = h2rows[0]?.pairs ?? 0;
fs.writeFileSync(
  path.join(out, "h2_v2_minus_v1.svg"),
  differenceChart({
    title: "H2 · Added effect of adaptation (V2 − V1)",
    subtitle: `Run "${run}": paired differences, ${pairs} pairs (same learner, problem, repeat)`,
    rows: h2rows,
    margin: { row: "Success", value: -0.1 },
    color: C.adaptive,
    note: "Dot: mean paired difference. Line: 95% paired bootstrap CI. A CI crossing 0 means no confirmed difference.",
  })
);

// 3. success by learner type
const learners = [...new Set(rows.map((r) => r.learner))].sort();
const perCell = (v: string, l: string) => rows.filter((r) => r.version === v && r.learner === l);
fs.writeFileSync(
  path.join(out, "success_by_learner.svg"),
  groupedColumns({
    title: "Success by learner type",
    subtitle: `Run "${run}": share of sessions where the student reached the correct answer`,
    groups: learners.map((l) => ({ label: l, sub: `n = ${VERSIONS.map((v) => perCell(v.id, l).length).join(" / ")}` })),
    series: VERSIONS.map((v) => ({
      label: v.label,
      color: v.color,
      values: learners.map((l) => {
        const xs = perCell(v.id, l).map((r) => +r.success);
        return xs.length ? mean(xs) : null;
      }),
    })),
    note: "n = sessions per bar (V0 / V1 / V2). Very small samples: read as a pattern, not as a result.",
  })
);

const files = ["h1_v0_v1.svg", "h2_v2_minus_v1.svg", "success_by_learner.svg"];
fs.writeFileSync(
  path.join(out, "charts.html"),
  `<!doctype html><meta charset="utf-8"><title>Charts ${run}</title><body style="margin:0;background:#fff">` +
    files.map((f) => fs.readFileSync(path.join(out, f), "utf8")).join("") +
    `</body>`
);
console.log(`Saved ${files.length} charts to ${out}`);
