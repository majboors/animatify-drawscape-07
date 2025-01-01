import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VideoUrlDisplayProps {
  url: string;
}

export const VideoUrlDisplay = ({ url }: VideoUrlDisplayProps) => {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="flex gap-2">
      <Input
        value={url}
        readOnly
        className="flex-1 text-sm"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyUrl}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};