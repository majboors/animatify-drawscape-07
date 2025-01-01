import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoData: string
) => {
  try {
    console.log("Attempting to save recording:", { projectId, recordingName });
    
    if (!projectId || !recordingName || !videoData) {
      throw new Error("Missing required data for saving recording");
    }

    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: videoData
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error while saving recording:", error);
      throw error;
    }

    console.log("Recording saved successfully:", data);
    toast.success("Recording saved successfully!");
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
    console.log("Screen share permission granted");
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
    console.log("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });
    console.log("Microphone access granted");
    return stream;
  } catch (error) {
    console.warn('Microphone access denied:', error);
    return null;
  }
};

export const startScreenRecording = async () => {
  try {
    console.log("Starting screen recording...");
    const screenStream = await requestScreenShare();
    if (!screenStream) {
      throw new Error("Failed to get screen access");
    }

    const micStream = await requestMicrophoneAccess();
    if (!micStream) {
      console.log("Recording without audio - microphone access denied");
      return screenStream;
    }

    const tracks = [
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ];

    console.log("Screen recording started successfully");
    return new MediaStream(tracks);
  } catch (error: any) {
    console.error('Error starting recording:', error);
    throw error;
  }
};