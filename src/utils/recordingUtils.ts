import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoData: string
) => {
  try {
    console.log("Saving recording:", { projectId, recordingName });
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: videoData
      })
      .select()
      .single();

    if (error) throw error;
    console.log("Recording saved successfully:", data);
    toast.success("Recording saved successfully");
    return data;
  } catch (error) {
    console.error('Error saving recording:', error);
    toast.error("Failed to save recording");
    throw error;
  }
};

export const requestScreenShare = async () => {
  try {
    console.log("Requesting screen share permission...");
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { 
        displaySurface: "browser",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      }
    });
    return screenStream;
  } catch (error: any) {
    console.error('Error requesting screen share:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing to start recording.");
    }
    throw new Error("Failed to access screen sharing. Please try again.");
  }
};

export const requestMicrophoneAccess = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });
  } catch (error) {
    console.warn('Microphone access denied:', error);
    return null;
  }
};

export const startScreenRecording = async () => {
  try {
    // First request screen sharing permission
    const screenStream = await requestScreenShare();
    if (!screenStream) {
      throw new Error("Failed to get screen access");
    }

    // Then try to get microphone access
    const micStream = await requestMicrophoneAccess();
    if (!micStream) {
      console.log("Recording without audio - microphone access denied");
      return screenStream;
    }

    // Combine both streams if we have both
    const tracks = [
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ];

    return new MediaStream(tracks);
  } catch (error: any) {
    console.error('Error starting recording:', error);
    throw error;
  }
};