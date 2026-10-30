"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function DockedAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleListen = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-4 flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full ${isMuted ? "bg-red-50 text-red-500" : ""}`}
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`rounded-full ${
          isListening ? "bg-green-50 text-green-500" : ""
        }`}
        onClick={toggleListen}
      >
        {isListening ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
