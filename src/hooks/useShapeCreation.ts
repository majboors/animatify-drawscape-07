import { useEffect } from "react";
import { Circle, Line, Polygon, Rect, Triangle } from "fabric";
import { toast } from "sonner";
import { ExtendedCanvas } from "../types/fabric";

export const useShapeCreation = (
  fabricCanvas: ExtendedCanvas | null,
  activeTool: string,
  activeColor: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    const createStar = (x: number, y: number) => {
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
    return () => fabricCanvas.off("mouse:down", handleToolAction);
  }, [activeTool, activeColor, fabricCanvas]);
};