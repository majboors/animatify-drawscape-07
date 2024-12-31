import { Square, Circle, Pencil, MousePointer, Triangle as TriangleIcon, Star, Minus, Copy, Clipboard, PaintBucket, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ToolbarProps {
  activeTool: string;
  activeColor: string;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

export const Toolbar = ({ 
  activeTool, 
  activeColor, 
  onToolChange, 
  onColorChange,
  onCopy,
  onPaste 
}: ToolbarProps) => {
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "draw", icon: Pencil, label: "Draw" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: TriangleIcon, label: "Triangle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "star", icon: Star, label: "Star" },
    { id: "text", icon: Type, label: "Text" },
  ];

  const actions = [
    { 
      id: "copy", 
      icon: Copy, 
      label: "Copy", 
      onClick: () => {
        onCopy?.();
        toast("Object copied!");
      }
    },
    { 
      id: "paste", 
      icon: Clipboard, 
      label: "Paste", 
      onClick: () => {
        onPaste?.();
        toast("Object pasted!");
      }
    },
    { 
      id: "fill", 
      icon: PaintBucket, 
      label: "Fill", 
      onClick: () => {
        toast("Double-click an object to toggle fill!");
      }
    },
  ];

  const colors = ["#0078D4", "#2B579A", "#666666", "#E74C3C", "#2ECC71", "#F1C40F"];

  return (
    <div className="bg-white border-b border-gray-200 p-2 flex items-center space-x-2">
      <div className="flex space-x-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "outline"}
            size="icon"
            onClick={() => onToolChange(tool.id)}
            className="w-10 h-10"
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
      <div className="w-px h-8 bg-gray-200 mx-2" />
      <div className="flex space-x-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="icon"
            onClick={action.onClick}
            className="w-10 h-10"
          >
            <action.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
      <div className="w-px h-8 bg-gray-200 mx-2" />
      <div className="flex space-x-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 ${
              activeColor === color ? "border-gray-900" : "border-gray-200"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};
