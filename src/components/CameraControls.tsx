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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        console.log('Recording saved:', videoUrl);
        
        if (currentRecordingId) {
          // Save the video data to the recordings table
          const { error: updateError } = await supabase
            .from('recordings')
            .update({ video_data: blob })
            .eq('id', currentRecordingId);

          if (updateError) {
            console.error('Error saving video:', updateError);
            toast.error("Failed to save video recording");
          } else {
            toast.success("Video recording saved successfully");
          }
        }
      };
      
      // Create a new recording entry before starting
      const { data: recordingData, error: recordingError } = await supabase
        .from('recordings')
        .insert([
          { 
            name: `Recording ${new Date().toLocaleString()}`,
            project_id: currentProjectId 
          }
        ])
        .select()
        .single();

      if (recordingError) {
        throw recordingError;
      }

      setCurrentRecordingId(recordingData.id);
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started with audio");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setCurrentProjectId(null);
      setCurrentRecordingId(null);
      toast.success("Recording stopped");
    }
  };

  const handleRecordingClick = async () => {
    if (!isRecording && !currentProjectId) {
      setShowProjectDialog(true);
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
      startRecording();
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
                onClick={() => {
                  setIsPaused(!isPaused);
                  if (mediaRecorder) {
                    if (isPaused) {
                      mediaRecorder.resume();
                    } else {
                      mediaRecorder.pause();
                    }
                  }
                }}
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
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  if (currentRecordingId) {
                    onSaveBoard();
                  } else {
                    toast.error("No active recording to save board state");
                  }
                }}
              >
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