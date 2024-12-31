import { useEffect } from "react";
import { ExtendedCanvas } from "../types/fabric";
import { IText, Object as FabricObject, util } from "fabric";

export const useCanvasEvents = (
  fabricCanvas: ExtendedCanvas | null,
  activeTool: string,
  activeColor: string,
  activeFont?: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    // Add object:added event listener to handle pencil drawings
    fabricCanvas.on('path:created', (e: any) => {
      const path = e.path;
      if (path) {
        path.set({
          selectable: true,
          fill: null,
          stroke: activeColor,
          perPixelTargetFind: true
        });
        fabricCanvas.requestRenderAll();
      }
    });

    // Add selection:created event listener
    fabricCanvas.on('selection:created', (e) => {
      if (activeTool === "select" && e.selected) {
        const selectedObject = e.selected[0];
        if (selectedObject.type === 'line') {
          selectedObject.set('stroke', activeColor);
        } else if (selectedObject.type === 'path') {
          selectedObject.set('stroke', activeColor);
          if (selectedObject.get('fill') !== null && selectedObject.get('fill') !== '') {
            selectedObject.set('fill', activeColor);
          }
        } else {
          selectedObject.set('fill', activeColor);
        }
        fabricCanvas.requestRenderAll();
      }
    });

    // Add double click handler
    fabricCanvas.on('mouse:dblclick', (e) => {
      if (!e.target || e.target.type !== 'path') return;
      
      const pathObject = e.target;
      const currentFill = pathObject.get('fill');
      
      pathObject.set('fill', !currentFill || currentFill === '' ? activeColor : null);
      fabricCanvas.requestRenderAll();
    });

    return () => {
      fabricCanvas.off('path:created');
      fabricCanvas.off('selection:created');
      fabricCanvas.off('mouse:dblclick');
    };
  }, [fabricCanvas, activeTool, activeColor, activeFont]);
};