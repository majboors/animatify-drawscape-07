import { Button } from "./ui/button";
import { Video, Play, Pause, Save, Square, X } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";
import { useState, useRef } from "react";
import { ScreenRecorder } from "./ScreenRecorder";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";

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
      toast.success("Recording started successfully");
    }
    onRecordingClick();
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
      <div className="flex items-center gap-2">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={handleRecordClick}
          className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Video className="h-4 w-4" />}
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Stop Recording?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to stop the recording? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStopRecording}>
                    Stop Recording
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

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