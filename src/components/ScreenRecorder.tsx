import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { toast } from "sonner";
import { startScreenRecording } from "@/utils/mediaUtils";
import { RecordingPreview } from "./RecordingPreview";
import { supabase } from "@/integrations/supabase/client";

export const ScreenRecorder = forwardRef((props, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      try {
        console.log("Starting recording setup...");
        const combinedStream = await startScreenRecording();
        
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
          
          try {
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

          // Cleanup streams
          combinedStream.getTracks().forEach(track => {
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
    },
    stopRecording: () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  }));

  return (
    <RecordingPreview
      open={showPreview}
      onOpenChange={setShowPreview}
      videoUrl={videoUrl}
    />
  );
});

ScreenRecorder.displayName = 'ScreenRecorder';