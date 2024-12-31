import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, PencilBrush, Object as FabricObject, Polygon } from "fabric";
import { toast } from "sonner";

// Extend FabricCanvas type to include clipboard
interface ExtendedCanvas extends FabricCanvas {
  clipboard?: FabricObject;
}

// Extend FabricObject type to include possible activeSelection properties
interface ExtendedFabricObject extends FabricObject {
  canvas?: FabricCanvas;
  forEachObject?: (callback: (obj: FabricObject) => void) => void;
}

interface CanvasProps {
  activeTool: string;
  activeColor: string;
}

export const Canvas = ({ activeTool, activeColor }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    }) as ExtendedCanvas;

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = activeColor;

    // Setup keyboard event listeners for copy/paste
    document.addEventListener('keydown', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === 'c') {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        activeObject.clone((cloned: FabricObject) => {
          canvas.clipboard = cloned;
          toast("Object copied!");
        });
      }

      if (e.key === 'v') {
        if (!canvas.clipboard) return;
        canvas.clipboard.clone((clonedObj: ExtendedFabricObject) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left! + 10,
            top: clonedObj.top! + 10,
            evented: true,
          });
          if (clonedObj.type === 'activeSelection' && clonedObj.forEachObject) {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj: FabricObject) => {
              canvas.add(obj);
            });
          } else {
            canvas.add(clonedObj);
          }
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
          toast("Object pasted!");
        });
      }
    });

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

    // Update active object color when color changes
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeTool === "select") {
      if (activeObject.type === 'line') {
        activeObject.set('stroke', activeColor);
      } else {
        activeObject.set('fill', activeColor);
      }
      fabricCanvas.requestRenderAll();
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
      
      return new Polygon(points, {
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

    // Add object:modified event listener to update color when object is selected
    fabricCanvas.on('selection:created', (e) => {
      if (activeTool === "select" && e.selected) {
        const selectedObject = e.selected[0];
        if (selectedObject.type === 'line') {
          selectedObject.set('stroke', activeColor);
        } else {
          selectedObject.set('fill', activeColor);
        }
        fabricCanvas.requestRenderAll();
      }
    });

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