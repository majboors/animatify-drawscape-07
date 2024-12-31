import { useEffect } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { ExtendedCanvas } from "../types/fabric";

export const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  activeColor: string,
  setFabricCanvas: (canvas: ExtendedCanvas | null) => void
) => {
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
};