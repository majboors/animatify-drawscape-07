import { useState } from "react";
import { Code } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { CodeEditorContent } from "./CodeEditorContent";
import { Button } from "../ui/button";

export const AppSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [output, setOutput] = useState("");

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

      <SidebarProvider defaultOpen={isOpen}>
        <Sidebar side="right" className="w-1/3">
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Code Editor</h2>
          </SidebarHeader>
          
          <SidebarContent>
            <CodeEditorContent onOutputChange={setOutput} />
            
            {output && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold mb-2">Output:</h3>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="text-sm text-gray-500">
              Press Ctrl + B to toggle sidebar
            </div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </>
  );
};