import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseProjectDialogProps {
  setCurrentProjectId: (id: string | null) => void;
  setShowProjectDialog: (show: boolean) => void;
  onProjectCreated: () => void;
}

export const useProjectDialog = ({
  setCurrentProjectId,
  setShowProjectDialog,
  onProjectCreated,
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

      if (data) {
        setCurrentProjectId(data.id);
        setShowProjectDialog(false);
        setProjectName("");
        onProjectCreated();
        toast.success("Project created successfully");
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