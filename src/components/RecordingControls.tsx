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
  const handleRecordClick = () => {
    console.log("Record button clicked");
    onRecordingClick();
  };

  const handlePauseResumeClick = () => {
    console.log(`${isPaused ? "Resume" : "Pause"} button clicked`);
    onPauseResume();
  };

  const handleSaveClick = () => {
    console.log("Save button clicked");
    onSaveBoard();
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRecordClick}
        className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
      >
        <Video className="h-4 w-4" />
      </Button>
      {isRecording && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePauseResumeClick}
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
            onClick={handleSaveClick}
          >
            <Save className="h-4 w-4" />
          </Button>
        </>
      )}
    </>
  );
};