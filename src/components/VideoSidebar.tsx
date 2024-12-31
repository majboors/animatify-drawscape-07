import { useState } from "react";
import { Video, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

export const VideoSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ name: string; url: string }[]>([]);

  const startRecording = async () => {
    if (!projectName) {
      toast.error("Please enter a project name first");
      return;
    }

    try {
      // In a real implementation, this would use the MediaRecorder API
      // For now, we'll just simulate recording
      setIsRecording(true);
      toast.info("Recording started (demo)");
    } catch (error) {
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate saving a recording
    setRecordings([
      ...recordings,
      {
        name: projectName,
        url: "#demo-recording",
      },
    ]);
    toast.success("Recording saved (demo)");
  };

  const openBoard = (recordingName: string) => {
    // In a real implementation, this would load the board state
    toast.info(`Opening board for ${recordingName} (demo)`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-16 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Video className="h-4 w-4" />
      </Button>

      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 transition-all duration-300 ${
          isOpen ? "w-1/3" : "w-0"
        }`}
      >
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
                  {recordings.map((recording, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                    >
                      <span>{recording.name}</span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(recording.url)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBoard(recording.name)}
                        >
                          Open Board
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};