import { useState } from "react";
import { Code } from "lucide-react";
import { Button } from "../ui/button";
import { NewSidebarContent } from "./NewSidebarContent";
import { NewSidebarHeader } from "./NewSidebarHeader";
import { NewSidebarFooter } from "./NewSidebarFooter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const NewSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState("");

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className={`p-0 ${isFullscreen ? 'w-screen h-screen' : 'w-[400px] sm:w-[540px]'}`}
        >
          <NewSidebarHeader 
            onClose={() => setIsOpen(false)} 
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
          <NewSidebarContent 
            onOutputChange={setOutput} 
            isFullscreen={isFullscreen}
          />
          <NewSidebarFooter />
        </SheetContent>
      </Sheet>
    </>
  );
};