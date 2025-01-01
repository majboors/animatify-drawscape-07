import { useState } from "react";
import { Code } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";
import { SidebarFooter } from "./SidebarFooter";
import { CodeEditor } from "./CodeEditor";

interface NewSidebarProps {
  side?: "left" | "right";
}

export const NewSidebar = ({ side = "right" }: NewSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [output, setOutput] = useState("");

  const handleRun = async (code: string, language: string, filename: string) => {
    try {
      toast.info("This is a demo. In production, this would execute the code using the specified command.");
      setOutput("Demo output for: " + filename);
    } catch (error) {
      toast.error("Failed to execute code");
    }
  };

  const sidebarClasses = `fixed top-0 ${
    side === "right" ? "right-0" : "left-0"
  } h-full bg-white border-${side === "right" ? "l" : "r"} border-gray-200 transition-all duration-300 ${
    isOpen ? "w-1/3" : "w-0"
  }`;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={`fixed ${side === "right" ? "right-4" : "left-4"} top-4 z-50`}
        onClick={() => setIsOpen(true)}
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <SidebarHeader 
            title="Code Editor" 
            onClose={() => setIsOpen(false)} 
          />
          
          <SidebarContent>
            <CodeEditor onRun={handleRun} />
            
            {output && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold mb-2">Output:</h3>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter>
            <div className="text-sm text-gray-500">
              Press Ctrl + B to toggle sidebar
            </div>
          </SidebarFooter>
        </div>
      </div>
    </>
  );
};