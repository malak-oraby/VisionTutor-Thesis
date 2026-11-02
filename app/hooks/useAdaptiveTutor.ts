"use client";

// V2 in the live app: after each student message, scores the conversation so
// far, chooses a teaching mode (same rules as the experiment) and produces a
// note for the voice tutor when the mode changes. Inactive for V0 and V1.
import { useCallback, useRef, useState } from "react";
import {
  chooseMode,
  MODE_INSTRUCTIONS,
  type AdaptationDecision,
  type TutorMode,
} from "../lib/adaptation";
import { getTutorVersion } from "../lib/tutorStrategy";

type Msg = { role: "human" | "ai"; content: string; timestamp: string };

export function useAdaptiveTutor() {
  const enabled = getTutorVersion() === "adaptive";
  const [mode, setMode] = useState<TutorMode>("standard");
  const [mean, setMean] = useState<number | null>(null);
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);
  const modeRef = useRef<TutorMode>("standard");
  const decisionsRef = useRef<AdaptationDecision[]>([]);
  const busyRef = useRef(false);
  const pendingRef = useRef<Msg[] | null>(null);

  const reset = useCallback(() => {
    modeRef.current = "standard";
    decisionsRef.current = [];
    pendingRef.current = null;
    setMode("standard");
    setMean(null);
    setNote(null);
  }, []);

  const run = useCallback(async (messages: Msg[]) => {
    const studentCount = messages.filter((m) => m.role === "human").length;
    let score = null;
    if (studentCount >= 2) {
      try {
        const res = await fetch("/api/live-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        score = res.ok ? (await res.json()).score : null;
      } catch {
        score = null;
      }
    }
    const decision = chooseMode(studentCount, score, modeRef.current);
    decisionsRef.current.push(decision);
    if (decision.mean !== null) setMean(decision.mean);
    if (decision.mode !== modeRef.current) {
      modeRef.current = decision.mode;
      setMode(decision.mode);
      setNote({
        id: Date.now(),
        text: `[Note from the tutoring system, not from the student. Do not answer this note; apply it from your next reply on.]\n${MODE_INSTRUCTIONS[decision.mode]}`,
      });
    }
  }, []);

  // Call after each student message. Only one scoring request runs at a time;
  // if messages arrive meanwhile, the latest conversation is scored next.
  const onStudentMessage = useCallback(
    async (messages: Msg[]) => {
      if (!enabled) return;
      if (busyRef.current) {
        pendingRef.current = messages;
        return;
      }
      busyRef.current = true;
      try {
        let next: Msg[] | null = messages;
        while (next) {
          pendingRef.current = null;
          await run(next);
          next = pendingRef.current;
        }
      } finally {
        busyRef.current = false;
      }
    },
    [enabled, run]
  );

  const getDecisions = useCallback(() => decisionsRef.current, []);

  return { enabled, mode, mean, note, onStudentMessage, reset, getDecisions };
}
