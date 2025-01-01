import { Button } from "./ui/button";
import { Video, Play, Pause, Save, Square, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface InlineRecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onRecordingClick: () => void;
  onPauseResume: () => void;
  onSaveBoard: () => void;
  onStopRecording: () => void;
}

export const InlineRecordingControls = ({
  isRecording,
  isPaused,
  onRecordingClick,
  onPauseResume,
  onSaveBoard,
  onStopRecording,
}: InlineRecordingControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={isRecording ? onStopRecording : onRecordingClick}
        className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Video className="h-4 w-4" />}
      </Button>

      {isRecording && (
        <div className="flex items-center gap-2 animate-fade-in bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
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
                <AlertDialogAction onClick={onStopRecording}>
                  Stop Recording
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};