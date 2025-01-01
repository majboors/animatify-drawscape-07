import { Video } from "lucide-react";

interface VideoHeaderProps {
  name: string;
  children?: React.ReactNode;
}

export const VideoHeader = ({ name, children }: VideoHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <Video className="h-4 w-4" />
        {name}
      </span>
      {children}
    </div>
  );
};