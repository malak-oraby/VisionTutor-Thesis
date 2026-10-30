"use client";

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Editor from "@monaco-editor/react";
import html2canvas from "html2canvas-pro";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
  onCaptureImage: (imageData: string) => void;
}

// Define exported ref type to match how MathCanvas is used
export interface CodeEditorRef {
  getImageData: () => string;
  captureImage: () => Promise<string>;
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ value, onChange, language, className, onCaptureImage }, ref) => {
    const editorRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const lastCaptureTimeRef = useRef(0);
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const latestImageRef = useRef<string>("");
    const [isEditorMounted, setIsEditorMounted] = useState(false);

    // Handle editor mounting
    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
      setIsEditorMounted(true);
    };

    // Get the current image data
    const getImageData = (): string => {
      return latestImageRef.current;
    };

    // Explicitly trigger a capture
    const captureImage = async (): Promise<string> => {
      const result = await captureCodeImage();
      return result || "";
    };

    // Expose methods via ref (similar to MathCanvas)
    useImperativeHandle(ref, () => ({
      getImageData,
      captureImage,
    }));

    // Initialize editor and capture after editor is mounted
    useEffect(() => {
      if (isEditorMounted) {
        // Wait a bit longer to ensure editor is fully rendered with content
        const initTimer = setTimeout(() => {
          captureCodeImage();
          // Start periodic capture only after initial capture succeeds
          startAutomaticCapture();
        }, 1000);

        return () => clearTimeout(initTimer);
      }
    }, [isEditorMounted]);

    // Clean up all timers and intervals on unmount
    useEffect(() => {
      return () => {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }
      };
    }, []);

    // Start automatic capture for sending to backend
    const startAutomaticCapture = () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }

      captureIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastCapture = now - lastCaptureTimeRef.current;

        // Only capture if it's been at least 2 seconds since the last capture
        if (timeSinceLastCapture >= 2000) {
          captureCodeImage();
        }
      }, 2000);
    };

    const captureCodeImage = async (): Promise<string> => {
      if (!editorRef.current || !editorContainerRef.current || !isEditorMounted)
        return "";

      try {
        // Find the actual editor DOM element (the parent div contains it)
        const editorElement =
          editorContainerRef.current.querySelector(".monaco-editor");
        if (!editorElement) {
          console.warn("Monaco editor element not found, skipping capture");
          return "";
        }

        // Ensure the editor has visible content
        const contentArea = (editorElement as HTMLElement).querySelector(
          ".view-lines"
        );
        if (!contentArea || (contentArea as HTMLElement).offsetHeight === 0) {
          console.warn(
            "Editor content area not properly loaded, skipping capture"
          );
          return "";
        }

        // Use html2canvas to capture the editor including syntax highlighting
        const canvas = await html2canvas(editorElement as HTMLElement, {
          backgroundColor: null,
          scale: 2, // Higher resolution
          logging: false,
          useCORS: true,
        });

        const imageData = canvas.toDataURL("image/png");

        // Validate image data before sending
        if (imageData && imageData.length > 1000) {
          // Simple validation to ensure non-empty image
          // Store the latest image data for retrieval via getImageData()
          latestImageRef.current = imageData;

          // Send the image to the parent component
          onCaptureImage(imageData);
          lastCaptureTimeRef.current = Date.now();

          return imageData;
        } else {
          console.warn("Generated image data is invalid or too small");
          return "";
        }
      } catch (error) {
        console.error("Error capturing code image:", error);
        return "";
      }
    };

    // Handle code changes with proper debouncing
    useEffect(() => {
      if (!isEditorMounted) return;

      const debounceTimer = setTimeout(() => {
        captureCodeImage();
      }, 1000); // 1 second debounce

      return () => clearTimeout(debounceTimer);
    }, [value]);

    return (
      <div
        ref={editorContainerRef}
        className={`w-full h-full rounded-md border-1 overflow-hidden flex flex-col ${
          className || ""
        }`}
      >
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={value}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              lineNumbersMinChars: 3,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
            theme="vs-dark"
          />
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";

export default CodeEditor;
