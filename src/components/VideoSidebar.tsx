import { useState, useEffect } from "react";
import { Video, Trash2, Play } from "lucide-react";
import { Button } from "./ui/button";
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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0]); // Auto-select first project
      } else {
        toast.info("No projects found. Create a new project to start recording.");
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecordings = async (projectId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRecordings(data);
        // Load board states for the first recording
        await loadBoardStatesForRecording(data[0].id);
      } else {
        setRecordings([]);
        setBoardStates([]);
        toast.info("No recordings found for this project. Start recording to create one.");
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
        await loadRecordings(selectedProject.id);
      }
      toast.success("Recording deleted");
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error("Failed to delete recording");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBoardStatesForRecording = async (recordingId: string) => {
    try {
      setIsLoading(true);
      const states = await loadBoardStates(recordingId);
      setBoardStates(states);
      setCurrentRecordingId(recordingId);
    } catch (error) {
      console.error('Error loading board states:', error);
      toast.error("Failed to load board states");
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
        // Convert base64 to blob
        const binaryString = atob(data.video_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        const video = document.createElement('video');
        video.src = videoUrl;
        video.controls = true;
        video.style.width = '100%';
        video.style.maxWidth = '400px';
        
        const dialog = document.createElement('dialog');
        dialog.style.padding = '20px';
        dialog.appendChild(video);
        document.body.appendChild(dialog);
        dialog.showModal();
        
        dialog.addEventListener('close', () => {
          URL.revokeObjectURL(videoUrl);
          dialog.remove();
        });
      } else {
        toast.error("No video data found for this recording");
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
          <SheetTitle>Projects & Recordings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
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
                    {recordings.length > 0 ? (
                      recordings.map((recording) => (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                        >
                          <span>{recording.name || `Recording ${recording.id.slice(0, 8)}`}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playRecording(recording.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Play Video
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadBoardStatesForRecording(recording.id)}
                            >
                              <Video className="h-4 w-4 mr-1" />
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
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No recordings found for this project. Start recording to create one.
                      </div>
                    )}
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};