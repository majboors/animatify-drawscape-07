import { useState, useCallback } from "react";
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log("[useRecording] Initializing recording process...");
      const stream = await startScreenRecording();
      if (!stream) {
        console.error("[useRecording] Failed to get media stream");
        throw new Error("Failed to get media stream");
      }
      console.log("[useRecording] Media stream obtained successfully:", stream.id);

      setPreviewStream(stream);
      console.log("[useRecording] Creating MediaRecorder instance...");
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`[useRecording] Received data chunk of size: ${event.data.size} bytes`);
          setRecordedChunks(prev => {
            console.log(`[useRecording] Adding chunk. Total chunks: ${prev.length + 1}`);
            return [...prev, event.data];
          });
        }
      };

      recorder.onstart = () => {
        console.log("[useRecording] MediaRecorder started recording");
        setIsRecording(true);
        toast.success("Recording started");
      };

      recorder.onstop = () => {
        console.log("[useRecording] MediaRecorder stopped recording");
        setIsRecording(false);
        if (recordedChunks.length > 0) {
          console.log(`[useRecording] Processing ${recordedChunks.length} recorded chunks`);
          handleSaveRecording();
        }
      };

      recorder.onpause = () => {
        console.log("[useRecording] MediaRecorder paused");
        setIsPaused(true);
        toast.info("Recording paused");
      };
      
      recorder.onresume = () => {
        console.log("[useRecording] MediaRecorder resumed");
        setIsPaused(false);
        toast.info("Recording resumed");
      };

      setMediaRecorder(recorder);
      console.log("[useRecording] Starting MediaRecorder with 1-second intervals");
      recorder.start(1000);
    } catch (error) {
      console.error('[useRecording] Error in startRecording:', error);
      toast.error("Failed to start recording. Please try again.");
      throw error;
    }
  }, [setIsRecording, setIsPaused, recordedChunks]);

  const handleSaveRecording = async () => {
    console.log("[useRecording] Starting save recording process...");
    
    if (!currentProjectId) {
      console.error("[useRecording] Save failed: No project ID available");
      toast.error("No project selected");
      return;
    }
    
    if (recordedChunks.length === 0) {
      console.error("[useRecording] Save failed: No recording chunks available");
      toast.error("No recording data available");
      return;
    }

    try {
      console.log(`[useRecording] Creating blob from ${recordedChunks.length} chunks...`);
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      console.log(`[useRecording] Created blob of size: ${blob.size} bytes`);

      await saveRecordingToDatabase(
        currentProjectId,
        `Recording ${new Date().toISOString()}`,
        blob
      );

      setRecordedChunks([]);
      console.log("[useRecording] Recording saved and chunks cleared");
    } catch (error) {
      console.error("[useRecording] Error processing recording:", error);
      toast.error("Failed to process recording");
    }
  };

  const handleRecordingClick = () => {
    console.log("[useRecording] Recording button clicked, current state:", { 
      isRecording, 
      currentProjectId, 
      mediaRecorderState: mediaRecorder?.state 
    });

    if (!isRecording) {
      if (!currentProjectId) {
        console.log("[useRecording] No project selected, showing project dialog");
        setShowProjectDialog(true);
      } else {
        console.log("[useRecording] Starting new recording...");
        startRecording().catch(error => {
          console.error('[useRecording] Error starting recording:', error);
        });
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log("[useRecording] Stopping active recording...");
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
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
    if (mediaRecorder) {
      if (isPaused) {
        console.log("[useRecording] Resuming recording...");
        mediaRecorder.resume();
      } else {
        console.log("[useRecording] Pausing recording...");
        mediaRecorder.pause();
      }
    }
  };

  const handleSaveBoardClick = async () => {
    console.log("[useRecording] Save board button clicked");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log("[useRecording] Stopping active recording before saving board");
      mediaRecorder.stop();
    } else if (recordedChunks.length > 0) {
      console.log("[useRecording] Saving existing recording chunks");
      await handleSaveRecording();
    }
    console.log("[useRecording] Proceeding to save board state");
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