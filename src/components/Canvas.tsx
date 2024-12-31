import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush } from "fabric";
import { toast } from "sonner";

interface CanvasProps {
  activeTool: string;
  activeColor: string;
}

export const Canvas = ({ activeTool, activeColor }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: "#ffffff",
    });

    // Initialize drawing brush after canvas creation
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = activeColor;

    setFabricCanvas(canvas);

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 100,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }

    const handleToolAction = (options: { e: Event; pointer: { x: number; y: number } }) => {
      if (!fabricCanvas || activeTool === "select" || activeTool === "draw") return;

      const pointer = options.pointer;
      
      if (activeTool === "rectangle") {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          width: 100,
          height: 100,
        });
        fabricCanvas.add(rect);
        toast("Rectangle added!");
      } else if (activeTool === "circle") {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          radius: 50,
        });
        fabricCanvas.add(circle);
        toast("Circle added!");
      }
    };

    fabricCanvas.on("mouse:down", handleToolAction);

    return () => {
      fabricCanvas.off("mouse:down", handleToolAction);
    };
  }, [activeTool, activeColor, fabricCanvas]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};