import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
}

export const VideoPreviewDialog = ({
  isOpen,
  onOpenChange,
  videoUrl,
}: VideoPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
        </DialogHeader>
        {videoUrl && (
          <div className="mt-4">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
              onEnded={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};