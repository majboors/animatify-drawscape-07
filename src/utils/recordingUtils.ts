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
    
    // Request screen capture
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { 
        displaySurface: "browser",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      }
    });

    // Request microphone separately
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
      toast.warning("Recording without audio - microphone access denied");
      return screenStream;
    }

    // Combine both streams
    const tracks = [
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ];

    return new MediaStream(tracks);
  } catch (error: any) {
    console.error('Error starting recording:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Screen sharing permission denied. Please allow access to continue.");
    } else if (error.name === 'InvalidStateError') {
      throw new Error("Another recording is already in progress. Please stop it first.");
    } else {
      throw new Error("Failed to start recording. Please try again.");
    }
  }
};