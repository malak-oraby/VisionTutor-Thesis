// Minimal Gemini text client for the harness, with retries and timeouts.
import fs from "node:fs";

export type Turn = { role: "user" | "model"; text: string };

export function loadApiKey(): string {
  const fromEnv = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (fromEnv) return fromEnv;
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i < 1 || line.trim().startsWith("#")) continue;
    const name = line.slice(0, i).trim();
    if (name === "GEMINI_API_KEY" || name === "NEXT_PUBLIC_GEMINI_API_KEY") {
      return line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("No Gemini API key found in .env.local");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generate(opts: {
  key: string;
  model: string;
  system?: string;
  turns: Turn[];
  temperature?: number;
  timeoutMs?: number;
  attempts?: number;
  json?: boolean;
}): Promise<string> {
  const { key, model, system, turns, temperature = 0.7, timeoutMs = 60000, attempts = 5, json = false } = opts;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            ...(system && { systemInstruction: { parts: [{ text: system }] } }),
            contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
            generationConfig: { temperature, ...(json && { responseMimeType: "application/json" }) },
          }),
          signal: ctrl.signal,
        }
      );
      if (!res.ok) {
        const body = (await res.text().catch(() => "")).slice(0, 200);
        const err: any = new Error(`HTTP ${res.status} from ${model}: ${body}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((p: any) => p?.text ?? "")
        .join("")
        .trim();
      if (!text) throw new Error(`Empty reply from ${model}`);
      return text;
    } catch (err: any) {
      lastErr = err;
      const status = err?.status as number | undefined;
      if (status !== undefined && status !== 429 && status < 500) throw err; // not temporary
      // back off longer on rate limits (free tier allows few requests per minute)
      const wait = (status === 429 ? 15000 : 3000) * attempt;
      console.warn(`  [retry ${attempt}/${attempts}] ${err?.message ?? err} - waiting ${wait / 1000}s`);
      await sleep(wait);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
