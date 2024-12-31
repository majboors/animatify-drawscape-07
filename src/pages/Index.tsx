import { useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");

  return (
    <div className="h-screen flex flex-col">
      <Canvas
        activeTool={activeTool}
        activeColor={activeColor}
        ref={(canvasRef) => {
          // This ref will be used by the Canvas component
          window.canvasRef = canvasRef;
        }}
      />
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onCopy={() => window.canvasRef?.copy()}
        onPaste={() => window.canvasRef?.paste()}
      />
    </div>
  );
};

export default Index;