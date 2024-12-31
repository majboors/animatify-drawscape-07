import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, PencilBrush, Object as FabricObject, Polygon, IText, util } from "fabric";
import { toast } from "sonner";
import { ExtendedCanvas } from "../types/fabric";
import { fontFamilies } from "../utils/textUtils";

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
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(({ activeTool, activeColor, activeFont }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);
  const [clipboard, setClipboard] = useState<string | null>(null);

  // Create local functions for group and ungroup
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
    ungroup: handleUngroup
  }));

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

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }

    // Handle text tool
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

    // Update active object properties
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

    // Add object:added event listener to handle pencil drawings
    fabricCanvas.on('path:created', (e: any) => {
      const path = e.path;
      if (path) {
        // Make the path selectable but without fill initially
        path.set({
          selectable: true,
          fill: null,  // No fill by default
          stroke: activeColor,
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
          selectedObject.set('stroke', activeColor);
          // Only update fill if it's already filled
          if (selectedObject.get('fill') !== null && selectedObject.get('fill') !== '') {
            selectedObject.set('fill', activeColor);
          }
        } else {
          selectedObject.set('fill', activeColor);
        }
        fabricCanvas.requestRenderAll();
      }
    });

    // Add double click handler to toggle fill for paths
    fabricCanvas.on('mouse:dblclick', (e) => {
      if (!e.target || e.target.type !== 'path') return;
      
      const pathObject = e.target;
      const currentFill = pathObject.get('fill');
      
      // Toggle fill
      if (!currentFill || currentFill === '') {
        pathObject.set('fill', activeColor);
        toast("Fill added to drawing!");
      } else {
        pathObject.set('fill', null);
        toast("Fill removed from drawing!");
      }
      
      fabricCanvas.requestRenderAll();
    });

    return () => {
      fabricCanvas.off("mouse:dblclick");
    };

  }, [activeTool, activeColor, activeFont, fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroup();
        } else {
          handleGroup();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});

Canvas.displayName = 'Canvas';
