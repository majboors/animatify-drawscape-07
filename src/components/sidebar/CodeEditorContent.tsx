import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

interface CodeEditorContentProps {
  onOutputChange: (output: string) => void;
}

export const CodeEditorContent = ({ onOutputChange }: CodeEditorContentProps) => {
  const [language, setLanguage] = useState("python");
  const [filename, setFilename] = useState("test.py");
  const [code, setCode] = useState("");

  const handleRun = async () => {
    try {
      toast.info("This is a demo. In production, this would execute the code using the specified command.");
      onOutputChange("Demo output for: " + filename);
    } catch (error) {
      toast.error("Failed to execute code");
    }
  };

  return (
    <div className="space-y-4 p-4">
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
    </div>
  );
};