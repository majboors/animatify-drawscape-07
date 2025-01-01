import { useState } from "react";
import { Camera, List } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRecording } from "@/hooks/useRecording";
import { useProjectDialog } from "@/hooks/useProjectDialog";
import { RecordingPreview } from "./RecordingPreview";
import { RecordingControls } from "./RecordingControls";

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
  const [showControls, setShowControls] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const {
    handleRecordingClick,
    handlePauseResume,
    handleSaveBoardClick,
    showProjectDialog,
    setShowProjectDialog,
    previewStream,
    startRecording,
  } = useRecording({
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    onSaveBoard,
  });

  const {
    projectName,
    setProjectName,
    handleCreateProject,
  } = useProjectDialog({
    setIsRecording,
    setCurrentProjectId,
    startRecording,
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <RecordingPreview stream={previewStream} />
      <div className="flex items-center space-x-2">
        {showControls && (
          <>
            <RecordingControls
              isRecording={isRecording}
              isPaused={isPaused}
              onRecordingClick={handleRecordingClick}
              onPauseResume={handlePauseResume}
              onSaveBoard={handleSaveBoardClick}
            />
            <Button variant="outline" size="icon" onClick={onToggleSidebar}>
              <List className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project to start recording.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button onClick={handleCreateProject}>Create & Start Recording</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};