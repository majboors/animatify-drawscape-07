import { Button } from "../ui/button";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export const SidebarHeader = ({ title, onClose }: SidebarHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};