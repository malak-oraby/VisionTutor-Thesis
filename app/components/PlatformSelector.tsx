// app/components/PlatformSelector.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, FunctionSquare } from "lucide-react";
import CodeTutor from "./CodeTutor";
import MathTutor from "./MathTutor";

export default function PlatformSelector() {
  const [platform, setPlatform] = useState<"none" | "code" | "math">("none");

  if (platform === "code") {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Code Tutor</h1>
          <Button variant="outline" onClick={() => setPlatform("none")}>
            Back to Selection
          </Button>
        </div>
        <CodeTutor />
      </div>
    );
  }

  if (platform === "math") {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Math Tutor</h1>
          <Button variant="outline" onClick={() => setPlatform("none")}>
            Back to Selection
          </Button>
        </div>
        <MathTutor />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Choose Your Learning Platform
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <Card
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => setPlatform("code")}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Code className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Code Tutor</h2>
            <p className="text-gray-600 mb-4">
              Get help with programming concepts, debugging, and code
              optimization. Write code and receive real-time audio feedback.
            </p>
            <Button>Start Coding</Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg"
          onClick={() => setPlatform("math")}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <FunctionSquare className="h-8 w-8 text-green-600" />{" "}
              {/* Corrected usage */}
            </div>
            <h2 className="text-xl font-semibold mb-2">Math Tutor</h2>
            <p className="text-gray-600 mb-4">
              Get help with mathematical problems, equations, and concepts. Draw
              or upload problems and get step-by-step audio explanations.
            </p>
            <Button>Start Math</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
