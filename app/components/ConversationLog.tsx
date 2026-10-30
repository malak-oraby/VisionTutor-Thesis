// app/components/ConversationLog.tsx
"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationLogProps {
  messages: {
    role: "human" | "ai";
    content: string;
    transcription?: string; // For storing user's speech transcription
  }[];
}

export default function ConversationLog({ messages }: ConversationLogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use setTimeout to ensure the DOM has been updated before scrolling
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 0);
  }, [messages]);

  return (
    <div className="h-full" ref={scrollAreaRef}>
      <ScrollArea className="h-full pr-4">
        <div className="space-y-6 pb-4">
          {messages.map((message, index) => (
            <div key={index} className="flex gap-3 items-start">
              <Avatar className={`h-8 w-8 ${message.role === "ai" ? "" : ""}`}>
                {message.role === "ai" ? (
                  <>
                    <AvatarImage src="/avatars/gemini.png" alt="AI Tutor" />
                    <AvatarFallback className="">AI</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/avatars/student.png" alt="You" />
                    <AvatarFallback>You</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-200">
                    {message.role === "ai" ? "VisionTutor" : "You"}
                  </p>
                </div>
                <div
                  className={`rounded-sm px-3 py-2 text-sm ${
                    message.role === "ai"
                      ? "bg-white border border-zinc-200 text-zinc-800"
                      : "bg-zinc-100 text-zinc-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
