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
  const [showProjectSelect, setShowProjectSelect] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSelectedProject(data.id);
        await loadProjects();
        setShowProjectSelect(true);
        toast.success("Project created successfully");
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
    setShowProjectSelect(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {!showProjectSelect ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter a name for your new project. This will help organize your recordings.
              </DialogDescription>
            </DialogHeader>
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
            <DialogFooter>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle>Select Project</DialogTitle>
              <DialogDescription>
                Choose a project for your recording or create a new one.
              </DialogDescription>
            </DialogHeader>
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
                onClick={() => setShowProjectSelect(false)}
              >
                Create New Project
              </Button>
              <Button onClick={handleStartRecording}>
                Start Recording
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};