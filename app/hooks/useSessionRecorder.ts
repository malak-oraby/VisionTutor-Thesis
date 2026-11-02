"use client";

// Records a tutoring session (student + tutor messages with timestamps),
// saves it to the database when it ends, and returns the assessment.
import { useCallback, useRef, useState } from "react";
import type { Assessment } from "../lib/assessment";
import { getTutorVersion } from "../lib/tutorStrategy";

type RecMessage = { role: "human" | "ai"; content: string; timestamp: string };
type Status = "idle" | "recording" | "scoring" | "done" | "error";

export function useSessionRecorder(
  sessionType: "code" | "math",
  getLanguage?: () => string | undefined
) {
  const idRef = useRef<string | null>(null);
  const activeRef = useRef(false);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const messagesRef = useRef<RecMessage[]>([]);
  const langRef = useRef(getLanguage);
  langRef.current = getLanguage;

  const [status, setStatus] = useState<Status>("idle");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async () => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionType,
        codeLanguage: langRef.current?.(),
        tutorVersion: getTutorVersion(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not start the session");
    idRef.current = data.session._id;
  }, [sessionType]);

  // Called when the tutoring session starts. Safe to call more than once.
  const begin = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    idRef.current = null;
    messagesRef.current = [];
    setAssessment(null);
    setError(null);
    setStatus("recording");
    startPromiseRef.current = createSession().catch((err) => {
      console.error("[recorder] could not create the session:", err);
    });
    await startPromiseRef.current;
  }, [createSession]);

  // Called for every transcribed message.
  const record = useCallback((role: "human" | "ai", content: string) => {
    if (!activeRef.current) return;
    const text = (content || "").trim();
    if (!text) return;
    messagesRef.current.push({ role, content: text, timestamp: new Date().toISOString() });
  }, []);

  // Messages recorded so far (used by the adaptive tutor, V2).
  const getMessages = useCallback(() => [...messagesRef.current], []);

  // Called when the tutoring session ends. Saves, scores, and shows the result.
  // `adaptation` is the V2 decision log, saved with the session.
  const finish = useCallback(async (adaptation?: unknown[]) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setStatus("scoring");
    setError(null);
    try {
      await startPromiseRef.current;
      if (!idRef.current) await createSession();
      const res = await fetch(`/api/sessions/${idRef.current}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesRef.current, adaptation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not score the session");
      setAssessment(data.assessment);
      setStatus("done");
    } catch (err: any) {
      console.error("[recorder] finish failed:", err);
      setError(err?.message || "Could not score the session");
      setStatus("error");
    }
  }, [createSession]);

  const dismiss = useCallback(() => setStatus("idle"), []);

  return { status, assessment, error, begin, record, finish, dismiss, getMessages };
}
