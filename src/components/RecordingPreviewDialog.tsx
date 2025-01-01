import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialog } from "./ProjectDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecordingPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
  videoBlob: Blob | null;
}

export const RecordingPreviewDialog = ({
  isOpen,
  onOpenChange,
  videoUrl,
  videoBlob,
}: RecordingPreviewDialogProps) => {
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const handleCopyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard");
    }
  };

  const handleSaveRecording = () => {
    setShowProjectDialog(true);
  };

  const handleProjectCreated = async (projectId: string) => {
    if (!videoBlob) {
      toast.error("No recording available");
      return;
    }

    try {
      console.log("Starting video upload process...");
      
      // Convert Blob to File with .mp4 extension and proper MIME type
      const videoFile = new File([videoBlob], 'recording.mp4', { 
        type: 'video/mp4'
      });
      
      // Create a unique file path for Supabase storage
      const timestamp = Date.now();
      const uuid = crypto.randomUUID();
      const filePath = `${projectId}/${timestamp}-${uuid}.mp4`;

      console.log("Uploading video to storage bucket...");

      // Upload to Supabase storage bucket
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('videos')
        .upload(filePath, videoFile, {
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw storageError;
      }

      console.log("Video uploaded successfully, getting public URL...");

      // Get the public URL from Supabase storage
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Public URL generated:", publicUrl);

      // Save recording metadata with the public URL
      const { data, error } = await supabase
        .from('recordings')
        .insert({
          project_id: projectId,
          name: `Recording ${new Date().toLocaleString()}`,
          video_data: publicUrl
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Recording metadata saved to database:", data);
      setShowProjectDialog(false);
      onOpenChange(false);
      toast.success("Recording saved successfully");
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                  autoPlay
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
          <DialogFooter>
            <Button onClick={handleSaveRecording}>
              <Save className="h-4 w-4 mr-2" />
              Save to Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};