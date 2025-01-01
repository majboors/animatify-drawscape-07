import { useState, useEffect } from "react";
import { Video, Trash2, Play } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoListProps {
  projectId: string;
}

export const VideoList = ({ projectId }: VideoListProps) => {
  const [videos, setVideos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (projectId) {
      loadVideos();
    }
  }, [projectId]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error("Failed to load videos");
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      
      await loadVideos();
      toast.success("Video deleted");
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-md font-medium mb-2">Videos</h3>
      <div className="space-y-2">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
          >
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {video.name}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info("Video playback not implemented yet")}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteVideo(video.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};