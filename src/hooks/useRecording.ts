import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            try {
              const base64data = (reader.result as string).split(',')[1];
              
              if (currentProjectId) {
                const { error: recordingError } = await supabase
                  .from('recordings')
                  .insert({
                    project_id: currentProjectId,
                    name: `Recording ${new Date().toISOString()}`,
                    video_data: base64data
                  });

                if (recordingError) throw recordingError;
                toast.success("Recording saved successfully");
                setRecordedChunks([]);
              }
            } catch (error) {
              console.error('Error saving recording:', error);
              toast.error("Failed to save recording");
            }
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error processing recording:', error);
          toast.error("Failed to process recording");
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  }, [currentProjectId, recordedChunks, setIsRecording]);

  const handleRecordingClick = () => {
    if (!isRecording) {
      setShowProjectDialog(true);
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
      }
    }
  };

  const handlePauseResume = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
        toast.success("Recording resumed");
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
        toast.success("Recording paused");
      }
    }
  };

  const handleSaveBoardClick = () => {
    onSaveBoard();
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
  };
};