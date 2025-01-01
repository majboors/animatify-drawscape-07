import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const saveRecordingToDatabase = async (
  projectId: string,
  recordingName: string,
  videoData: string
) => {
  try {
    console.log("Starting video upload process...");
    
    // Convert base64 to blob
    const base64Data = videoData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'video/webm' });
    console.log("Blob created:", blob.size, "bytes");

    // Generate unique filename
    const fileName = `${Date.now()}-${recordingName}.webm`;
    console.log("Uploading file:", fileName);

    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, blob, {
        contentType: 'video/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Video public URL:', publicUrl);

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
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Recording saved in database:', recordingData);
    return recordingData;
  } catch (error) {
    console.error('Error in saveRecordingToDatabase:', error);
    throw error;
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