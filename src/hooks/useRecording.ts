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
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        toast.success("Recording started");
      };

      recorder.onstop = async () => {
        if (currentProjectId && recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: "video/mp4" });
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
              } catch (error) {
                console.error("Error saving recording:", error);
                toast.error("Failed to save recording");
              }
            }
          };

          reader.readAsDataURL(blob);
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
      recorder.start(1000);
    } catch (error) {
      console.error('Error in startRecording:', error);
      toast.error("Failed to start recording. Please try again.");
      throw error;
    }
  }, [currentProjectId, recordedChunks, setIsRecording, setIsPaused]);

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
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
        setPreviewStream(null);
        toast.success("Recording stopped");
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
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop(); // This will trigger the onstop event which saves the recording
    } else if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        if (reader.result && typeof reader.result === 'string' && currentProjectId) {
          console.log("Converting recording to base64...");
          try {
            const result = await saveRecordingToDatabase(
              currentProjectId,
              `Recording ${new Date().toISOString()}`,
              reader.result
            );
            console.log("Recording saved successfully:", result);
            setRecordedChunks([]); // Clear the chunks after successful save
          } catch (error) {
            console.error("Error saving recording:", error);
            toast.error("Failed to save recording");
          }
        }
      };

      reader.readAsDataURL(blob);
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