import { useEffect } from "react";
import { Object as FabricObject } from "fabric";
import { toast } from "sonner";
import { ExtendedCanvas, ExtendedFabricObject } from "../types/fabric";

export const useClipboard = (fabricCanvas: ExtendedCanvas | null) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === 'c') {
        const activeObject = fabricCanvas.getActiveObject();
        if (!activeObject) return;
        
        try {
          const cloned = await activeObject.clone();
          fabricCanvas.clipboard = cloned;
          toast("Object copied!");
        } catch (error) {
          console.error('Error copying object:', error);
          toast("Failed to copy object");
        }
      }

      if (e.key === 'v') {
        if (!fabricCanvas.clipboard) return;
        
        try {
          const clonedObj = await fabricCanvas.clipboard.clone();
          fabricCanvas.discardActiveObject();
          
          if (clonedObj) {
            clonedObj.set({
              left: (clonedObj.left || 0) + 10,
              top: (clonedObj.top || 0) + 10,
              evented: true,
            });

            const extendedClonedObj = clonedObj as ExtendedFabricObject;
            
            if (extendedClonedObj.type === 'activeSelection' && extendedClonedObj.forEachObject) {
              extendedClonedObj.canvas = fabricCanvas;
              extendedClonedObj.forEachObject((obj: FabricObject) => {
                fabricCanvas.add(obj);
              });
            } else {
              fabricCanvas.add(clonedObj);
            }
            
            fabricCanvas.setActiveObject(clonedObj);
            fabricCanvas.requestRenderAll();
            toast("Object pasted!");
          }
        } catch (error) {
          console.error('Error pasting object:', error);
          toast("Failed to paste object");
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas]);
};