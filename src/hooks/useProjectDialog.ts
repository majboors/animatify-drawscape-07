import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestScreenShare } from "@/utils/recordingUtils";

interface UseProjectDialogProps {
  setIsRecording: (isRecording: boolean) => void;
  setCurrentProjectId: (id: string | null) => void;
  startRecording: () => Promise<void>;
}

export const useProjectDialog = ({
  setIsRecording,
  setCurrentProjectId,
  startRecording,
}: UseProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      // First request screen sharing permission
      try {
        await requestScreenShare();
      } catch (permissionError: any) {
        toast.error(permissionError.message);
        return;
      }

      // If screen sharing is allowed, create the project
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (error) throw error;

      setCurrentProjectId(data.id);
      
      // Start recording after permissions and project creation
      try {
        await startRecording();
        setProjectName("");
        toast.success("Project created and recording started");
      } catch (recordingError: any) {
        console.error('Error starting recording:', recordingError);
        toast.error(recordingError.message || "Failed to start recording");
        return;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    }
  };

  return {
    projectName,
    setProjectName,
    handleCreateProject,
  };
};