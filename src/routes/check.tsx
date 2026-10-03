import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/site/Layout";
import { UploadDropzone } from "@/components/site/UploadDropzone";
import { Report } from "@/components/site/Report";
import { analyzeResume, type Analysis } from "@/lib/analyzer";
import { parseResumeFile } from "@/lib/parse-resume";
import { takePendingFile } from "@/lib/pending-file";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/check")({
  validateSearch: z.object({ paste: z.coerce.number().optional() }),
  head: () => ({
    meta: [
      { title: "Check Your Resume — Free ATS Score | ATSBoost" },
      { name: "description", content: "Upload a PDF or DOCX resume to get your free ATSBoost compatibility score, top issues and keyword analysis." },
      { property: "og:title", content: "Check Your Resume — Free ATS Score | ATSBoost" },
      { property: "og:description", content: "Free ATS compatibility check for PDF and DOCX resumes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckPage,
});

const STEPS = ["Reading resume", "Detecting sections", "Checking ATS compatibility", "Analyzing keywords", "Preparing your report"];
type State =
  | { s: "idle" }
  | { s: "processing"; step: number }
  | { s: "done"; analysis: Analysis; text: string; fileName: string }
  | { s: "error"; message: string };

function CheckPage() {
  const { paste } = Route.useSearch();
  const [state, setState] = useState<State>({ s: "idle" });
  const [pasteMode, setPasteMode] = useState(!!paste);
  const [pasted, setPasted] = useState("");
  const started = useRef(false);

  const run = async (getText: () => Promise<{ text: string; fileName: string }>) => {
    setState({ s: "processing", step: 0 });
    try {
      const [{ text, fileName }] = await Promise.all([getText(), new Promise((r) => setTimeout(r, 500))]);
      for (let i = 1; i < STEPS.length; i++) {
        setState({ s: "processing", step: i });
        await new Promise((r) => setTimeout(r, 450));
      }
      setState({ s: "done", analysis: analyzeResume(text), text, fileName });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setState({ s: "error", message: e instanceof Error ? e.message : "Something went wrong reading this file." });
    }
  };
  const onFile = (f: File) => run(async () => { const p = await parseResumeFile(f); return { text: p.text, fileName: p.fileName }; });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const f = takePendingFile();
    if (f) onFile(f);
  }, []);

  if (state.s === "done")
    return <PageShell><Report analysis={state.analysis} resumeText={state.text} fileName={state.fileName} onReset={() => setState({ s: "idle" })} /></PageShell>;

  return (
    <PageShell>
      <div className="bg-hero">
        <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
          <h1 className="text-center text-3xl font-bold md:text-4xl">Check your resume</h1>
          <p className="mt-2 text-center text-muted-foreground">Upload your resume → Get your free ATS score.</p>
          <div className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-card md:p-6">
            {state.s === "processing" ? (
              <ol className="space-y-4 px-2 py-6" aria-live="polite">
                {STEPS.map((label, i) => (
                  <li key={label} className={cn("flex items-center gap-3 text-sm font-medium transition-opacity", i > state.step && "opacity-40")}>
                    {i < state.step ? <CheckCircle2 className="size-5 text-success" /> : i === state.step ? <Loader2 className="size-5 animate-spin text-primary" /> : <span className="size-5 rounded-full border-2 border-border" />}
                    Step {i + 1}: {label}
                  </li>
                ))}
              </ol>
            ) : pasteMode ? (
              <div>
                <label htmlFor="paste" className="text-sm font-medium">Paste your resume text</label>
                <Textarea id="paste" rows={12} className="mt-2" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste the full text of your resume…" />
                <Button variant="hero" size="xl" className="mt-3 w-full" disabled={pasted.trim().length < 100}
                  onClick={() => run(async () => ({ text: pasted, fileName: "Pasted resume" }))}>Analyze Resume</Button>
                <button className="mt-3 w-full text-sm font-medium text-primary hover:underline" onClick={() => setPasteMode(false)}>Upload a file instead</button>
              </div>
            ) : (
              <>
                <UploadDropzone onFile={onFile} />
                <button className="mt-3 w-full text-sm font-medium text-primary hover:underline" onClick={() => setPasteMode(true)}>Or paste your resume text</button>
              </>
            )}
            {state.s === "error" && (
              <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-danger-soft p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{state.message} <button className="font-semibold underline" onClick={() => setState({ s: "idle" })}>Try again</button></span>
              </div>
            )}
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            Your resume is analyzed automatically. Please avoid uploading sensitive information that you don't want processed. Max 8 MB, PDF or DOCX. The free check runs in your browser — your file isn't stored.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
