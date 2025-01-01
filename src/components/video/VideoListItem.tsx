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
      navigator.clipboard.writeText(recording.video_data);
      toast.success("URL copied to clipboard");
    }
  };

  const decodeVideoUrl = (url: string) => {
    try {
      // If it's a valid URL, return as is
      if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
      }
      
      // Remove any blob: prefix
      url = url.replace('blob:', '');
      
      // Remove any \x prefix from hex values
      url = url.replace(/\\x/g, '%');
      
      // Decode the URL
      return decodeURIComponent(url);
    } catch (error) {
      console.error('Error decoding URL:', error);
      return url;
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

      {recording.video_data && (
        <>
          <video
            src={decodeVideoUrl(recording.video_data)}
            className="w-full rounded-lg border h-32 object-cover"
            preload="metadata"
            controls
          />
          <div className="flex gap-2">
            <Input
              value={recording.video_data}
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