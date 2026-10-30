"use client";

import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { useState } from "react";

// This hook combines auth and session functionality for easy use in components
export function useTutor() {
  const auth = useAuth();
  const session = useSession();
  const [isSaving, setIsSaving] = useState(false);

  // Authentication states
  const isAuthenticated = !!auth.user;
  const authLoading = auth.loading;

  // Session states
  const hasActiveSession =
    !!session.currentSession && !session.currentSession.endTime;
  const sessionType = session.currentSession?.sessionType;
  const codeLanguage = session.currentSession?.codeLanguage;

  // Start a tutoring session (code or math)
  const startTutoringSession = async (
    type: "code" | "math",
    language?: string
  ) => {
    if (!isAuthenticated) return;
    await session.startSession(type, language);
  };

  // End current session with optional note saving
  const endTutoringSession = async (
    saveNote: boolean,
    noteTitle?: string,
    noteContent?: string,
    tags?: string[]
  ) => {
    if (!hasActiveSession) return;

    try {
      setIsSaving(true);

      // Save note if requested
      if (saveNote && noteTitle && noteContent) {
        await session.createNote(noteTitle, noteContent, tags);
      }

      // End session
      await session.endSession();
    } finally {
      setIsSaving(false);
    }
  };

  // Add a message to the current session
  const sendMessage = async (content: string, role: "human" | "ai") => {
    if (!hasActiveSession) return;
    await session.addMessage(content, role);
  };

  // Get conversation history for current session
  const getConversationHistory = () => {
    return session.currentSession?.messages || [];
  };

  return {
    // Auth
    user: auth.user,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    authError: auth.error,
    isAuthenticated,
    authLoading,

    // Session
    currentSession: session.currentSession,
    allSessions: session.sessions,
    allNotes: session.notes,
    isLoading: session.isLoading,
    isSaving,
    hasActiveSession,
    sessionType,
    codeLanguage,

    // Session actions
    startTutoringSession,
    endTutoringSession,
    sendMessage,
    getConversationHistory,

    // Notes management
    createNote: session.createNote,
    updateNote: session.updateNote,
    deleteNote: session.deleteNote,

    // Data retrieval
    refreshSessions: session.getSessions,
    loadSession: session.getSession,
    refreshNotes: session.getNotes,
    getNote: session.getNote,

    // Error handling
    sessionError: session.error,
  };
}
