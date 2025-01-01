import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";

interface ScreenRecorderProps {
  projectId?: string | null;
}

export const ScreenRecorder = forwardRef(({ projectId }: ScreenRecorderProps, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      try {
        console.log("Starting recording setup...");
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        });

        const tracks = [
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...audioStream.getAudioTracks()
        ];

        const combinedStream = new MediaStream(tracks);
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
          setVideoBlob(blob);
          setShowPreview(true);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log(`Stopped track: ${track.kind}`);
            });
            streamRef.current = null;
          }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        toast.success("Recording started");
      } catch (error) {
        console.error("Recording setup error:", error);
        toast.error("Failed to start recording");
      }
    },
    stopRecording: (callback?: (blob: Blob) => void) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (callback && chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          callback(blob);
        }
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
      videoBlob={videoBlob}
      projectId={projectId}
    />
  );
});

ScreenRecorder.displayName = 'ScreenRecorder';