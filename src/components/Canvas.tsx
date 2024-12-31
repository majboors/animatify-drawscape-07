import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Line, PencilBrush, Object as FabricObject, Polygon, util } from "fabric";
import { toast } from "sonner";
import { ExtendedCanvas } from "../types/fabric";

interface CanvasProps {
  activeTool: string;
  activeColor: string;
}

export interface CanvasRef {
  copy: () => void;
  paste: () => void;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(({ activeTool, activeColor }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);

  // Expose copy and paste methods to parent
  useImperativeHandle(ref, () => ({
    copy: () => {
      if (!fabricCanvas) return;
      const activeObject = fabricCanvas.getActiveObject();
      if (!activeObject) {
        toast.error("No object selected!");
        return;
      }
      
      // Create a deep clone of the object
      const json = activeObject.toJSON();
      const serializedObject = JSON.stringify(json);
      setClipboard(JSON.parse(serializedObject));
      toast.success("Object copied!");
    },
    paste: () => {
      if (!fabricCanvas || !clipboard) {
        toast.error("Nothing to paste!");
        return;
      }
      
      try {
        // Create new object from clipboard data
        util.enlivenObjects([clipboard], (objects: FabricObject[]) => {
          const pastedObj = objects[0];
          if (pastedObj) {
            pastedObj.set({
              left: (pastedObj.left || 0) + 10,
              top: (pastedObj.top || 0) + 10,
              evented: true,
            });
            
            fabricCanvas.add(pastedObj);
            fabricCanvas.setActiveObject(pastedObj);
            fabricCanvas.requestRenderAll();
            toast.success("Object pasted!");
          }
        });
      } catch (error) {
        console.error('Error pasting object:', error);
        toast.error("Failed to paste object");
      }
    }
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

    // Update active object color when color changes
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeTool === "select") {
      if (activeObject.type === 'line') {
        activeObject.set('stroke', activeColor);
      } else if (activeObject.type === 'path') {
        // For pencil drawings (paths), only update stroke by default
        activeObject.set('stroke', activeColor);
        // Only update fill if it's already filled
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
  }, [activeTool, activeColor, fabricCanvas]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );

});

Canvas.displayName = 'Canvas';
