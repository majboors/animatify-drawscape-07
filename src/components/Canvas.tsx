import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, IText, Object as FabricObject, PencilBrush, util, Image } from "fabric";
import { toast } from "sonner";
import { ExtendedCanvas } from "../types/fabric";
import { useShapeCreation } from "../hooks/useShapeCreation";
import { useCanvasEvents } from "../hooks/useCanvasEvents";

interface CanvasProps {
  activeTool: string;
  activeColor: string;
  activeFont?: string;
}

export interface CanvasRef {
  copy: () => void;
  paste: () => void;
  group: () => void;
  ungroup: () => void;
  getFabricCanvas: () => ExtendedCanvas | null;
  toJSON: () => any; // Add the missing toJSON method
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(({ activeTool, activeColor, activeFont }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);
  const [clipboard, setClipboard] = useState<string | null>(null);

  // Use custom hooks
  useShapeCreation(fabricCanvas, activeTool, activeColor);
  useCanvasEvents(fabricCanvas, activeTool, activeColor, activeFont);

  const handleGroup = () => {
    if (!fabricCanvas) return;
    
    const activeSelection = fabricCanvas.getActiveObject();
    if (!activeSelection || !activeSelection.type.includes('Selection')) {
      toast.error("Select multiple objects first!");
      return;
    }

    if (activeSelection.type === 'activeSelection') {
      // @ts-ignore - fabric.js types are not complete
      activeSelection.toGroup();
      fabricCanvas.requestRenderAll();
      toast.success("Objects grouped!");
    }
  };

  const handleUngroup = () => {
    if (!fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
      toast.error("Select a group first!");
      return;
    }

    // @ts-ignore - fabric.js types are not complete
    activeObject.toActiveSelection();
    fabricCanvas.requestRenderAll();
    toast.success("Group ungrouped!");
  };

  useImperativeHandle(ref, () => ({
    copy: () => {
      if (!fabricCanvas) return;
      const activeObject = fabricCanvas.getActiveObject();
      if (!activeObject) {
        toast.error("No object selected!");
        return;
      }
      
      setClipboard(JSON.stringify(activeObject.toJSON()));
      toast.success("Object copied!");
    },
    paste: () => {
      if (!fabricCanvas || !clipboard) {
        toast.error("Nothing to paste!");
        return;
      }
      
      try {
        const objectData = JSON.parse(clipboard);
        
        util.enlivenObjects([objectData], {
          reviver: (obj: FabricObject) => {
            obj.set({
              left: (obj.left || 0) + 10,
              top: (obj.top || 0) + 10,
              evented: true,
            });
            
            fabricCanvas.add(obj);
            fabricCanvas.setActiveObject(obj);
            fabricCanvas.requestRenderAll();
            toast.success("Object pasted!");
          }
        });
      } catch (error) {
        console.error('Error pasting object:', error);
        toast.error("Failed to paste object");
      }
    },
    group: handleGroup,
    ungroup: handleUngroup,
    getFabricCanvas: () => fabricCanvas,
    toJSON: () => fabricCanvas?.toJSON() // Implement the toJSON method
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
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

    // Add board state loading handler
    const handleLoadBoardState = (event: CustomEvent) => {
      const boardData = event.detail;
      canvas.loadFromJSON(boardData, () => {
        canvas.renderAll();
        toast.success("Board state loaded!");
      });
    };

    window.addEventListener('loadBoardState', handleLoadBoardState as EventListener);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('loadBoardState', handleLoadBoardState as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }

    if (activeTool === "text") {
      const text = new IText("Click to edit text", {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: activeColor,
        fontFamily: activeFont || 'Arial'
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      fabricCanvas.requestRenderAll();
    }

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeTool === "select") {
      if (activeObject.type === 'i-text' && activeFont) {
        activeObject.set('fontFamily', activeFont);
      }
      if (activeObject.type === 'line') {
        activeObject.set('stroke', activeColor);
      } else if (activeObject.type === 'path') {
        activeObject.set('stroke', activeColor);
        if (activeObject.get('fill') !== null && activeObject.get('fill') !== '') {
          activeObject.set('fill', activeColor);
        }
      } else {
        activeObject.set('fill', activeColor);
      }
      fabricCanvas.requestRenderAll();
    }
  }, [activeTool, activeColor, activeFont, fabricCanvas]);

  const handleImageUpload = (url: string) => {
    if (!fabricCanvas) return;

    Image.fromURL(url, (img) => {
      // Scale image to fit within canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width || window.innerWidth;
      const canvasHeight = fabricCanvas.height || window.innerHeight - 100;
      const scale = Math.min(
        (canvasWidth * 0.5) / img.width!,
        (canvasHeight * 0.5) / img.height!
      );

      img.scale(scale);
      img.set({
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2
      });

      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.requestRenderAll();
    });
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});

Canvas.displayName = 'Canvas';
