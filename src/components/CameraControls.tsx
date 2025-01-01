import { FolderKanban } from "lucide-react";
import { Button } from "./ui/button";
import { InlineRecordingControls } from "./InlineRecordingControls";
import { ScreenRecorder } from "./ScreenRecorder";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
}: CameraControlsProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const screenRecorderRef = useRef<any>(null);

  const handleRecordClick = () => {
    if (!isRecording) {
      setShowProjectDialog(true);
    }
  };

  const handleProjectCreated = async (projectId: string) => {
    setShowProjectDialog(false);
    setCurrentProjectId(projectId);
    if (screenRecorderRef.current) {
      await screenRecorderRef.current.startRecording();
      setIsRecording(true);
      toast.success("Recording started successfully");
    }
  };

  const handlePauseResume = () => {
    if (screenRecorderRef.current) {
      if (isPaused) {
        screenRecorderRef.current.resumeRecording();
        toast.success("Recording resumed");
      } else {
        screenRecorderRef.current.pauseRecording();
        toast.success("Recording paused");
      }
    }
    setIsPaused(!isPaused);
  };

  const handleSaveClick = () => {
    onSaveBoard();
    toast.success("Board saved successfully");
  };

  const handleStopRecording = () => {
    if (screenRecorderRef.current) {
      screenRecorderRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      toast.success("Recording stopped successfully");
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <Button variant="outline" size="icon" onClick={onToggleSidebar}>
          <FolderKanban className="h-4 w-4" />
        </Button>
        <InlineRecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          onRecordingClick={handleRecordClick}
          onPauseResume={handlePauseResume}
          onSaveBoard={handleSaveClick}
          onStopRecording={handleStopRecording}
        />
      </div>

      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />

      <ScreenRecorder ref={screenRecorderRef} projectId={currentProjectId} />
    </>
  );
};