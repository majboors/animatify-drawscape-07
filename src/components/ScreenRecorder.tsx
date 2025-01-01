import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { toast } from "sonner";
import { startScreenRecording } from "@/utils/mediaUtils";
import { RecordingPreview } from "./RecordingPreview";
import { supabase } from "@/integrations/supabase/client";
import { ProjectDialog } from "./ProjectDialog";

export const ScreenRecorder = forwardRef((props, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
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
          setPendingBlob(blob);
          setShowProjectDialog(true);

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

  const handleProjectCreated = async (projectId: string) => {
    if (!pendingBlob) {
      toast.error("No recording data available");
      return;
    }

    try {
      const filename = `recording-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filename, pendingBlob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filename);

      console.log("Upload successful, public URL:", publicUrl);

      const { error: dbError } = await supabase
        .from('recordings')
        .insert([{
          project_id: projectId,
          name: `Recording ${new Date().toLocaleString()}`,
          video_data: publicUrl
        }]);

      if (dbError) throw dbError;

      setVideoUrl(publicUrl);
      setShowPreview(true);
      setPendingBlob(null);
      setShowProjectDialog(false);
      toast.success("Recording saved successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save recording");
    }
  };

  return (
    <>
      <RecordingPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        videoUrl={videoUrl}
      />
      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
});

ScreenRecorder.displayName = 'ScreenRecorder';