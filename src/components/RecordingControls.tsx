import { useState, useRef } from "react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";
import { ScreenRecorder } from "./ScreenRecorder";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";
import { InlineRecordingControls } from "./InlineRecordingControls";

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
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const screenRecorderRef = useRef<any>(null);

  const handleRecordClick = () => {
    if (!isRecording) {
      setShowProjectDialog(true);
    }
  };

  const handleProjectCreated = async (projectId: string) => {
    setShowProjectDialog(false);
    setCurrentProjectId(projectId);
    console.log("[RecordingControls] Project selected, starting recording with ID:", projectId);
    if (screenRecorderRef.current) {
      screenRecorderRef.current.startRecording();
      onRecordingClick();
      toast.success("Recording started successfully");
    }
  };

  const handlePauseResumeClick = () => {
    console.log("[RecordingControls] Pause/Resume button clicked", { isPaused });
    if (screenRecorderRef.current) {
      if (isPaused) {
        screenRecorderRef.current.resumeRecording();
        toast.success("Recording resumed");
      } else {
        screenRecorderRef.current.pauseRecording();
        toast.success("Recording paused");
      }
    }
    onPauseResume();
  };

  const handleSaveClick = () => {
    console.log("[RecordingControls] Save button clicked");
    onSaveBoard();
    toast.success("Board saved successfully");
  };

  const handleStopRecording = () => {
    if (screenRecorderRef.current) {
      screenRecorderRef.current.stopRecording((blob: Blob) => {
        setRecordingBlob(blob);
        setShowPreviewDialog(true);
      });
      toast.success("Recording stopped successfully");
    }
    onRecordingClick();
  };

  return (
    <>
      <InlineRecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        onRecordingClick={handleRecordClick}
        onPauseResume={handlePauseResumeClick}
        onSaveBoard={handleSaveClick}
        onStopRecording={handleStopRecording}
      />

      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />

      <RecordingPreviewDialog
        isOpen={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        videoBlob={recordingBlob}
        projectId={currentProjectId}
      />

      <ScreenRecorder ref={screenRecorderRef} projectId={currentProjectId} />
    </>
  );
};