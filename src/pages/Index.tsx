import { useState, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas, CanvasRef } from "@/components/Canvas";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");
  const [activeFont, setActiveFont] = useState("Arial");
  const canvasRef = useRef<CanvasRef>(null);

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
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
        onFontChange={setActiveFont}
        onCopy={() => canvasRef.current?.copy()}
        onPaste={() => canvasRef.current?.paste()}
        onGroup={() => canvasRef.current?.group()}
        onUngroup={() => canvasRef.current?.ungroup()}
      />
    </div>
  );
};

export default Index;