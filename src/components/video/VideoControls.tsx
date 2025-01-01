import { Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoControlsProps {
  recordingId: string;
  onPlay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const VideoControls = ({ recordingId, onPlay, onDelete }: VideoControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      {onPlay && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPlay(recordingId)}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(recordingId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};