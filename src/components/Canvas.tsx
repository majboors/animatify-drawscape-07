import { useEffect, useRef, useState } from "react";
import { Object as FabricObject } from "fabric";
import { ExtendedCanvas } from "../types/fabric";
import { useCanvasSetup } from "../hooks/useCanvasSetup";
import { useClipboard } from "../hooks/useClipboard";
import { useShapeCreation } from "../hooks/useShapeCreation";

interface CanvasProps {
  activeTool: string;
  activeColor: string;
}

export const Canvas = ({ activeTool, activeColor }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);

  useCanvasSetup(canvasRef, activeColor, setFabricCanvas);
  useClipboard(fabricCanvas);
  useShapeCreation(fabricCanvas, activeTool, activeColor);

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
      } else if (activeObject.type === 'path') {
        // For pencil drawings (paths)
        activeObject.set('stroke', activeColor);
        activeObject.set('fill', activeColor);
      } else {
        activeObject.set('fill', activeColor);
      }
      fabricCanvas.requestRenderAll();
    }

    // Add object:added event listener to handle pencil drawings
    fabricCanvas.on('path:created', (e: any) => {
      const path = e.path;
      if (path) {
        // Make the path selectable and fillable
        path.set({
          selectable: true,
          fill: activeColor,
          perPixelTargetFind: true
        });
        fabricCanvas.requestRenderAll();
      }
    });

    // Add selection:created event listener to update color when object is selected
    fabricCanvas.on('selection:created', (e) => {
      if (activeTool === "select" && e.selected) {
        const selectedObject = e.selected[0];
        if (selectedObject.type === 'line') {
          selectedObject.set('stroke', activeColor);
        } else if (selectedObject.type === 'path') {
          // For pencil drawings (paths)
          selectedObject.set('stroke', activeColor);
          selectedObject.set('fill', activeColor);
        } else {
          selectedObject.set('fill', activeColor);
        }
        fabricCanvas.requestRenderAll();
      }
    });
  }, [activeTool, activeColor, fabricCanvas]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};