import { useState } from "react";
import { FolderKanban, Maximize, Minimize, X } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

export const ProjectSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("test.py");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const handleRun = async () => {
    try {
      // In a real implementation, this would interact with the system
      // For now, we'll just show a toast
      toast.info("This is a demo. In production, this would execute the code using the specified command.");
      setOutput("Demo output for: " + filename);
    } catch (error) {
      toast.error("Failed to execute code");
    }
  };

  const sidebarClasses = `fixed top-0 right-0 h-full bg-white border-l border-gray-200 transition-all duration-300 ${
    isOpen ? (isFullscreen ? "w-full" : "w-1/3") : "w-0"
  }`;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FolderKanban className="h-4 w-4" />
      </Button>

      <div className={sidebarClasses}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Project Manager</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  setFilename(`test.${value === "python" ? "py" : value}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="ruby">Ruby</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>

              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Filename"
              />
            </div>

            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="min-h-[200px] font-mono"
            />

            <Button onClick={handleRun}>Run Code</Button>

            {output && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold mb-2">Output:</h3>
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};