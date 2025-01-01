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
    if (!videoUrl) {
      toast.error("No recording URL available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recordings')
        .insert({
          project_id: projectId,
          name: `Recording ${new Date().toLocaleString()}`,
          video_data: videoUrl
        })
        .select()
        .single();

      if (error) throw error;

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