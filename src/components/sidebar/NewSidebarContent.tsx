import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Editor from "@monaco-editor/react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface NewSidebarContentProps {
  onOutputChange: (output: string) => void;
}

export const NewSidebarContent = ({ onOutputChange }: NewSidebarContentProps) => {
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("test.py");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);

  const handleRun = async () => {
    try {
      toast.info("This is a demo. In production, this would execute the code.");
      const demoOutput = `Demo output for: ${filename}`;
      setOutput(demoOutput);
      onOutputChange(demoOutput);
    } catch (error) {
      toast.error("Failed to execute code");
    }
  };

  const languageExtensions: { [key: string]: string } = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    cpp: "cpp",
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const ext = languageExtensions[value];
    setFilename(`test.${ext}`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEditorDidMount = () => {
    setEditorMounted(true);
  };

  return (
    <ScrollArea className={`flex-1 p-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="ml-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className={`relative ${isFullscreen ? 'h-[80vh]' : 'h-[400px]'}`}>
          {editorMounted ? (
            <Editor
              height="100%"
              defaultLanguage="python"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                folding: true,
                tabSize: 2,
              }}
              onMount={handleEditorDidMount}
              className="rounded-md overflow-hidden border border-input"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              Loading editor...
            </div>
          )}
        </div>

        <Button onClick={handleRun} className="w-full">
          Run Code
        </Button>

        {output && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <h3 className="font-semibold mb-2">Output:</h3>
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};