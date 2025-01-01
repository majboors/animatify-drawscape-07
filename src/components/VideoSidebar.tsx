import { useState, useEffect } from "react";
import { Video, Trash2, Play, FolderKanban } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { loadBoardStates } from "@/utils/boardState";
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from "./project/ProjectList";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface VideoSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentRecordingId: string | null;
  setCurrentRecordingId: (id: string | null) => void;
}

export const VideoSidebar = ({
  isOpen,
  onOpenChange,
  currentRecordingId,
  setCurrentRecordingId,
}: VideoSidebarProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Array<{
    id: string;
    name: string;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadRecordings(selectedProject);
    }
  }, [selectedProject]);

  const loadRecordings = async (projectId: string) => {
    try {
      setIsLoading(true);
      console.log("Loading recordings for project:", projectId);
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        console.log("Recordings loaded:", data);
        setRecordings(data);
      } else {
        setRecordings([]);
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error("Failed to load recordings");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);

      if (error) throw error;

      if (selectedProject) {
        await loadRecordings(selectedProject);
      }
      toast.success("Recording deleted");
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error("Failed to delete recording");
    } finally {
      setIsLoading(false);
    }
  };

  const playRecording = async (recordingId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recordings')
        .select('video_data')
        .eq('id', recordingId)
        .single();

      if (error) throw error;

      if (data?.video_data) {
        const blob = new Blob([data.video_data], { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      toast.error("Failed to play recording");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Projects & Recordings
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <ProjectList
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />

          {selectedProject && recordings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Recordings</h3>
              <div className="space-y-1">
                {recordings.map((recording) => (
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
                        onClick={() => playRecording(recording.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRecording(recording.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videoUrl && (
            <div className="mt-4">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                onEnded={() => setVideoUrl(null)}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};