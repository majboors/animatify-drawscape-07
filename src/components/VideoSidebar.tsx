import { useState, useEffect } from "react";
import { Video, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { loadBoardStates } from "@/utils/boardState";
import { supabase } from "@/integrations/supabase/client";

export const VideoSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ id: string; name: string }[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [boardStates, setBoardStates] = useState<any[]>([]);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error("Failed to load recordings");
    }
  };

  const startRecording = async () => {
    if (!projectName) {
      toast.error("Please enter a project name first");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recordings')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (error) throw error;
      
      setIsRecording(true);
      setSelectedRecording(data.id);
      await loadRecordings();
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setSelectedRecording(null);
    toast.success("Recording saved");
  };

  const loadBoardStatesForRecording = async (recordingId: string) => {
    const states = await loadBoardStates(recordingId);
    setBoardStates(states);
    setSelectedRecording(recordingId);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Video className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-1/3 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Video Recording</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>

              {recordings.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Recordings</h3>
                  <div className="space-y-2">
                    {recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="p-2 bg-gray-100 rounded-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span>{recording.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadBoardStatesForRecording(recording.id)}
                          >
                            View Boards
                          </Button>
                        </div>
                        {selectedRecording === recording.id && boardStates.length > 0 && (
                          <div className="mt-2 pl-4 space-y-2">
                            {boardStates.map((state, index) => (
                              <div
                                key={state.id}
                                className="flex items-center justify-between"
                              >
                                <span>Board {index + 1}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // We'll implement this in the Canvas component
                                    window.dispatchEvent(new CustomEvent('loadBoardState', {
                                      detail: state.board_data
                                    }));
                                  }}
                                >
                                  Load
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};