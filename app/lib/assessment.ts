// app/lib/assessment.ts
// Shared (client + server) types for the session assessment.

export type ComponentScore = {
  score: number | null; // 0-4, or null when it cannot be assessed (N/A)
  evidence: string;
};

export type Assessment = {
  rubricVersion: string;
  scorer: "llm-rubric" | "heuristic-fallback";
  scorerNote: string;
  createdAt: string;
  studentMessages: number;
  aiProficiency: ComponentScore;
  engagementDepth: ComponentScore;
  earlyPrompt: ComponentScore;
  toolUsage: ComponentScore;
  visualContext: ComponentScore;
  overall: number | null; // mean of the available components (0-4)
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};
