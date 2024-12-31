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
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        if (currentProjectId) {
          const { data: recordingData, error: recordingError } = await supabase
            .from('recordings')
            .insert([
              { 
                project_id: currentProjectId,
                name: `Recording ${new Date().toISOString()}`,
                video_data: uint8Array
              }
            ])
            .select()
            .single();

          if (recordingError) {
            console.error('Error saving recording:', recordingError);
            toast.error("Failed to save recording");
            return;
          }

          const currentRecordingId = recordingData.id;

          // Update the recording with the video data
          const { error: updateError } = await supabase
            .from('recordings')
            .update({ 
              video_data: uint8Array
            })
            .eq('id', currentRecordingId);

          if (updateError) {
            console.error('Error updating recording:', updateError);
            toast.error("Failed to update recording");
            return;
          }

          toast.success("Recording saved successfully");
          setRecordedChunks([]);
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
    setShowProjectDialog,
  };
};