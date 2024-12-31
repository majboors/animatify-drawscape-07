import { useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";

const Index = () => {
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#0078D4");

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={setActiveTool}
        onColorChange={setActiveColor}
      />
      <Canvas activeTool={activeTool} activeColor={activeColor} />
    </div>
  );
};

export default Index;