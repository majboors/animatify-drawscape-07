import { Video, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoListItemProps {
  recording: {
    id: string;
    name: string;
    created_at: string;
  };
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem = ({ recording, onPlay, onDelete }: VideoListItemProps) => {
  return (
    <div
      key={recording.id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
    >
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
  );
};