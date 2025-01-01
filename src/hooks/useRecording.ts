import { useState, useCallback, useRef } from "react";
import { startScreenRecording, saveRecordingToDatabase } from "@/utils/recordingUtils";
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log("[useRecording] Starting recording process...");
      const stream = await startScreenRecording();
      if (!stream) {
        throw new Error("Failed to get media stream");
      }
      console.log("[useRecording] Got media stream:", stream.id);

      setPreviewStream(stream);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
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
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          console.log("[useRecording] Created blob:", blob.size, "bytes");
          if (currentProjectId) {
            await saveRecordingToDatabase(
              currentProjectId,
              `Recording ${new Date().toISOString()}`,
              blob
            );
          }
        }
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
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach(track => {
          console.log(`[useRecording] Stopping track: ${track.kind}`);
          track.stop();
        });
        setIsRecording(false);
        setIsPaused(false);
        setPreviewStream(null);
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
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log("[useRecording] Stopping recording before saving board");
      mediaRecorderRef.current.stop();
    }
    console.log("[useRecording] Saving board state");
    await onSaveBoard();
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
    previewStream,
    setPreviewStream,
  };
};