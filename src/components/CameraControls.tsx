import { Button } from "./ui/button";
import { Code } from "lucide-react";
import { ScreenRecorder } from "./ScreenRecorder";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
}: CameraControlsProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleSidebar}
      >
        <Code className="h-4 w-4" />
      </Button>
      <ScreenRecorder />
    </div>
  );
};