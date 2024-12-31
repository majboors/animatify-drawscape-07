import { useState, useRef, useEffect } from "react";
import { Camera, Video, Pause, Play, List, Save } from "lucide-react";
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
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  
  const {
    handleRecordingClick,
    handlePauseResume,
    handleSaveBoardClick,
    currentProjectId,
    setCurrentProjectId,
    startRecording,
    previewStream,
    setPreviewStream,
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

  // Handle preview stream
  useEffect(() => {
    if (videoPreviewRef.current && previewStream) {
      videoPreviewRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {previewStream && (
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg w-48 h-36 object-cover border-2 border-white shadow-lg mb-2"
        />
      )}
      <div className="flex items-center space-x-2">
        {showControls && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecordingClick}
              className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
            >
              <Video className="h-4 w-4" />
            </Button>
            {isRecording && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePauseResume}
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
                  onClick={handleSaveBoardClick}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            )}
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