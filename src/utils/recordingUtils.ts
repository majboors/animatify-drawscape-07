import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoBlob: Blob
) => {
  try {
    console.log("[recordingUtils] Starting video upload process...");
    console.log("[recordingUtils] Project ID:", projectId);
    console.log("[recordingUtils] Recording name:", recordingName);
    console.log("[recordingUtils] Video blob size:", videoBlob.size);

    // Generate unique filename
    const fileName = `${Date.now()}-${recordingName}.webm`;
    console.log("[recordingUtils] Uploading file:", fileName);

    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBlob, {
        contentType: 'video/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('[recordingUtils] Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log("[recordingUtils] Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('[recordingUtils] Video public URL:', publicUrl);

    // Save recording reference in database
    const { data: recordingData, error: dbError } = await supabase
      .from('recordings')
      .insert({
        project_id: projectId,
        name: recordingName,
        video_data: publicUrl
      })
      .select()
      .single();

    if (dbError) {
      console.error('[recordingUtils] Database error:', dbError);
      throw dbError;
    }

    console.log('[recordingUtils] Recording saved in database:', recordingData);
    toast.success("Recording saved successfully!");
    return recordingData;
  } catch (error) {
    console.error('[recordingUtils] Error in saveRecordingToDatabase:', error);
    toast.error("Failed to save recording");
    throw error;
  }
};

export const startScreenRecording = async () => {
  try {
    console.log("[recordingUtils] Starting screen recording...");
    const screenStream = await requestScreenShare();
    if (!screenStream) {
      throw new Error("Failed to get screen access");
    }

    const micStream = await requestMicrophoneAccess();
    if (!micStream) {
      console.log("[recordingUtils] Recording without audio - microphone access denied");
      return screenStream;
    }

    const tracks = [
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks()
    ];

    console.log("[recordingUtils] Screen recording started successfully");
    return new MediaStream(tracks);
  } catch (error: any) {
    console.error('[recordingUtils] Error starting recording:', error);
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
    console.log("[recordingUtils] Screen share permission granted");
    return screenStream;
  } catch (error: any) {
    console.error('[recordingUtils] Error requesting screen share:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error("Please allow screen sharing to start recording.");
    }
    throw new Error("Failed to access screen sharing. Please try again.");
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
    console.warn('[recordingUtils] Microphone access denied:', error);
    return null;
  }
};