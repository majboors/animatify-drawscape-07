import { Button } from "./ui/button";
import { Video, Play, Pause, Save } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";
import { useState, useRef } from "react";
import { ScreenRecorder } from "./ScreenRecorder";

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
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const screenRecorderRef = useRef(null);

  const handleRecordClick = () => {
    if (!isRecording) {
      setShowProjectDialog(true);
    } else {
      console.log("[RecordingControls] Stop recording clicked");
      onRecordingClick();
    }
  };

  const handleProjectCreated = (projectId: string) => {
    setShowProjectDialog(false);
    console.log("[RecordingControls] Project selected, starting recording with ID:", projectId);
    onRecordingClick();
    if (screenRecorderRef.current) {
      screenRecorderRef.current.startRecording();
    }
  };

  const handlePauseResumeClick = () => {
    console.log("[RecordingControls] Pause/Resume button clicked", { isPaused });
    onPauseResume();
  };

  const handleSaveClick = () => {
    console.log("[RecordingControls] Save button clicked");
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

      <ScreenRecorder ref={screenRecorderRef} />

      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};