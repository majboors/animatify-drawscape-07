import { useState, useEffect } from "react";
import { FolderKanban, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from "./project/ProjectList";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "./ui/sheet";
import { VideoPreviewDialog } from "./video/VideoPreviewDialog";
import { VideoListItem } from "./video/VideoListItem";

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
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  useEffect(() => {
    if (selectedProject && isOpen) {
      loadRecordings(selectedProject);
    }
  }, [selectedProject, isOpen]);

  const loadRecordings = async (projectId: string) => {
    try {
      setIsLoading(true);
      console.log("Loading recordings for project:", projectId);
      
      const { data: recordingsData, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Recordings loaded:", recordingsData);
      setRecordings(recordingsData || []);
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
        setVideoUrl(data.video_data);
        setShowPreviewDialog(true);
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      toast.error("Failed to play recording");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px]">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projects & Recordings
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
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
                    <VideoListItem
                      key={recording.id}
                      recording={recording}
                      onPlay={playRecording}
                      onDelete={deleteRecording}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <VideoPreviewDialog
        isOpen={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        videoUrl={videoUrl}
      />
    </>
  );
};