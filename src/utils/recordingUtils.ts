import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoData: string
) => {
  try {
    // Convert base64 to blob
    const base64Data = atob(videoData);
    const arrayBuffer = new ArrayBuffer(base64Data.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < base64Data.length; i++) {
      uint8Array[i] = base64Data.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'video/webm' });

    // Upload to storage
    const fileName = `${Date.now()}-${recordingName}.webm`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('videos')
      .upload(fileName, blob);

    if (storageError) {
      console.error('Storage error:', storageError);
      throw storageError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log('Video uploaded successfully. Public URL:', publicUrlData.publicUrl);

    // Save recording reference to database
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: publicUrlData.publicUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Recording saved to database:', data);
    toast.success("Recording saved successfully!");
    return data;
  } catch (error) {
    console.error('Error in saveRecordingToDatabase:', error);
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