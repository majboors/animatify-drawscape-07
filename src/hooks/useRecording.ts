import { useState, useCallback, useRef } from "react";
import { startScreenRecording, saveRecordingToStorage } from "@/utils/recordingUtils";
import { toast } from "sonner";

interface UseRecordingProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  onSaveBoard: () => void;
}

export const useRecording = ({
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
  onSaveBoard,
}: UseRecordingProps) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log("[useRecording] Starting recording process...");
      const stream = await startScreenRecording();
      
      if (!stream) {
        throw new Error("Failed to get media stream");
      }
      
      console.log("[useRecording] Got media stream:", stream.id);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`[useRecording] Received data chunk: ${event.data.size} bytes`);
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => {
        console.log("[useRecording] Recording started");
        setIsRecording(true);
        chunksRef.current = [];
        toast.success("Recording started");
      };

      recorder.onstop = async () => {
        console.log("[useRecording] Recording stopped");
        setIsRecording(false);
        
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          console.log("[useRecording] Created blob:", blob.size, "bytes");
          
          if (currentProjectId) {
            try {
              const recordingData = await saveRecordingToStorage(
                currentProjectId,
                `Recording ${new Date().toISOString()}`,
                blob
              );
              
              if (recordingData?.video_data) {
                setPreviewVideoUrl(recordingData.video_data);
                setShowPreviewDialog(true);
              }
              
              chunksRef.current = [];
            } catch (error) {
              console.error("[useRecording] Error saving recording:", error);
              toast.error("Failed to save recording");
            }
          }
        }

        // Clean up streams
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`[useRecording] Stopped track: ${track.kind}`);
        });
      };

      recorder.onpause = () => {
        console.log("[useRecording] Recording paused");
        setIsPaused(true);
        toast.info("Recording paused");
      };
      
      recorder.onresume = () => {
        console.log("[useRecording] Recording resumed");
        setIsPaused(false);
        toast.info("Recording resumed");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('[useRecording] Error starting recording:', error);
      toast.error("Failed to start recording");
      throw error;
    }
  }, [setIsRecording, setIsPaused, currentProjectId]);

  const handleRecordingClick = () => {
    console.log("[useRecording] Record button clicked", { 
      isRecording, 
      currentProjectId,
      mediaRecorderState: mediaRecorderRef.current?.state 
    });

    if (!isRecording) {
      if (!currentProjectId) {
        console.log("[useRecording] No project selected, showing dialog");
        setShowProjectDialog(true);
      } else {
        console.log("[useRecording] Starting new recording");
        startRecording().catch(console.error);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log("[useRecording] Stopping recording");
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsPaused(false);
      }
    }
  };

  const handlePauseResume = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        console.log("[useRecording] Resuming recording");
        mediaRecorderRef.current.resume();
      } else {
        console.log("[useRecording] Pausing recording");
        mediaRecorderRef.current.pause();
      }
    }
  };

  const handleSaveBoardClick = async () => {
    console.log("[useRecording] Save board clicked");
    await onSaveBoard();
    toast.success("Board state saved");
  };

  return {
    handleRecordingClick,
    handlePauseResume,
    handleSaveBoardClick,
    currentProjectId,
    setCurrentProjectId,
    startRecording,
    showProjectDialog,
    setShowProjectDialog,
    showPreviewDialog,
    setShowPreviewDialog,
    previewVideoUrl,
  };
};