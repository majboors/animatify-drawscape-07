import { FolderKanban } from "lucide-react";
import { Button } from "./ui/button";
import { RecordingControls } from "./RecordingControls";
import { ScreenRecorder } from "./ScreenRecorder";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  onStartRecording: () => void;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
  onStartRecording,
}: CameraControlsProps) => {
  const handleRecordingClick = () => {
    if (!isRecording) {
      onStartRecording();
    } else {
      setIsRecording(false);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onToggleSidebar}>
        <FolderKanban className="h-4 w-4" />
      </Button>
      <RecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        onRecordingClick={handleRecordingClick}
        onPauseResume={handlePauseResume}
        onSaveBoard={onSaveBoard}
      />
    </div>
  );
};