import { useState, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, CanvasRef } from "@/components/Canvas";
import { VideoSidebar } from "@/components/VideoSidebar";
import { CameraControls } from "@/components/CameraControls";
import { UserCamera } from "@/components/UserCamera";
import { ProjectDialog } from "@/components/ProjectDialog";
import { saveBoardState } from "@/utils/boardState";
import { NewSidebar } from "@/components/sidebar/NewSidebar";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");
  const [activeFont, setActiveFont] = useState("Arial");
  const [isVideoSidebarOpen, setIsVideoSidebarOpen] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const canvasRef = useRef<CanvasRef>(null);

  const handleImageUpload = (url: string) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getFabricCanvas();
      if (canvas) {
        // @ts-ignore - handleImageUpload exists but TypeScript doesn't know about it
        canvas.handleImageUpload(url);
      }
    }
  };

  const handleProjectCreated = (projectId: string) => {
    setShowProjectDialog(false);
    setIsVideoSidebarOpen(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
        isRecording={false}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onFontChange={setActiveFont}
        onImageUpload={handleImageUpload}
      />
      <Canvas
        ref={canvasRef}
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
      />
      <NewSidebar />
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
      />
      <UserCamera />
      <ProjectDialog
        isOpen={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Index;