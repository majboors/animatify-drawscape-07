import { Button } from "./ui/button";
import { Video, Play, Pause, Save } from "lucide-react";
import { toast } from "sonner";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onRecordingClick: () => void;
  onPauseResume: () => void;
  onSaveBoard: () => void;
}

export const RecordingControls = ({
  isRecording,
  isPaused,
  onRecordingClick,
  onPauseResume,
  onSaveBoard,
}: RecordingControlsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={onRecordingClick}
        className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
      >
        <Video className="h-4 w-4" />
      </Button>
      {isRecording && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={onPauseResume}
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSaveBoard}
          >
            <Save className="h-4 w-4" />
          </Button>
        </>
      )}
    </>
  );
};