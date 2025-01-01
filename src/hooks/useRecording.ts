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
      console.log("Initializing recording...");
      const stream = await startScreenRecording();
      if (!stream) {
        console.error("Failed to get media stream");
        throw new Error("Failed to get media stream");
      }
      console.log("Media stream obtained successfully");

      setPreviewStream(stream);
      console.log("Creating MediaRecorder instance...");
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Received data chunk of size: ${event.data.size} bytes`);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        console.log("MediaRecorder started recording");
        setIsRecording(true);
        toast.success("Recording started");
      };

      recorder.onstop = () => {
        console.log("MediaRecorder stopped recording");
        setIsRecording(false);
        if (recordedChunks.length > 0) {
          console.log(`Processing ${recordedChunks.length} recorded chunks`);
          handleSaveRecording();
        }
      };

      recorder.onpause = () => {
        console.log("MediaRecorder paused");
        setIsPaused(true);
        toast.info("Recording paused");
      };
      
      recorder.onresume = () => {
        console.log("MediaRecorder resumed");
        setIsPaused(false);
        toast.info("Recording resumed");
      };

      setMediaRecorder(recorder);
      console.log("Starting MediaRecorder with 1-second intervals");
      recorder.start(1000);
    } catch (error) {
      console.error('Error in startRecording:', error);
      toast.error("Failed to start recording. Please try again.");
      throw error;
    }
  }, [setIsRecording, setIsPaused, recordedChunks]);

  const handleSaveRecording = async () => {
    console.log("Starting save recording process...");
    
    if (!currentProjectId) {
      console.error("Save failed: No project ID available");
      toast.error("No project selected");
      return;
    }
    
    if (recordedChunks.length === 0) {
      console.error("Save failed: No recording chunks available");
      toast.error("No recording data available");
      return;
    }

    try {
      console.log(`Creating blob from ${recordedChunks.length} chunks...`);
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      console.log(`Created blob of size: ${blob.size} bytes`);

      console.log("Converting blob to base64...");
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result && typeof reader.result === 'string') {
          console.log("Base64 conversion complete");
          try {
            console.log("Saving recording to database...");
            const result = await saveRecordingToDatabase(
              currentProjectId,
              `Recording ${new Date().toISOString()}`,
              reader.result
            );
            console.log("Recording saved successfully:", result);
            setRecordedChunks([]);
            toast.success("Recording saved successfully");
          } catch (error) {
            console.error("Database save failed:", error);
            toast.error("Failed to save recording");
          }
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error processing recording:", error);
      toast.error("Failed to process recording");
    }
  };

  const handleRecordingClick = () => {
    console.log("Recording button clicked");
    if (!isRecording) {
      if (!currentProjectId) {
        console.log("No project selected, showing project dialog");
        setShowProjectDialog(true);
      } else {
        console.log("Starting new recording...");
        startRecording().catch(error => {
          console.error('Error starting recording:', error);
        });
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log("Stopping active recording...");
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
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
        console.log("Resuming recording...");
        mediaRecorder.resume();
      } else {
        console.log("Pausing recording...");
        mediaRecorder.pause();
      }
    }
  };

  const handleSaveBoardClick = async () => {
    console.log("Save board button clicked");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log("Stopping active recording before saving board");
      mediaRecorder.stop();
    } else if (recordedChunks.length > 0) {
      console.log("Saving existing recording chunks");
      await handleSaveRecording();
    }
    console.log("Proceeding to save board state");
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