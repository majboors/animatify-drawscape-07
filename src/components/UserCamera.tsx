import { Camera } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const UserCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleCamera = async () => {
    try {
      if (!isActive) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsActive(true);
        toast.success("Camera started");
      } else {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsActive(false);
        toast.info("Camera stopped");
      }
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  useEffect(() => {
    // Auto-start camera on component mount
    toggleCamera();
    
    // Cleanup on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-30">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-full w-32 h-32 object-cover border-2 border-white shadow-lg"
        />
        <Button
          variant="outline"
          size="icon"
          className={`absolute -top-2 -right-2 rounded-full ${
            isActive ? "bg-red-500 text-white hover:bg-red-600" : ""
          }`}
          onClick={toggleCamera}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 text-center text-sm font-medium text-gray-700">
        Your Camera
      </div>
    </div>
  );
};