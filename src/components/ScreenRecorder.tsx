import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

export const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log("Starting recording setup...");
      
      // Get microphone audio stream
      const micStream = await navigator.mediaDevices.getUserMedia({ 
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

      // Combine all audio tracks and video track
      const videoTrack = displayStream.getVideoTracks()[0];
      const audioTracks = [
        ...displayStream.getAudioTracks(),  // System audio
        ...micStream.getAudioTracks()       // Microphone audio
      ];
      
      const combinedStream = new MediaStream([videoTrack, ...audioTracks]);
      console.log(`Combined stream created with ${audioTracks.length} audio tracks`);
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Received data chunk:", event.data.size, "bytes");
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing...");
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadToSupabase(blob);
        
        // Cleanup streams
        [videoTrack, ...audioTracks].forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Recording setup error:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadToSupabase = async (blob: Blob) => {
    try {
      console.log("Uploading to Supabase...");
      const filename = `recording-${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filename, blob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filename);

      console.log("Upload successful, public URL:", publicUrl);
      setVideoUrl(publicUrl);
      setShowPreview(true);
      toast.success("Recording saved successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save recording");
    }
  };

  const handleCopyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
      >
        {isRecording ? "Stop" : "Start"}
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Recording Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {videoUrl && (
              <>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg border"
                />
                <div className="flex gap-2">
                  <Input
                    value={videoUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};