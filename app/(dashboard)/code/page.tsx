"use client";

import { useState, useRef, useEffect } from "react";
import CodeEditor, { CodeEditorRef } from "@/app/components/CodeEditor";
import AudioInterface from "@/app/components/AudioInterface";
import ConversationLog from "@/app/components/ConversationLog";
import SessionSummary from "@/app/components/SessionSummary";
import { useSessionRecorder } from "@/app/hooks/useSessionRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileCode2,
  Download,
  Copy,
  Trash2,
  Check,
  MessageSquare,
  Code2,
  Maximize,
  Minimize,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CodePage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [code, setCode] = useState(
    "// Write your code here\nfunction hello() {\n  console.log('Hello, world!');\n}\n"
  );
  const [messages, setMessages] = useState<
    { role: "human" | "ai"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "Welcome to the coding session! I'm your AI tutor. Once you start the session, I'll help you understand concepts, debug issues, or improve your implementation.",
    },
  ]);
  const [language, setLanguage] = useState("javascript");
  const codeEditorRef = useRef<CodeEditorRef>(null);
  const [codeImageBase64, setCodeImageBase64] = useState<string>("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [chatPanelVisible, setChatPanelVisible] = useState(true);
  const recorder = useSessionRecorder("code", () => language);
  const summaryOpen =
    recorder.status === "scoring" || recorder.status === "done" || recorder.status === "error";

  // Effect to capture code image when session starts
  useEffect(() => {
    if (isSessionActive && codeEditorRef.current) {
      // Force a capture when session starts
      const captureOnStart = async () => {
        try {
          await codeEditorRef.current?.captureImage();
        } catch (err) {
          console.error("Failed to capture initial image:", err);
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
  };

  // Start/stop of the voice session: save and score when it ends
  const handleAudioSessionChange = (active: boolean) => {
    setIsSessionActive(active);
    if (active) void recorder.begin();
    else void recorder.finish();
  };

  const captureContent = () => {
    // For code, we get the latest image from the editor ref
    if (codeEditorRef.current) {
      return codeEditorRef.current.getImageData();
    }
    return codeImageBase64;
  };

  const handleCodeImageCaptured = (imageData: string) => {
    setCodeImageBase64(imageData);
    console.log("Code image captured:", imageData.substring(0, 50) + "...");
  };

  const startSession = () => {
    setIsSessionActive(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Session started. Ask me any questions about your code, and I'll help you.",
      },
    ]);
    toast("Session Started", {
      description:
        "Your AI tutor is ready to help. Start speaking to get assistance.",
      duration: 5000,
      icon: "🎤",
      position: "top-right",
    });
    // Ensure chat panel is visible when session starts
    if (!chatPanelVisible && !isFullscreenEditor) {
      setChatPanelVisible(true);
    }
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Session ended. Your conversation history is preserved. Start again any time you need help.",
      },
    ]);
    toast("Session Ended", {
      description: "Your conversation history has been preserved.",
      duration: 6000,
      icon: "📁",
      position: "top-right",
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedToClipboard(true);

    toast("Code Copied", {
      description: "Code has been copied to clipboard",
      duration: 3000,
      icon: "📋",
    });

    setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-example.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Code Saved", {
      description: `File saved as code-example.${getFileExtension(language)}`,
      duration: 4000,
      icon: "💾",
    });
  };

  const handleClearCode = () => {
    setCode("// Write your code here\n");
    toast("Code Cleared", {
      description: "Editor has been reset",
      duration: 4000,
      icon: "🧹",
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreenEditor(!isFullscreenEditor);
    if (!isFullscreenEditor) {
      setChatPanelVisible(false);
    } else {
      setChatPanelVisible(true);
    }
  };

  const toggleChatPanel = () => {
    setChatPanelVisible(!chatPanelVisible);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      cpp: "cpp",
      go: "go",
      rust: "rs",
      php: "php",
      ruby: "rb",
    };
    return extensions[lang] || "txt";
  };

  return (
    <div className="h-[100vh] flex flex-col bg-[#000000] text-gray-200">
      {/* Header Section with gradient accent */}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:flex-row gap-3 pt-2 px-3 pb-3 h-[calc(100vh-180px)] overflow-hidden">
        {/* Code Editor Section - Flexible width */}
        <div
          className={`${
            isFullscreenEditor || !chatPanelVisible
              ? "w-full"
              : "w-full md:w-[70%]"
          } h-full flex flex-col transition-all duration-300 ease-in-out gap-2`}
        >
          <Card className="flex-grow bg-[#0d0d1a] border-[#1e1e2e] shadow-lg flex flex-col overflow-hidden relative">
            <CardHeader className=" flex-shrink-0 border-b border-[#1e1e2e] bg-[#0f0f1d]">
              <div className="flex justify-between items-center p-0">
                <div className="flex items-center space-x-2">
                  <FileCode2 className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-white">
                    Vision Code
                  </CardTitle>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-[#1a1a2e] border-[#2e2e3e] text-gray-300 hover:bg-[#2a2a3a] hover:border-purple-500 hover:text-white"
                  >
                    <Link href="/" className="flex items-center">
                      <span className="text-gray-300">Back to Home</span>
                      <Code2 className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-[#1a1a2e] border-[#2e2e3e] text-gray-300 hover:border-purple-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                  </select>

                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-[#1a1a2e] border-[#2e2e3e] text-gray-300 hover:bg-[#2a2a3a] hover:border-purple-500 hover:text-white"
                  >
                    {copiedToClipboard ? (
                      <Check className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedToClipboard ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    onClick={handleSaveCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-[#1a1a2e] border-[#2e2e3e] text-gray-300 hover:bg-[#2a2a3a] hover:border-purple-500 hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleClearCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-[#1a1a2e] border-[#2e2e3e] text-gray-300 hover:bg-[#2a2a3a] hover:border-purple-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-gray-400 hover:text-white hover:bg-[#2a2a3a]"
                  >
                    {isFullscreenEditor ? (
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
                <CodeEditor
                  ref={codeEditorRef}
                  value={code}
                  onChange={setCode}
                  language={language}
                  onCaptureImage={handleCodeImageCaptured}
                />
              </div>
            </CardContent>
          </Card>
          <div className="relative w-full  z-10 ">
            <AudioInterface
              onTranscription={handleTranscription}
              onUserTranscription={handleUserTranscription}
              captureContentCallback={captureContent}
              contentType="code"
              onSessionStateChange={handleAudioSessionChange}
            />
          </div>
        </div>

        {/* Conversation Log Section - 30% on desktop when visible */}
        {chatPanelVisible && !isFullscreenEditor && (
          <div
            className={`${
              showMobileChat ? "block" : "hidden md:block"
            } w-full md:w-[30%] h-full transition-all duration-300 ease-in-out`}
          >
            <Card className="h-full bg-[#0d0d1a] border-[#1e1e2e] shadow-lg flex flex-col overflow-hidden">
              <CardHeader className="py-2 px-3 flex-shrink-0 border-b border-[#1e1e2e] bg-[#0f0f1d]">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-lg font-semibold text-white">
                      AI Tutor Conversation
                    </CardTitle>
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
                      className="border-gray-600 text-sm text-black hover:border-purple-500 hover:bg-[#1a1a2e] hover:text-white"
                    >
                      Clear Chat
                    </Button>
                    <div className="md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileChat(false)}
                        className="text-gray-400 hover:text-white hover:bg-[#2a2a3a]"
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

      {/* No global Audio Interface anymore - it's moved inside the CodeEditor Card */}

      {/* Global styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d0d1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2e2e3e;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3e3e4e;
        }
      `}</style>
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
