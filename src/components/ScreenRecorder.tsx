import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { toast } from "sonner";
import { startScreenRecording } from "@/utils/mediaUtils";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";

export const ScreenRecorder = forwardRef((props, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      try {
        console.log("Starting recording setup...");
        const combinedStream = await startScreenRecording();
        streamRef.current = combinedStream;
        
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
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setVideoBlob(blob);
          setShowPreview(true);

          // Cleanup streams
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log(`Stopped track: ${track.kind}`);
            });
            streamRef.current = null;
          }
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    },
    pauseRecording: () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        toast.success("Recording paused");
      }
    },
    resumeRecording: () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
        toast.success("Recording resumed");
      }
    }
  }));

  return (
    <RecordingPreviewDialog
      isOpen={showPreview}
      onOpenChange={setShowPreview}
      videoUrl={videoUrl}
      videoBlob={videoBlob}
    />
  );
});

ScreenRecorder.displayName = 'ScreenRecorder';