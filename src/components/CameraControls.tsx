import { Button } from "./ui/button";
import { Code } from "lucide-react";
import { ScreenRecorder } from "./ScreenRecorder";
import { Dispatch, SetStateAction } from "react";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
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