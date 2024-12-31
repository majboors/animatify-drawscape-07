import { Square, Circle, Pencil, MousePointer, Triangle as TriangleIcon, Star, Minus, Copy, Clipboard, PaintBucket, Type, Group as GroupIcon, Ungroup, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontFamilies } from "@/utils/textUtils";

interface ToolbarProps {
  activeTool: string;
  activeColor: string;
  activeFont?: string;
  isRecording?: boolean;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onFontChange?: (font: string) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onSaveBoard?: () => void;
}

export const Toolbar = ({ 
  activeTool, 
  activeColor, 
  activeFont,
  isRecording = false,
  onToolChange, 
  onColorChange,
  onFontChange,
  onCopy,
  onPaste,
  onGroup,
  onUngroup,
  onSaveBoard
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
      }
    },
    { 
      id: "paste", 
      icon: Clipboard, 
      label: "Paste", 
      onClick: () => {
        onPaste?.();
      }
    },
    { 
      id: "group", 
      icon: GroupIcon, 
      label: "Group (Ctrl+G)", 
      onClick: () => {
        onGroup?.();
      }
    },
    { 
      id: "ungroup", 
      icon: Ungroup, 
      label: "Ungroup (Ctrl+Shift+G)", 
      onClick: () => {
        onUngroup?.();
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
      {isRecording && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onSaveBoard}
          className="mr-2"
        >
          <Save className="h-4 w-4 mr-1" />
          Save Board
        </Button>
      )}
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
      {activeTool === "text" && (
        <>
          <div className="w-px h-8 bg-gray-200 mx-2" />
          <Select
            value={activeFont}
            onValueChange={onFontChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};