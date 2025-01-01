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
      const stream = await startScreenRecording();
      if (!stream) {
        throw new Error("Failed to get media stream");
      }

      setPreviewStream(stream);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Received data chunk of size:", event.data.size);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        console.log("Recording started");
        setIsRecording(true);
        toast.success("Recording started");
      };

      recorder.onstop = () => {
        console.log("Recording stopped");
        setIsRecording(false);
        if (recordedChunks.length > 0) {
          console.log("Total chunks recorded:", recordedChunks.length);
          handleSaveRecording();
        }
      };

      recorder.onpause = () => {
        setIsPaused(true);
        toast.info("Recording paused");
      };
      
      recorder.onresume = () => {
        setIsPaused(false);
        toast.info("Recording resumed");
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
      console.log("MediaRecorder started");
    } catch (error) {
      console.error('Error in startRecording:', error);
      toast.error("Failed to start recording. Please try again.");
      throw error;
    }
  }, [setIsRecording, setIsPaused, recordedChunks]);

  const handleSaveRecording = async () => {
    console.log("Handling save recording...");
    if (!currentProjectId) {
      console.error("No project ID available");
      toast.error("No project selected");
      return;
    }
    
    if (recordedChunks.length === 0) {
      console.error("No recording chunks available");
      toast.error("No recording data available");
      return;
    }

    try {
      console.log("Creating blob from chunks...");
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      console.log("Blob size:", blob.size);

      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result && typeof reader.result === 'string') {
          console.log("Converting recording to base64...");
          try {
            const result = await saveRecordingToDatabase(
              currentProjectId,
              `Recording ${new Date().toISOString()}`,
              reader.result
            );
            console.log("Recording saved successfully:", result);
            setRecordedChunks([]); // Clear chunks after successful save
            toast.success("Recording saved successfully");
          } catch (error) {
            console.error("Error saving recording:", error);
            toast.error("Failed to save recording");
          }
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error in handleSaveRecording:", error);
      toast.error("Failed to process recording");
    }
  };

  const handleRecordingClick = () => {
    if (!isRecording) {
      if (!currentProjectId) {
        setShowProjectDialog(true);
      } else {
        startRecording().catch(error => {
          console.error('Error in handleRecordingClick:', error);
        });
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log("Stopping recording...");
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
        setPreviewStream(null);
      }
    }
  };

  const handlePauseResume = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
    }
  };

  const handleSaveBoardClick = async () => {
    console.log("Save board clicked");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log("Stopping active recording before saving");
      mediaRecorder.stop();
    } else if (recordedChunks.length > 0) {
      console.log("Saving existing recording chunks");
      await handleSaveRecording();
    }
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