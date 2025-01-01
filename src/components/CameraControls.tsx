import { Button } from "@/components/ui/button";
import { RecordingControls } from "@/components/RecordingControls";
import { ProjectDialog } from "@/components/ProjectDialog";
import { RecordingPreviewDialog } from "@/components/RecordingPreviewDialog";
import { useRecording } from "@/hooks/useRecording";
import { useProjectDialog } from "@/hooks/useProjectDialog";
import { Sidebar } from "lucide-react";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
}: CameraControlsProps) => {
  const {
    handleRecordingClick,
    handlePauseResume,
    handleSaveBoardClick,
    currentProjectId,
    setCurrentProjectId,
    showProjectDialog,
    setShowProjectDialog,
    showPreviewDialog,
    setShowPreviewDialog,
    previewVideoUrl,
  } = useRecording({
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    onSaveBoard,
  });

  const { projectName, setProjectName, handleCreateProject } = useProjectDialog({
    setCurrentProjectId,
    setShowProjectDialog,
    onProjectCreated: handleRecordingClick,
  });

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2">
      <RecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        onRecordingClick={handleRecordingClick}
        onPauseResume={handlePauseResume}
        onSaveBoard={handleSaveBoardClick}
      />
      <Button variant="outline" size="icon" onClick={onToggleSidebar}>
        <Sidebar className="h-4 w-4" />
      </Button>
      {showProjectDialog && (
        <ProjectDialog
          isOpen={showProjectDialog}
          onOpenChange={setShowProjectDialog}
          onCreateProject={handleCreateProject}
          projectName={projectName}
          setProjectName={setProjectName}
        />
      )}
      {showPreviewDialog && (
        <RecordingPreviewDialog
          isOpen={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          videoUrl={previewVideoUrl}
        />
      )}
    </div>
  );
};