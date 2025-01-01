import { useState, useEffect } from "react";
import { Folder, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectListProps {
  selectedProject: string | null;
  onSelectProject: (projectId: string | null) => void;
}

export const ProjectList = ({ selectedProject, onSelectProject }: ProjectListProps) => {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadProjects();
  }, []);

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

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      if (selectedProject === projectId) {
        onSelectProject(null);
      }
      
      await loadProjects();
      toast.success("Project deleted");
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 ${
            selectedProject === project.id ? "bg-gray-100" : ""
          }`}
        >
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start"
            onClick={() => onSelectProject(project.id)}
          >
            <Folder className="h-4 w-4" />
            {project.name}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteProject(project.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};