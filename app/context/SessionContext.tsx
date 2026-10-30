"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type Message = {
  id: string;
  role: "human" | "ai";
  content: string;
  timestamp: Date;
};

export type Session = {
  _id: string;
  sessionType: "code" | "math";
  codeLanguage?: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
};

export type Note = {
  _id: string;
  sessionId: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
};

type SessionContextType = {
  // Current active session
  currentSession: Session | null;
  // All user sessions
  sessions: Session[];
  // All user notes
  notes: Note[];
  // Loading states
  isLoading: boolean;
  // Session management functions
  startSession: (
    sessionType: "code" | "math",
    codeLanguage?: string
  ) => Promise<void>;
  endSession: () => Promise<void>;
  addMessage: (content: string, role: "human" | "ai") => Promise<void>;
  // Notes management functions
  createNote: (
    title: string,
    content: string,
    tags?: string[]
  ) => Promise<void>;
  updateNote: (
    noteId: string,
    title: string,
    content: string,
    tags?: string[]
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  // Session loading functions
  getSessions: () => Promise<void>;
  getSession: (sessionId: string) => Promise<void>;
  getNotes: () => Promise<void>;
  getNote: (noteId: string) => Promise<Note | null>;
  // Error state
  error: string | null;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions when user is authenticated
  useEffect(() => {
    if (user) {
      getSessions();
      getNotes();
    }
  }, [user]);

  // Start a new session
  const startSession = async (
    sessionType: "code" | "math",
    codeLanguage?: string
  ) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionType, codeLanguage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start session");
      }

      setCurrentSession(data.session);
      setSessions((prev) => [data.session, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to start session");
      console.error("Session creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // End the current session
  const endSession = async () => {
    if (!currentSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${currentSession._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endSession: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to end session");
      }

      setCurrentSession(data.session);
      setSessions((prev) =>
        prev.map((session) =>
          session._id === data.session._id ? data.session : session
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to end session");
      console.error("Session ending error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a message to the current session
  const addMessage = async (content: string, role: "human" | "ai") => {
    if (!currentSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${currentSession._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addMessage",
          message: { role, content },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add message");
      }

      setCurrentSession(data.session);
      setSessions((prev) =>
        prev.map((session) =>
          session._id === data.session._id ? data.session : session
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to add message");
      console.error("Message addition error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all user sessions
  const getSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      setSessions(data.sessions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sessions");
      console.error("Sessions fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific session
  const getSession = async (sessionId: string) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch session");
      }

      setCurrentSession(data.session);
    } catch (err: any) {
      setError(err.message || "Failed to fetch session");
      console.error("Session fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all user notes
  const getNotes = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notes");
      }

      setNotes(data.notes);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notes");
      console.error("Notes fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific note
  const getNote = async (noteId: string): Promise<Note | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch note");
      }

      return data.note;
    } catch (err: any) {
      setError(err.message || "Failed to fetch note");
      console.error("Note fetch error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new note
  const createNote = async (
    title: string,
    content: string,
    tags?: string[]
  ) => {
    if (!user || !currentSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession._id,
          title,
          content,
          tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create note");
      }

      setNotes((prev) => [data.note, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to create note");
      console.error("Note creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing note
  const updateNote = async (
    noteId: string,
    title: string,
    content: string,
    tags?: string[]
  ) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update note");
      }

      setNotes((prev) =>
        prev.map((note) => (note._id === data.note._id ? data.note : note))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update note");
      console.error("Note update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err: any) {
      setError(err.message || "Failed to delete note");
      console.error("Note deletion error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        notes,
        isLoading,
        error,
        startSession,
        endSession,
        addMessage,
        createNote,
        updateNote,
        deleteNote,
        getSessions,
        getSession,
        getNotes,
        getNote,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
