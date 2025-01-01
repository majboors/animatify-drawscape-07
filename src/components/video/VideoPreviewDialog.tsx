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
  const getDecodedUrl = (url: string) => {
    try {
      // Handle hex-encoded URLs
      if (url.startsWith('\\x')) {
        const hexString = url.slice(2); // Remove \x prefix
        const decoded = Buffer.from(hexString, 'hex').toString();
        return decoded;
      }
      return url;
    } catch (error) {
      console.error('Error decoding URL:', error);
      return url;
    }
  };

  const decodedUrl = videoUrl ? getDecodedUrl(videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Recording Preview</DialogTitle>
        </DialogHeader>
        {decodedUrl && (
          <div className="mt-4">
            <video
              src={decodedUrl}
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