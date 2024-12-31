import { useState, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, CanvasRef } from "@/components/Canvas";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");
  const canvasRef = useRef<CanvasRef>(null);

  return (
    <div className="h-screen flex flex-col">
      <Canvas
        ref={canvasRef}
        activeTool={activeTool}
        activeColor={activeColor}
      />
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onCopy={() => canvasRef.current?.copy()}
        onPaste={() => canvasRef.current?.paste()}
      />
    </div>
  );
};

export default Index;