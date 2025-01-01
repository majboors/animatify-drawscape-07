import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (error) throw error;

      setCurrentProjectId(data.id);
      // We'll start recording after project creation is confirmed
      try {
        await startRecording();
        setProjectName("");
        toast.success("Project created and recording started");
      } catch (recordingError) {
        console.error('Error starting recording:', recordingError);
        toast.error("Project created but failed to start recording");
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