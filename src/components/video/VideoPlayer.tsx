import { useState, useEffect } from "react";
import { Video, Trash2, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  recordingId: string;
  onPlay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const VideoPlayer = ({ recordingId, onPlay, onDelete }: VideoPlayerProps) => {
  const [recording, setRecording] = useState<{
    id: string;
    name: string;
    video_data: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecording();
  }, [recordingId]);

  const fetchRecording = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching recording:", recordingId);
      
      const { data, error } = await supabase
        .from('recordings')
        .select('id, name, video_data')
        .eq('id', recordingId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching recording:", error);
        toast.error("Failed to load recording");
        return;
      }

      if (data) {
        // Store the video_data directly without any transformation
        setRecording(data);
        console.log("Recording loaded:", data);
      }
    } catch (error) {
      console.error("Error in fetchRecording:", error);
      toast.error("Failed to load recording");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (recording?.video_data) {
      navigator.clipboard.writeText(recording.video_data);
      toast.success("URL copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 rounded-lg hover:bg-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!recording) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 rounded-lg hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          {recording.name}
        </span>
        <div className="flex items-center gap-2">
          {onPlay && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPlay(recording.id)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(recording.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {recording.video_data && (
        <>
          <video
            src={recording.video_data}
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