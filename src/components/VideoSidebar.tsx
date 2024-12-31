import { useState, useEffect } from "react";
import { Video, X, Trash2, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { loadBoardStates } from "@/utils/boardState";
import { supabase } from "@/integrations/supabase/client";
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
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [boardStates, setBoardStates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      loadRecordings(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error("Failed to load projects");
    }
  };

  const loadRecordings = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error("Failed to load recordings");
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);

      if (error) throw error;
      
      await loadRecordings(selectedProject.id);
      toast.success("Recording deleted");
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error("Failed to delete recording");
    }
  };

  const loadBoardStatesForRecording = async (recordingId: string) => {
    const states = await loadBoardStates(recordingId);
    setBoardStates(states);
    setCurrentRecordingId(recordingId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Projects & Recordings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProject?.id === project.id ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSelectedProject(project)}
              >
                {project.name}
              </Button>
            ))}
          </div>

          {selectedProject && (
            <div className="space-y-2">
              <h3 className="font-semibold">Recordings in {selectedProject.name}</h3>
              <div className="space-y-2">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                  >
                    <span>{recording.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadBoardStatesForRecording(recording.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        View Boards
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
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

          {currentRecordingId && boardStates.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Saved Boards</h3>
              <div className="space-y-2">
                {boardStates.map((state, index) => (
                  <div
                    key={state.id}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                  >
                    <span>Board {index + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('loadBoardState', {
                            detail: state.board_data
                          })
                        );
                      }}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};