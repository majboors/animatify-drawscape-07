import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecordingPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoBlob: Blob | null;
  projectId?: string | null;
}

export const RecordingPreviewDialog = ({
  isOpen,
  onOpenChange,
  videoBlob,
  projectId
}: RecordingPreviewDialogProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveRecording = async () => {
    if (!videoBlob || !projectId) {
      toast.error("No recording or project to save");
      return;
    }

    setIsUploading(true);
    try {
      console.log("Starting video upload process...");
      const timestamp = Date.now();
      const filePath = `${projectId}/${timestamp}.mp4`;

      console.log("Uploading video to storage bucket...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoBlob, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the direct public URL for the video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Video uploaded successfully, public URL:", publicUrl);

      // Save recording metadata to database with direct URL and project ID
      const { data: recordingData, error: dbError } = await supabase
        .from('recordings')
        .insert({
          name: `Recording ${new Date().toLocaleString()}`,
          video_data: publicUrl,
          project_id: projectId
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      setVideoUrl(publicUrl);
      toast.success("Recording saved successfully");
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {videoBlob && (
            <div className="relative w-full aspect-video">
              <video
                src={URL.createObjectURL(videoBlob)}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black rounded-lg"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={handleSaveRecording}
              disabled={isUploading || !videoBlob}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUploading ? "Saving..." : "Save Recording"}
            </Button>
          </div>
          {videoUrl && (
            <div className="flex gap-2">
              <Input
                value={videoUrl}
                readOnly
                className="flex-1 text-sm font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};