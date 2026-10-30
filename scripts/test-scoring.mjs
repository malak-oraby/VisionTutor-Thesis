// Sends the real scoring request to each model and shows what comes back.
// Run from the project folder:  node scripts/test-scoring.mjs
// It never prints your API key.
import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  if (!line.includes("=") || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}
const key = env.GEMINI_API_KEY || env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!key) {
  console.log("No Gemini key found in .env.local");
  process.exit(1);
}

// use the exact rubric prompt from the app, so this test cannot drift
const src = fs.readFileSync("app/lib/scoring.ts", "utf8");
const m = src.match(/const RUBRIC_PROMPT = `([\s\S]*?)`;/);
if (!m) {
  console.log("Could not find RUBRIC_PROMPT in app/lib/scoring.ts");
  process.exit(1);
}
const conversation = [
  "TUTOR 1: What are you trying to find in this triangle?",
  "STUDENT 1: I think x is the longest side because it is opposite the right angle.",
  "TUTOR 2: Close. Which side is the hypotenuse?",
  "STUDENT 2: So I use a squared plus b squared equals c squared. Three squared is nine and four squared is sixteen, so I get twenty five.",
  "STUDENT 3: That means the longest side is five since the square root of twenty five is five.",
].join("\n");

const models = [...new Set([env.GEMINI_SCORING_MODEL, "gemini-flash-latest", "gemini-3.8-flash"].filter(Boolean))];

for (const model of models) {
  console.log(`\n=== ${model} ===`);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${m[1]}\n\nCONVERSATION:\n${conversation}` }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
      }
    );
    console.log("HTTP status:", res.status);
    const raw = await res.text();
    if (!res.ok) {
      console.log("Error body:", raw.slice(0, 300));
      continue;
    }
    const data = JSON.parse(raw);
    const cand = data?.candidates?.[0];
    const text = (cand?.content?.parts ?? []).map((p) => p?.text ?? "").join("");
    console.log("finishReason:", cand?.finishReason, "| text length:", text.length);
    if (!text) {
      console.log("EMPTY TEXT. promptFeedback:", JSON.stringify(data?.promptFeedback ?? null).slice(0, 200));
      continue;
    }
    console.log("Reply starts with:", text.slice(0, 200).replace(/\s+/g, " "));
    try {
      const out = JSON.parse(text.replace(/```json|```/g, "").trim());
      console.log("JSON OK -> AI Proficiency:", out?.aiProficiency?.score, "| Engagement Depth:", out?.engagementDepth?.score);
    } catch (e) {
      console.log("JSON PARSE FAILED:", e.message);
    }
  } catch (e) {
    console.log("REQUEST FAILED:", e.message);
  }
}
console.log("\nDone.");
