import { useState, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, CanvasRef } from "@/components/Canvas";
import { CodeSidebar } from "@/components/CodeSidebar";
import { VideoSidebar } from "@/components/VideoSidebar";
import { UserCamera } from "@/components/UserCamera";
import { saveBoardState } from "@/utils/boardState";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");
  const [activeFont, setActiveFont] = useState("Arial");
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  const handleSaveBoard = async () => {
    if (!canvasRef.current || !currentRecordingId) return;
    await saveBoardState(canvasRef.current, currentRecordingId);
  };

  return (
    <div className="h-screen flex flex-col">
      <Canvas
        ref={canvasRef}
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
      />
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        activeFont={activeFont}
        isRecording={isRecording}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onFontChange={setActiveFont}
        onCopy={() => canvasRef.current?.copy()}
        onPaste={() => canvasRef.current?.paste()}
        onGroup={() => canvasRef.current?.group()}
        onUngroup={() => canvasRef.current?.ungroup()}
        onSaveBoard={handleSaveBoard}
      />
      <CodeSidebar />
      <VideoSidebar />
      <UserCamera />
    </div>
  );
};

export default Index;