"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Undo, Redo, Eraser, Palette } from "lucide-react";

type Mode = "pen" | "eraser";

interface MathCanvasProps {
  className?: string;
  onImageCapture?: (imageData: string) => void;
}

export interface MathCanvasRef {
  clearCanvas: () => void;
  getImageData: () => string | null;
  loadImage: (file: File) => Promise<void>;
}

const MathCanvas = forwardRef<MathCanvasRef, MathCanvasProps>(
  ({ className, onImageCapture }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<Mode>("pen");
    const [color, setColor] = useState<string>("#000000");
    const [eraserSize, setEraserSize] = useState<number>(10);
    const [history, setHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      clearCanvas,
      getImageData,
      loadImage: (file) => loadImage(file),
    }));

    // Initialize canvas on first render
    useEffect(() => {
      const initializeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          // Set the canvas dimensions to match its display size
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          saveState();
        }
      };

      initializeCanvas();

      // Also handle window resize
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const imageData = canvas.toDataURL(); // Save current drawing

          // Resize canvas
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;

          // Restore the drawing
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = imageData;
          }
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Notify parent component of image updates
    useEffect(() => {
      if (history.length > 0 && onImageCapture) {
        onImageCapture(history[history.length - 1]);
      }
    }, [history, onImageCapture]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      ctx.beginPath();

      const { x, y } = getCoordinates(e, canvas);
      ctx.moveTo(x, y);

      ctx.strokeStyle = mode === "pen" ? color : "#FFFFFF";
      ctx.lineWidth = mode === "pen" ? 2 : eraserSize;
      ctx.lineCap = "round";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { x, y } = getCoordinates(e, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const finishDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      const canvas = canvasRef.current;
      canvas?.getContext("2d")?.closePath();
      saveState();
      setRedoStack([]);
    };

    // Improved coordinate translation function
    const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
      // Get the actual rendered dimensions of the canvas
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Get mouse/touch position
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;

      // Calculate position within canvas, accounting for scaling
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      return { x, y };
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
        setRedoStack([]);
      }
    };

    const saveState = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const imgData = canvas.toDataURL();
        setHistory((prev) => [...prev, imgData].slice(-20));
      }
    };

    const restoreState = (img: string) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const image = new Image();
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = img;
      }
    };

    const undo = () => {
      if (history.length > 1) {
        const newHistory = [...history];
        const last = newHistory.pop()!;
        setRedoStack((prev) => [last, ...prev]);
        const prevImg = newHistory[newHistory.length - 1];
        setHistory(newHistory);
        restoreState(prevImg);
      }
    };

    const redo = () => {
      if (redoStack.length > 0) {
        const [next, ...rest] = redoStack;
        setHistory((prev) => [...prev, next]);
        setRedoStack(rest);
        restoreState(next);
      }
    };

    const handleImageUpload = () => {
      fileInputRef.current?.click();
    };

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadImage(file);
      }
    };

    const loadImage = (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const img = new Image();

          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
              reject(new Error("Canvas not available"));
              return;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas context not available"));
              return;
            }

            // Reset canvas dimensions to match its display size
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            // Clear the canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate dimensions to maintain aspect ratio
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
              // Image is wider than canvas (relative to height)
              drawWidth = canvas.width;
              drawHeight = canvas.width / imgRatio;
              offsetX = 0;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              // Image is taller than canvas (relative to width)
              drawHeight = canvas.height;
              drawWidth = canvas.height * imgRatio;
              offsetX = (canvas.width - drawWidth) / 2;
              offsetY = 0;
            }

            // Draw the image centered and properly scaled
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            saveState();
            resolve();
          };

          img.onerror = () => {
            reject(new Error("Failed to load image"));
          };

          img.src = reader.result as string;
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
      });
    };

    const getImageData = (): string | null => {
      const canvas = canvasRef.current;
      return canvas?.toDataURL() ?? null;
    };

    return (
      <div className={`flex flex-col ${className}`}>
        {/* Toolbar */}
        <div className="flex justify-between items-center p-3 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Button
              size="default"
              variant={mode === "pen" ? "default" : "outline"}
              onClick={() => setMode("pen")}
              className="px-4 h-10"
            >
              <span className="h-6 w-6 rounded-full bg-white flex items-center justify-center mr-2">
                <Palette className="h-4 w-4 text-black" />
              </span>{" "}
              Pen
            </Button>

            <div className="relative">
              <div
                className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer overflow-hidden"
                style={{ backgroundColor: color }}
                onClick={() => document.getElementById("colorPicker")?.click()}
                title="Select color"
              />
              <input
                id="colorPicker"
                type="color"
                value={color}
                onChange={handleColorChange}
                className="absolute opacity-0 w-0 h-0"
              />
            </div>

            <Button
              size="default"
              variant={mode === "eraser" ? "default" : "outline"}
              onClick={() => setMode("eraser")}
              className="px-4 h-10"
            >
              <Eraser className="h-5 w-5 mr-2" /> Eraser
            </Button>

            {mode === "eraser" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Size:</span>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={eraserSize}
                  onChange={(e) => setEraserSize(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-xs font-medium">{eraserSize}px</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                size="default"
                variant="outline"
                onClick={undo}
                disabled={history.length <= 1}
                className="h-10 w-10 p-0"
              >
                <Undo className="h-5 w-5" />
              </Button>

              <Button
                size="default"
                variant="outline"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="h-10 w-10 p-0"
              >
                <Redo className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="default"
                variant="outline"
                onClick={clearCanvas}
                className="h-10 px-4"
              >
                <Trash2 className="h-5 w-5 mr-2" /> Clear
              </Button>

              <Button
                size="default"
                variant="outline"
                onClick={handleImageUpload}
                className="h-10 px-4"
              >
                <Upload className="h-5 w-5 mr-2" /> Upload
              </Button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelected}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Canvas */}
        <div className="w-full h-full flex-1">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={finishDrawing}
            className="w-full h-full border border-gray-200 rounded-md bg-white touch-none"
          />
        </div>
      </div>
    );
  }
);

MathCanvas.displayName = "MathCanvas";
export default MathCanvas;
