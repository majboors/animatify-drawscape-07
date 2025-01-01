import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const requestScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true
    });
    return stream;
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing to start recording");
    }
    throw error;
  }
};

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

    // Convert video blob to MP4 File
    const file = new File([videoBlob], `recording-${Date.now()}.mp4`, {
      type: 'video/mp4',
    });

    // Create a unique file path
    const filePath = `${projectId}/${Date.now()}-${crypto.randomUUID()}.mp4`;
    console.log("[recordingUtils] Uploading to storage path:", filePath);

    // Upload to storage bucket
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('videos')
      .upload(filePath, file);

    if (storageError) {
      console.error("[recordingUtils] Storage error:", storageError);
      throw storageError;
    }

    console.log("[recordingUtils] Video uploaded to storage:", storageData);

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('videos')
      .getPublicUrl(filePath);

    console.log("[recordingUtils] Public URL:", publicUrl);

    // Save recording metadata to database
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: publicUrl
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
    console.log("[recordingUtils] Starting screen recording setup...");
    
    // Get screen stream with audio
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true // Capture system audio
    });

    // Get microphone audio
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });

    // Combine all tracks
    const tracks = [
      ...screenStream.getVideoTracks(),
      ...screenStream.getAudioTracks(),
      ...micStream.getAudioTracks()
    ];

    console.log("[recordingUtils] Recording setup complete with tracks:", tracks.length);
    return new MediaStream(tracks);
  } catch (error: any) {
    console.error("[recordingUtils] Recording setup error:", error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing and audio access to start recording");
    }
    throw error;
  }
};