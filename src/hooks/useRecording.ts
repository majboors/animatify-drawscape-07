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
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log("Requesting media permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      console.log("Media permissions granted, setting up preview...");
      setPreviewStream(stream);

      console.log("Creating MediaRecorder...");
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size);
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        console.log("Recording started");
        setIsRecording(true);
        toast.success("Recording started");
      };

      recorder.onstop = async () => {
        console.log("Recording stopped, processing...");
        try {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            console.log("Saving recording to database...");
            
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
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error saving recording:', error);
          toast.error("Failed to save recording");
        }
      };

      recorder.onpause = () => {
        console.log("Recording paused");
        setIsPaused(true);
        toast.success("Recording paused");
      };

      recorder.onresume = () => {
        console.log("Recording resumed");
        setIsPaused(false);
        toast.success("Recording resumed");
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
        toast.error("Recording error occurred");
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please make sure you have granted camera permissions.");
    }
  }, [currentProjectId, recordedChunks, setIsRecording, setIsPaused]);

  const handleRecordingClick = () => {
    console.log("Recording button clicked", { isRecording });
    if (!isRecording) {
      if (!currentProjectId) {
        console.log("No project ID, showing dialog");
        setShowProjectDialog(true);
      } else {
        console.log("Starting recording with existing project");
        startRecording();
      }
    } else {
      console.log("Stopping recording");
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
    console.log("Pause/Resume clicked", { isPaused, mediaRecorder: mediaRecorder?.state });
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
    }
  };

  const handleSaveBoardClick = () => {
    console.log("Saving board state");
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
    previewStream,
    setPreviewStream,
  };
};