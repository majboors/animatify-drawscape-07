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
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (error) throw error;

      setCurrentProjectId(data.id);
      startRecording();
      setShowProjectDialog(false);
      toast.success("Project created and recording started");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    }
  };

  return {
    projectName,
    showProjectDialog,
    setShowProjectDialog,
    setProjectName,
    handleCreateProject,
  };
};