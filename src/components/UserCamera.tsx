import { Camera } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const UserCamera = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleCamera = async () => {
    try {
      // In a real implementation, this would handle camera access
      setIsActive(!isActive);
      toast.info(isActive ? "Camera stopped" : "Camera started (demo)");
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed right-4 top-28 z-50 rounded-full ${
        isActive ? "bg-red-500 text-white hover:bg-red-600" : ""
      }`}
      onClick={toggleCamera}
    >
      <Camera className="h-4 w-4" />
    </Button>
  );
};