import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, PencilBrush, Object as FabricObject } from "fabric";
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
      preserveObjectStacking: true,
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

    const createStar = (x: number, y: number): FabricObject => {
      const points = [];
      const outerRadius = 50;
      const innerRadius = 25;
      const numPoints = 5;
      
      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / numPoints;
        points.push({
          x: x + radius * Math.sin(angle),
          y: y + radius * Math.cos(angle),
        });
      }
      
      return new fabric.Polygon(points, {
        fill: activeColor,
        left: x - outerRadius,
        top: y - outerRadius,
      });
    };

    const handleToolAction = (options: { e: Event; pointer: { x: number; y: number } }) => {
      if (!fabricCanvas || activeTool === "select" || activeTool === "draw") return;

      const pointer = options.pointer;
      
      switch (activeTool) {
        case "rectangle":
          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            fill: activeColor,
            width: 100,
            height: 100,
          });
          fabricCanvas.add(rect);
          toast("Rectangle added!");
          break;
        
        case "circle":
          const circle = new Circle({
            left: pointer.x,
            top: pointer.y,
            fill: activeColor,
            radius: 50,
          });
          fabricCanvas.add(circle);
          toast("Circle added!");
          break;
        
        case "triangle":
          const triangle = new Triangle({
            left: pointer.x,
            top: pointer.y,
            fill: activeColor,
            width: 100,
            height: 100,
          });
          fabricCanvas.add(triangle);
          toast("Triangle added!");
          break;
        
        case "line":
          const line = new Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], {
            stroke: activeColor,
            strokeWidth: 3,
          });
          fabricCanvas.add(line);
          toast("Line added!");
          break;
        
        case "star":
          const star = createStar(pointer.x, pointer.y);
          fabricCanvas.add(star);
          toast("Star added!");
          break;
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