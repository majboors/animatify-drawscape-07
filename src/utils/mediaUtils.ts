import { supabase } from "@/integrations/supabase/client";

export const startScreenRecording = async () => {
  try {
    // Get microphone audio stream
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    console.log("Microphone stream acquired");

    // Get screen capture with system audio
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { 
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: true
    });
    console.log("Screen capture stream acquired");

    // Combine all tracks into one stream
    const tracks = [
      ...displayStream.getVideoTracks(),
      ...displayStream.getAudioTracks(),
      ...audioStream.getAudioTracks()
    ];
    
    return new MediaStream(tracks);
  } catch (error) {
    console.error("Failed to start recording:", error);
    throw error;
  }
};

export const uploadToSupabase = async (blob: Blob) => {
  const filename = `recording-${Date.now()}.webm`;
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filename, blob, {
      contentType: 'video/webm',
      cacheControl: '3600'
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filename);

  return publicUrl;
};