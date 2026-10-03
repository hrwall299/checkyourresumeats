import { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadDropzone({ onFile, compact }: { onFile: (f: File) => void; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft/50 text-center transition-colors",
        compact ? "px-5 py-8" : "px-6 py-12",
        drag && "border-primary bg-primary-soft",
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-card">
        <UploadCloud className="size-7" />
      </span>
      <p className="mt-4 font-display text-lg font-semibold">Drop your resume here</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><FileText className="size-3.5" /> PDF or DOCX • Free analysis</p>
      <Button variant="hero" size="xl" className="mt-5 w-full max-w-xs" onClick={() => input.current?.click()}>
        Upload Resume
      </Button>
      <input
        ref={input}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        aria-label="Upload resume file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
