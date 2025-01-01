import { X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";

interface NewSidebarHeaderProps {
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const NewSidebarHeader = ({ 
  onClose, 
  isFullscreen, 
  onToggleFullscreen 
}: NewSidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-8 w-8"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};