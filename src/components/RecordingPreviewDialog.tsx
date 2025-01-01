import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface RecordingPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
}

export const RecordingPreviewDialog = ({
  isOpen,
  onOpenChange,
  videoUrl,
}: RecordingPreviewDialogProps) => {
  const handleCopyUrl = () => {
    if (videoUrl) {
      // Ensure URL is decoded before copying
      const decodedUrl = decodeURIComponent(videoUrl);
      navigator.clipboard.writeText(decodedUrl);
      toast.success("URL copied to clipboard");
    }
  };

  const getDecodedUrl = () => {
    if (!videoUrl) return null;
    try {
      return decodeURIComponent(videoUrl);
    } catch (error) {
      console.error("Error decoding URL:", error);
      return videoUrl;
    }
  };

  const decodedUrl = getDecodedUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {decodedUrl && (
            <>
              <video
                src={decodedUrl}
                controls
                className="w-full rounded-lg border"
              />
              <div className="flex gap-2">
                <Input
                  value={decodedUrl}
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
  );
};