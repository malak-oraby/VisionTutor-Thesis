"use client";

import { useState, useRef, useEffect } from "react";
import MathCanvas, { MathCanvasRef } from "@/app/components/MathCanvas";
import AudioInterface from "@/app/components/AudioInterface";
import ConversationLog from "@/app/components/ConversationLog";
import SessionSummary from "@/app/components/SessionSummary";
import { useSessionRecorder } from "@/app/hooks/useSessionRecorder";
import { useAdaptiveTutor } from "@/app/hooks/useAdaptiveTutor";
import ModeBadge from "@/app/components/ModeBadge";
import VersionSwitcher from "@/app/components/VersionSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Code2, Maximize, Minimize, Brush } from "lucide-react";
import Link from "next/link";

export default function MathPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState<
    { role: "human" | "ai"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "Welcome to the math session! I'm your AI tutor. Once you start the session, I'll help you understand concepts, solve problems, or check your work.",
    },
  ]);
  const mathCanvasRef = useRef<MathCanvasRef>(null);
  const [mathImageBase64, setMathImageBase64] = useState<string>("");
  const [] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isFullscreenCanvas, setIsFullscreenCanvas] = useState(false);
  const [chatPanelVisible, setChatPanelVisible] = useState(true);
  const recorder = useSessionRecorder("math");
  const adaptive = useAdaptiveTutor();
  const summaryOpen =
    recorder.status === "scoring" || recorder.status === "done" || recorder.status === "error";

  useEffect(() => {
    if (isSessionActive && mathCanvasRef.current) {
      const captureOnStart = () => {
        const imageData = mathCanvasRef.current?.getImageData();
        if (imageData) {
          setMathImageBase64(imageData);
        }
      };
      captureOnStart();
    }
  }, [isSessionActive]);

  // The tutor's reply (transcribed from its audio)
  const handleTranscription = (text: string) => {
    setMessages((prev) => [...prev, { role: "ai", content: text }]);
    recorder.record("ai", text);
  };

  // The student's own speech (transcribed)
  const handleUserTranscription = (text: string) => {
    setMessages((prev) => [...prev, { role: "human", content: text }]);
    recorder.record("human", text);
    void adaptive.onStudentMessage(recorder.getMessages());
  };

  // Start/stop of the voice session: save and score when it ends
  const handleAudioSessionChange = (active: boolean) => {
    setIsSessionActive(active);
    if (active) {
      adaptive.reset();
      void recorder.begin();
    } else void recorder.finish(adaptive.enabled ? adaptive.getDecisions() : undefined);
  };

  const captureContent = () => {
    if (mathCanvasRef.current) {
      return mathCanvasRef.current.getImageData();
    }
    return mathImageBase64;
  };

  const handleMathImageCaptured = (imageData: string) => {
    setMathImageBase64(imageData);
    console.log(
      "Math canvas image captured:",
      imageData.substring(0, 50) + "..."
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreenCanvas(!isFullscreenCanvas);
    if (!isFullscreenCanvas) {
      setChatPanelVisible(false);
    } else {
      setChatPanelVisible(true);
    }
  };

  return (
    <div className="h-[100vh] flex flex-col bg-vt-bg text-zinc-200">
      <div className="flex-grow flex flex-col md:flex-row gap-3 pt-2 px-3 pb-3 h-[calc(100vh-180px)] overflow-hidden">
        <div
          className={`${
            isFullscreenCanvas || !chatPanelVisible
              ? "w-full"
              : "w-full md:w-[70%]"
          } h-full flex flex-col transition-all duration-300 ease-in-out gap-2`}
        >
          <Card className="flex-grow bg-vt-panel border-vt-line shadow-lg flex flex-col overflow-hidden relative">
            <CardHeader className=" flex-shrink-0 border-b border-vt-line bg-vt-header">
              <div className="flex justify-between items-center p-0">
                <div className="flex items-center space-x-2">
                  <Brush className="h-5 w-5 text-coral-400" />
                  <CardTitle className="text-lg font-semibold text-white">
                    Vision Math
                  </CardTitle>
                </div>
                <div className="flex gap-2 items-center">
                  <VersionSwitcher disabled={isSessionActive} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-vt-raised border-vt-line-strong text-zinc-300 hover:bg-vt-hover hover:border-coral-500 hover:text-white"
                  >
                    <Link href="/" className="flex items-center">
                      <span className="text-zinc-300">Back to Home</span>
                      <Code2 className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-zinc-400 hover:text-white hover:bg-vt-hover"
                  >
                    {isFullscreenCanvas ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 flex-grow overflow-hidden relative m-0">
              <div className="h-full ">
                <MathCanvas
                  ref={mathCanvasRef}
                  className="w-full h-full"
                  onImageCapture={handleMathImageCaptured}
                />
              </div>
            </CardContent>
          </Card>
          <div className="relative w-full z-10 ">
            <AudioInterface
              onTranscription={handleTranscription}
              onUserTranscription={handleUserTranscription}
              captureContentCallback={captureContent}
              contentType="math"
              onSessionStateChange={handleAudioSessionChange}
              systemNote={adaptive.note}
            />
          </div>
        </div>

        {chatPanelVisible && !isFullscreenCanvas && (
          <div
            className={`${
              showMobileChat ? "block" : "hidden md:block"
            } w-full md:w-[30%] h-full transition-all duration-300 ease-in-out`}
          >
            <Card className="h-full bg-vt-panel border-vt-line shadow-lg flex flex-col overflow-hidden">
              <CardHeader className="py-2 px-3 flex-shrink-0 border-b border-vt-line bg-vt-header">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-coral-400" />
                    <CardTitle className="text-lg font-semibold text-white">
                      AI Tutor Conversation
                    </CardTitle>
                    {adaptive.enabled && <ModeBadge mode={adaptive.mode} mean={adaptive.mean} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMessages([
                          {
                            role: "ai",
                            content:
                              "Welcome to the math session! I'm your AI tutor. Once you start the session, I'll help you understand concepts, solve problems, or check your work.",
                          },
                        ])
                      }
                      className="border-zinc-600 text-sm text-zinc-200 hover:border-coral-500 hover:bg-vt-raised hover:text-white"
                    >
                      Clear Chat
                    </Button>
                    <div className="md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileChat(false)}
                        className="text-zinc-400 hover:text-white hover:bg-vt-hover"
                      >
                        <Code2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-hidden">
                <div className="h-full p-4 overflow-y-auto custom-scrollbar">
                  <ConversationLog
                    messages={messages}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {summaryOpen && (
        <SessionSummary
          status={recorder.status as "scoring" | "done" | "error"}
          assessment={recorder.assessment}
          error={recorder.error}
          onClose={recorder.dismiss}
        />
      )}
    </div>
  );
}
