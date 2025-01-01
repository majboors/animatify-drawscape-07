import { Button } from "./ui/button";
import { Video, Play, Pause, Save, Square, X } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";
import { useState, useRef } from "react";
import { ScreenRecorder } from "./ScreenRecorder";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const screenRecorderRef = useRef(null);

  const handleRecordClick = () => {
    if (!isRecording) {
      setShowProjectDialog(true);
    } else {
      setShowRecordingDialog(true);
    }
  };

  const handleProjectCreated = (projectId: string) => {
    setShowProjectDialog(false);
    console.log("[RecordingControls] Project selected, starting recording with ID:", projectId);
    if (screenRecorderRef.current) {
      screenRecorderRef.current.startRecording();
      toast.success("Recording started successfully");
      setShowRecordingDialog(true);
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
      screenRecorderRef.current.stopRecording();
      toast.success("Recording stopped successfully");
      setShowRecordingDialog(false);
    }
    onRecordingClick();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRecordClick}
          className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
      </div>

      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recording Controls</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePauseResumeClick}
                disabled={!isRecording}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowRecordingDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="destructive"
              onClick={handleSaveClick}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Board
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Stop Recording
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
          </div>
        </DialogContent>
      </Dialog>

      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />

      <ScreenRecorder ref={screenRecorderRef} />
    </>
  );
};