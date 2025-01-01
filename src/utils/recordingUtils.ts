import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoBlob: Blob
) => {
  try {
    console.log("[recordingUtils] Starting save process...");
    console.log("[recordingUtils] Project ID:", projectId);
    console.log("[recordingUtils] Recording name:", recordingName);
    console.log("[recordingUtils] Video size:", videoBlob.size, "bytes");

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await videoBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("[recordingUtils] Saving to database...");
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: uint8Array,
      })
      .select()
      .single();

    if (error) {
      console.error("[recordingUtils] Database error:", error);
      throw error;
    }

    console.log("[recordingUtils] Recording saved:", data);
    toast.success("Recording saved successfully");
    return data;
  } catch (error) {
    console.error("[recordingUtils] Error saving recording:", error);
    toast.error("Failed to save recording");
    throw error;
  }
};

export const startScreenRecording = async () => {
  try {
    console.log("[recordingUtils] Requesting screen share...");
    const screenStream = await requestScreenShare();
    if (!screenStream) {
      throw new Error("Failed to get screen access");
    }

    const micStream = await requestMicrophoneAccess();
    if (!micStream) {
      console.log("[recordingUtils] No microphone access, recording without audio");
      return screenStream;
    }

    const tracks = [
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ];

    console.log("[recordingUtils] Recording setup complete");
    return new MediaStream(tracks);
  } catch (error: any) {
    console.error("[recordingUtils] Recording setup error:", error);
    throw error;
  }
};

export const requestScreenShare = async () => {
  try {
    console.log("[recordingUtils] Requesting screen share permission...");
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { 
        displaySurface: "browser",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      }
    });
    console.log("[recordingUtils] Screen share granted");
    return screenStream;
  } catch (error: any) {
    console.error("[recordingUtils] Screen share error:", error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing to start recording");
    }
    throw new Error("Failed to access screen sharing");
  }
};

export const requestMicrophoneAccess = async () => {
  try {
    console.log("[recordingUtils] Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });
    console.log("[recordingUtils] Microphone access granted");
    return stream;
  } catch (error) {
    console.warn("[recordingUtils] Microphone access denied:", error);
    return null;
  }
};