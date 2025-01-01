import { Video, Trash2, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VideoListItemProps {
  recording: {
    id: string;
    name: string;
    created_at: string;
    video_data: string;
  };
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem = ({ recording, onPlay, onDelete }: VideoListItemProps) => {
  const handleCopyUrl = () => {
    if (recording.video_data) {
      const decodedUrl = decodeVideoUrl(recording.video_data);
      navigator.clipboard.writeText(decodedUrl);
      toast.success("URL copied to clipboard");
    }
  };

  const decodeVideoUrl = (encodedUrl: string) => {
    try {
      // Remove any blob: prefix if present
      const cleanUrl = encodedUrl.replace('blob:', '');
      // If the URL is already in a valid format, return it
      if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) {
        return cleanUrl;
      }
      // If it's base64 encoded, decode it
      if (cleanUrl.startsWith('data:video/mp4;base64,')) {
        return cleanUrl;
      }
      // For hex-encoded strings, decode them
      const decoded = decodeURIComponent(cleanUrl);
      return decoded;
    } catch (error) {
      console.error('Error decoding URL:', error);
      return encodedUrl; // Return original URL if decoding fails
    }
  };

  const videoUrl = recording.video_data ? decodeVideoUrl(recording.video_data) : '';

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

      {recording.video_data && (
        <>
          <video
            className="w-full rounded-lg border h-32 object-cover"
            preload="metadata"
            controls
            playsInline
            controlsList="nodownload"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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