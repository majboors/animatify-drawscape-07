import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface NewSidebarContentProps {
  onOutputChange: (output: string) => void;
}

export const NewSidebarContent = ({ onOutputChange }: NewSidebarContentProps) => {
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("test.py");
  const [code, setCode] = useState("");

  const handleRun = async () => {
    try {
      toast.info("This is a demo. In production, this would execute the code.");
      onOutputChange(`Demo output for: ${filename}`);
    } catch (error) {
      toast.error("Failed to execute code");
    }
  };

  return (
    <ScrollArea className="flex-1 p-4">
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