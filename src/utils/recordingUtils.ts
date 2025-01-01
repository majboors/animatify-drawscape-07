import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoData: string
) => {
  try {
    const { error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: videoData
      });

    if (error) throw error;
    toast.success("Recording saved successfully");
  } catch (error) {
    console.error('Error saving recording:', error);
    toast.error("Failed to save recording");
  }
};

export const startScreenRecording = async () => {
  try {
    console.log("Requesting screen and audio permissions...");
    
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { 
        displaySurface: "browser",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true 
    });

    let micStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
    } catch (micError) {
      console.warn('Microphone access denied:', micError);
      toast.warning("Microphone access denied. Recording without audio.");
      return screenStream;
    }

    const combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ]);
    
    return combinedStream;
  } catch (error) {
    console.error('Error starting recording:', error);
    toast.error("Failed to start recording. Please check permissions.");
    return null;
  }
};