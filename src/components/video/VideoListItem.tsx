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
  // Convert hex URL to regular URL if needed
  const videoUrl = recording.video_data?.startsWith('\\x') 
    ? decodeHexString(recording.video_data.slice(2))
    : recording.video_data;

  // Function to decode hex string using browser-native methods
  const decodeHexString = (hexString: string) => {
    try {
      const bytes = new Uint8Array(
        hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      return new TextDecoder().decode(bytes);
    } catch (error) {
      console.error('Error decoding hex string:', error);
      return recording.video_data; // Return original string if decoding fails
    }
  };

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