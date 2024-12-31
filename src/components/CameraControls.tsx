import { useState } from "react";
import { Camera, Video, Pause, Play, List, Save } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CameraControlsProps {
  onToggleSidebar: () => void;
  onSaveBoard: () => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export const CameraControls = ({
  onToggleSidebar,
  onSaveBoard,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
}: CameraControlsProps) => {
  const [showControls, setShowControls] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const handleRecordingClick = async () => {
    if (!isRecording && !currentProjectId) {
      setShowProjectDialog(true);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setCurrentProjectId(null);
      toast.success("Recording stopped");
    } else {
      setIsRecording(true);
      toast.success("Recording started");
    }
  };

  const handleCreateProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (error) throw error;

      setCurrentProjectId(data.id);
      setIsRecording(true);
      setShowProjectDialog(false);
      toast.success("Project created and recording started");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        {showControls && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecordingClick}
              className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
            >
              <Video className="h-4 w-4" />
            </Button>
            {isRecording && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onToggleSidebar}>
              <List className="h-4 w-4" />
            </Button>
            {isRecording && (
              <Button variant="outline" size="icon" onClick={onSaveBoard}>
                <Save className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project to start recording.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button onClick={handleCreateProject}>Create & Start Recording</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};