import { X } from "lucide-react";
import { Button } from "../ui/button";

interface NewSidebarHeaderProps {
  onClose: () => void;
}

export const NewSidebarHeader = ({ onClose }: NewSidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <h2 className="text-lg font-semibold">Code Editor</h2>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};