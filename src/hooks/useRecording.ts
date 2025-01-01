import { useState, useCallback } from "react";
import { startScreenRecording, saveRecordingToDatabase } from "@/utils/recordingUtils";

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
    const stream = await startScreenRecording();
    if (!stream) return;

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
    };

    recorder.onstop = async () => {
      if (currentProjectId) {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          await saveRecordingToDatabase(
            currentProjectId,
            `Recording ${new Date().toISOString()}`,
            base64data
          );
          setRecordedChunks([]);
        };

        reader.readAsDataURL(blob);
      }
    };

    recorder.onpause = () => setIsPaused(true);
    recorder.onresume = () => setIsPaused(false);

    setMediaRecorder(recorder);
    recorder.start(1000);
  }, [currentProjectId, recordedChunks, setIsRecording, setIsPaused]);

  const handleRecordingClick = () => {
    if (!isRecording) {
      if (!currentProjectId) {
        setShowProjectDialog(true);
      } else {
        startRecording();
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
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