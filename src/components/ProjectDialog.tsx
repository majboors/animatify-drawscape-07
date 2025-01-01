import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (projectId: string) => void;
}

export const ProjectDialog = ({
  isOpen,
  onOpenChange,
  onProjectCreated,
}: ProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "create">("select");

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        setProjectName("");
        onProjectCreated(data.id);
        toast.success("Project created successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    }
  };

  const handleStartRecording = () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    onProjectCreated(selectedProject);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Selection</DialogTitle>
          <DialogDescription>
            Choose an existing project or create a new one for your recording.
          </DialogDescription>
        </DialogHeader>

        {mode === "select" ? (
          <div className="space-y-4">
            <div className="py-4">
              <RadioGroup
                value={selectedProject || ""}
                onValueChange={setSelectedProject}
                className="space-y-2"
              >
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={project.id} id={project.id} />
                    <Label htmlFor={project.id}>{project.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setMode("create")}
              >
                Create New Project
              </Button>
              <Button onClick={handleStartRecording}>
                Start Recording
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleCreateProject}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="projectName"
                  placeholder="Project name"
                  className="col-span-4"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("select")}
              >
                Back to Projects
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};