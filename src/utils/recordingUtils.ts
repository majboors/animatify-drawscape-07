import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      audio: true
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

    const combinedStream = new MediaStream(tracks);
    console.log("[recordingUtils] Recording setup complete with tracks:", tracks.length);
    return combinedStream;
  } catch (error: any) {
    console.error("[recordingUtils] Recording setup error:", error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing and audio access to start recording");
    }
    throw error;
  }
};

export const saveRecordingToStorage = async (
  projectId: string,
  recordingName: string,
  videoBlob: Blob
) => {
  try {
    console.log("[recordingUtils] Starting save process...");
    console.log("[recordingUtils] Project ID:", projectId);
    console.log("[recordingUtils] Recording name:", recordingName);
    console.log("[recordingUtils] Video size:", videoBlob.size, "bytes");

    // Create a unique file path
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const filePath = `${projectId}/${timestamp}-${uuid}.webm`;
    console.log("[recordingUtils] Uploading to storage path:", filePath);

    // Upload to storage bucket
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('videos')
      .upload(filePath, videoBlob, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false
      });

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

    // Ensure the URL is properly decoded
    const decodedUrl = decodeURIComponent(publicUrl);
    console.log("[recordingUtils] Public URL:", decodedUrl);

    // Save recording metadata to database
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: decodedUrl
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