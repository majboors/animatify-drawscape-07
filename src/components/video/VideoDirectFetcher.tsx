import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VideoControls } from "./VideoControls";
import { VideoPlayer } from "./VideoPlayer";
import { VideoUrlDisplay } from "./VideoUrlDisplay";
import { VideoHeader } from "./VideoHeader";
import { LoadingState } from "./LoadingState";

interface VideoDirectFetcherProps {
  recordingId: string;
  onPlay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const VideoDirectFetcher = ({ recordingId, onPlay, onDelete }: VideoDirectFetcherProps) => {
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
        console.log("Raw recording data:", data);
        setRecording(data);
      }
    } catch (error) {
      console.error("Error in fetchRecording:", error);
      toast.error("Failed to load recording");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!recording) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 rounded-lg hover:bg-gray-100">
      <VideoHeader name={recording.name}>
        <VideoControls
          recordingId={recording.id}
          onPlay={onPlay}
          onDelete={onDelete}
        />
      </VideoHeader>

      {recording.video_data && (
        <>
          <VideoPlayer url={recording.video_data} />
          <VideoUrlDisplay url={recording.video_data} />
        </>
      )}
    </div>
  );
};