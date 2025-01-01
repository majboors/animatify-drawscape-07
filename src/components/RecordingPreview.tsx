import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface RecordingPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
}

export const RecordingPreview = ({
  open,
  onOpenChange,
  videoUrl
}: RecordingPreviewProps) => {
  const handleCopyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
};