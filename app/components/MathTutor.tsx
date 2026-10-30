"use client";

import { useState, useRef, useEffect } from "react";
import MathCanvas from "./MathCanvas";
import AudioInterface from "./AudioInterface";
import ConversationLog from "./ConversationLog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  Square,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PanelRight,
  PanelLeft,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";

export default function MathTutor() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState<
    { role: "human" | "ai"; content: string; transcription?: string }[]
  >([
    {
      role: "ai",
      content:
        "Welcome to the math tutoring session! I'm your AI tutor. Once you start the session, you can upload an image of a math problem or draw on the canvas. Then speak to me about your questions and I'll help you solve the problem step by step.",
    },
  ]);
  const [lastImageCapture, setLastImageCapture] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [mobilePanelVisible, setMobilePanelVisible] = useState<
    "canvas" | "conversation"
  >("canvas");

  const canvasRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSessionActive) {
      const timer = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      setSessionTimer(timer);

      return () => {
        clearInterval(timer);
        setSessionTimer(null);
      };
    }
  }, [isSessionActive]);

  const handleTranscription = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        content: text, // Change this from "User speaking..." to the actual transcription
        transcription: text,
      },
    ]);

    // Simulate AI response (in real app this would come from your AI service)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `I'm analyzing your math problem. ${
            text.includes("help")
              ? "Let me guide you through this step by step."
              : "Could you tell me more about what you're trying to solve?"
          }`,
        },
      ]);
    }, 1000);
  };

  const handleImageCapture = (imageData: string) => {
    setLastImageCapture(imageData);
  };

  const captureContent = () => {
    // Get the canvas image data
    if (canvasRef.current) {
      return canvasRef.current.getImageData();
    }
    return "";
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionDuration(0);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Session started. I can now see your math work and hear you. Ask me any questions about the problem you're working on.",
      },
    ]);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "ai",
        content:
          "Welcome to the math tutoring session! I'm your AI tutor. Once you start the session, you can upload an image of a math problem or draw on the canvas. Then speak to me about your questions and I'll help you solve the problem step by step.",
      },
    ]);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Session ended. Your conversation history is preserved. Start again any time you need help.",
      },
    ]);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      try {
        await canvasRef.current.loadImage(file);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const resetCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const toggleMobilePanel = () => {
    setMobilePanelVisible((prev) =>
      prev === "canvas" ? "conversation" : "canvas"
    );
  };

  return (
    <div className="space-y-4">
      {/* Session Controls & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={isSessionActive ? stopSession : startSession}
            variant={isSessionActive ? "destructive" : "default"}
            size="sm"
            className="font-medium"
          >
            {isSessionActive ? (
              <>
                <Square className="h-4 w-4 mr-2" /> End Session
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" /> Start Session
              </>
            )}
          </Button>

          {isSessionActive && (
            <div className="flex items-center">
              <Badge variant="outline" className="ml-2 bg-green-50">
                <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Live Session: {formatTime(sessionDuration)}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={resetCanvas} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Clear Canvas
          </Button>

          <Button onClick={handleImageUpload} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" /> Upload Problem
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelected}
            accept="image/*"
            className="hidden"
          />

          <Button
            onClick={toggleMobilePanel}
            variant="outline"
            size="sm"
            className="md:hidden"
          >
            {mobilePanelVisible === "canvas" ? (
              <>
                <PanelRight className="h-4 w-4 mr-2" /> Chat
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4 mr-2" /> Canvas
              </>
            )}
          </Button>
          <Button onClick={clearChat} variant="secondary" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
          </Button>
        </div>
      </div>

      {!isSessionActive && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <Lightbulb className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Start a session to begin solving math problems with AI assistance.
            Draw or upload your math problem, then ask questions using your
            microphone.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel - only visible on mobile when selected */}
        <div
          className={`flex flex-col space-y-4 ${
            mobilePanelVisible === "conversation" ? "hidden md:flex" : "flex"
          }`}
        >
          <Card className="flex-1 border shadow-md bg-white">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Math Canvas
                  </CardTitle>
                  <CardDescription>
                    Draw or upload your math problem here
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {isSessionActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                        )}
                        {isSessionActive ? "Canvas active" : "Session inactive"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSessionActive
                        ? "Your drawing is being processed in real-time"
                        : "Start session to begin AI processing"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-4 h-[500px]">
              <MathCanvas
                ref={canvasRef}
                className="h-full"
                onImageCapture={handleImageCapture}
              />
            </CardContent>
          </Card>

          <AudioInterface
            onTranscription={handleTranscription}
            captureContentCallback={captureContent}
            contentType="math"
            isSessionActive={isSessionActive}
          />
        </div>

        {/* Right panel - only visible on mobile when selected */}
        <div
          className={`flex flex-col h-full ${
            mobilePanelVisible === "canvas" ? "hidden md:flex" : "flex"
          }`}
        >
          <Card className="h-full border shadow-md bg-white">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Tutoring Session
                  </CardTitle>
                  <CardDescription>
                    Your conversation with the AI tutor
                  </CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {messages.filter((m) => m.role === "human").length} Questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[580px]">
              <Tabs defaultValue="conversation" className="h-full">
                <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                  <TabsTrigger value="conversation">Conversation</TabsTrigger>
                  <TabsTrigger value="preview">Canvas Preview</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="conversation"
                  className="h-[calc(100%-45px)] p-0 m-0 overflow-hidden"
                >
                  <ConversationLog messages={messages} />
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="h-[calc(100%-45px)] p-4 m-0 flex flex-col items-center justify-center bg-gray-50"
                >
                  {lastImageCapture ? (
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                        Current Canvas View
                      </h3>
                      <div className="border rounded-md overflow-hidden shadow-sm">
                        <img
                          src={lastImageCapture}
                          alt="Canvas Preview"
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This is what the AI sees when processing your problem
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No canvas content available</p>
                      <p className="text-sm">
                        Draw something or upload an image to see the preview
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
