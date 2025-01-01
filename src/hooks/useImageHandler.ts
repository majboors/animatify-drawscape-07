import { Image, Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";

export const useImageHandler = (fabricCanvas: FabricCanvas | null) => {
  const handleImageUpload = (url: string) => {
    if (!fabricCanvas) return;

    Image.fromURL(
      url,
      {
        crossOrigin: 'anonymous',
        objectCaching: false
      }
    ).then((img) => {
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
      toast.success("Image added to canvas!");
    }).catch((error) => {
      console.error('Error loading image:', error);
      toast.error("Failed to load image");
    });
  };

  return { handleImageUpload };
};