import { useState } from "react";
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);

  const getSupportedMimeType = () => {
    const mimeTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      ''  // Empty string lets browser choose
    ];

    for (const mimeType of mimeTypes) {
      if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      const mimeType = getSupportedMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;
      
      const recorder = new MediaRecorder(stream, recorderOptions);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        if (currentRecordingId) {
          const { error: updateError } = await supabase
            .from('recordings')
            .update({ 
              video_data: uint8Array 
            })
            .eq('id', currentRecordingId);

          if (updateError) {
            console.error('Error saving video:', updateError);
            toast.error("Failed to save video recording");
          } else {
            toast.success("Video recording saved successfully");
          }
        }
      };
      
      const { data: recordingData, error: recordingError } = await supabase
        .from('recordings')
        .insert([
          { 
            name: `Recording ${new Date().toLocaleString()}`,
            project_id: currentProjectId 
          }
        ])
        .select()
        .single();

      if (recordingError) {
        throw recordingError;
      }

      setCurrentRecordingId(recordingData.id);
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started with audio");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setCurrentProjectId(null);
      setCurrentRecordingId(null);
      toast.success("Recording stopped");
    }
  };

  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePauseResume = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleSaveBoardClick = () => {
    if (currentRecordingId) {
      onSaveBoard();
    } else {
      toast.error("No active recording to save board state");
    }
  };

  return {
    handleRecordingClick,
    handlePauseResume,
    handleSaveBoardClick,
    currentProjectId,
    setCurrentProjectId,
    startRecording,
  };
};