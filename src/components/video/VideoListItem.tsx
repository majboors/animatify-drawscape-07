import { Video, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const videoUrl = recording.video_data ? getDecodedUrl(recording.video_data) : null;

  return (
    <div className="space-y-2 p-2 rounded-lg hover:bg-gray-100">
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
        <video
          src={videoUrl}
          className="w-full rounded-lg border h-32 object-cover"
          preload="metadata"
        />
      )}
    </div>
  );
};