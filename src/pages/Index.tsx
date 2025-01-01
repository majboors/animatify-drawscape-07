import { useState, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, CanvasRef } from "@/components/Canvas";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { VideoSidebar } from "@/components/VideoSidebar";
import { CameraControls } from "@/components/CameraControls";
import { UserCamera } from "@/components/UserCamera";
import { saveBoardState } from "@/utils/boardState";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");
  const [activeFont, setActiveFont] = useState("Arial");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoSidebarOpen, setIsVideoSidebarOpen] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
        isRecording={isRecording}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onFontChange={setActiveFont}
      />
      <Canvas
        ref={canvasRef}
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
      />
      <ProjectSidebar />
      <VideoSidebar
        isOpen={isVideoSidebarOpen}
        onOpenChange={setIsVideoSidebarOpen}
        currentRecordingId={currentRecordingId}
        setCurrentRecordingId={setCurrentRecordingId}
      />
      <CameraControls
        onToggleSidebar={() => setIsVideoSidebarOpen(!isVideoSidebarOpen)}
        onSaveBoard={async () => {
          if (canvasRef.current && currentRecordingId) {
            await saveBoardState(canvasRef.current, currentRecordingId);
          }
        }}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
      />
      <UserCamera />
    </div>
  );
};

export default Index;