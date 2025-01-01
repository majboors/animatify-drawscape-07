import { Video, Trash2, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VideoListItemProps {
  recording: {
    id: string;
    name: string;
    created_at: string;
    video_data?: string;
  };
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem = ({ recording, onPlay, onDelete }: VideoListItemProps) => {
  const getDecodedUrl = (url: string) => {
    try {
      // Handle hex-encoded URLs
      if (url.startsWith('\\x')) {
        // Remove \x prefix and decode hex
        const hexString = url.slice(2);
        const decoded = Buffer.from(hexString, 'hex').toString();
        
        // If it starts with 'blob:', return the URL part after it
        if (decoded.startsWith('blob:')) {
          return decoded.substring(5);
        }
        return decoded;
      }
      return url;
    } catch (error) {
      console.error('Error decoding URL:', error);
      return url;
    }
  };

  const videoUrl = recording.video_data ? getDecodedUrl(recording.video_data) : null;

  const handleCopyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          {recording.name}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlay(recording.id)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(recording.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {videoUrl && (
        <>
          <video
            src={videoUrl}
            className="w-full rounded-lg border h-32 object-cover"
            preload="metadata"
            controls
          />
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              readOnly
              className="flex-1 text-sm"
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
  );
};