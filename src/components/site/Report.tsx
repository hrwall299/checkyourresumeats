import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Info, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Analysis, type JobMatch, matchJob, scoreLabel } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

const toneText = { success: "text-success", warning: "text-warning", danger: "text-destructive" };
const toneBar = { success: "bg-success", warning: "bg-warning", danger: "bg-destructive" };
const toneFor = (s: number) => scoreLabel(s).tone;

export function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const r = 70, c = 2 * Math.PI * r;
  const tone = toneFor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <circle cx="80" cy="80" r={r} strokeWidth="12" className="fill-none stroke-muted" />
        <circle cx="80" cy="80" r={r} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
          className={cn("fill-none transition-[stroke-dashoffset] duration-1000", tone === "success" ? "stroke-success" : tone === "warning" ? "stroke-warning" : "stroke-destructive")} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><span className="font-display text-5xl font-extrabold">{score}</span><span className="text-muted-foreground"> / 100</span></div>
      </div>
    </div>
  );
}

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 md:p-6", className)}>
      {title && <h2 className="mb-4 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "ok" | "miss" | "rel" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">None found.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k) => (
        <span key={k} className={cn("rounded-full px-3 py-1 text-sm font-medium capitalize",
          tone === "ok" && "bg-success-soft text-success", tone === "miss" && "bg-danger-soft text-destructive", tone === "rel" && "bg-warning-soft text-warning")}>{k}</span>
      ))}
    </div>
  );
}

export function Report({ analysis, resumeText, fileName, onReset }: { analysis: Analysis; resumeText: string; fileName: string; onReset: () => void }) {
  const [jd, setJd] = useState("");
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [paywall, setPaywall] = useState(false);
  const label = scoreLabel(analysis.overall);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="truncate text-sm text-muted-foreground">Report for <span className="font-medium text-foreground">{fileName}</span></p>
        <Button variant="outline" size="sm" onClick={onReset}>Check another resume</Button>
      </div>

      <Card className="shadow-card">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <ScoreRing score={analysis.overall} />
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-primary">ATSBoost Compatibility Score</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Your ATS Compatibility Score</h1>
            <p className={cn("mt-2 text-lg font-semibold", toneText[label.tone])}>{label.text}</p>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />
              ATSBoost estimated compatibility (80+ strong, 60–79 needs work). Not a universal ATS standard or any vendor's exact algorithm.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {analysis.categories.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between text-sm"><span className="font-medium">{c.label}</span><span className="font-semibold">{c.score}%</span></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", toneBar[toneFor(c.score)])} style={{ width: `${c.score}%` }} /></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Top Issues Found">
          {analysis.issues.length === 0 ? <p className="text-sm text-muted-foreground">No major issues detected.</p> : (
            <ul className="space-y-3">
              {analysis.issues.slice(0, 6).map((i) => (
                <li key={i.title} className="flex gap-2.5">
                  {i.severity === "error" ? <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}
                  <div><p className="text-sm font-semibold">{i.title}</p><p className="text-xs text-muted-foreground">{i.why}</p></div>
                </li>
              ))}
            </ul>
          )}
          {analysis.issues.length > 6 && <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" />{analysis.issues.length - 6} more issues in the ATS Boost report</p>}
        </Card>
        <Card title="What You're Doing Well">
          {analysis.strengths.length === 0 ? <p className="text-sm text-muted-foreground">Fix the issues on the left to build strengths here.</p> : (
            <ul className="space-y-3">{analysis.strengths.map((s) => <li key={s} className="flex gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{s}</li>)}</ul>
          )}
        </Card>
      </div>

      <Card title="Keyword Analysis">
        <p className="mb-2 text-sm font-semibold">Detected keywords</p>
        <Chips items={analysis.detectedKeywords} tone="ok" />
        <p className="mb-2 mt-5 text-sm font-semibold">Commonly paired keywords you don't list</p>
        <Chips items={analysis.suggestedKeywords} tone="miss" />
        <p className="mt-4 text-xs text-muted-foreground">Keyword analysis is based on your resume content. Add a job description for a more targeted match. Only add skills you genuinely have.</p>
      </Card>

      <Card title="Basic Recommendations">
        <ul className="space-y-2">{analysis.recommendations.map((r) => <li key={r} className="flex gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{r}</li>)}</ul>
      </Card>

      <Card title="Want a more targeted analysis?">
        <label htmlFor="jd" className="text-sm font-medium">Paste the Job Description</label>
        <Textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} rows={6} className="mt-2" placeholder="Paste the full job description from LinkedIn, Naukri, Indeed or a career page…" />
        <Button variant="hero" size="xl" className="mt-3 w-full sm:w-auto" disabled={jd.trim().length < 80} onClick={() => setMatch(matchJob(resumeText, jd))}>
          Analyze Resume Against Job
        </Button>
        {jd.trim().length > 0 && jd.trim().length < 80 && <p className="mt-2 text-xs text-muted-foreground">Paste a bit more of the job description for a meaningful match.</p>}
        {match && (
          <div className="mt-6 space-y-5 border-t border-border pt-6">
            {match.matched.length + match.missing.length + match.related.length === 0 ? (
              <p className="text-sm text-muted-foreground">We couldn't identify specific skills or tools in this job description, so no match score was calculated.</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className={cn("font-display text-4xl font-extrabold", toneText[toneFor(match.score)])}>{match.score}%</span>
                  <div><p className="font-semibold">Job Match Score</p><p className="text-xs text-muted-foreground">Estimated share of the job's listed skills found in your resume</p></div>
                </div>
                <div><p className="mb-2 text-sm font-semibold">Matched keywords</p><Chips items={match.matched} tone="ok" /></div>
                {match.related.length > 0 && <div><p className="mb-2 text-sm font-semibold">Related match</p><Chips items={match.related.map((r) => `${r.jd} ≈ ${r.resume}`)} tone="rel" /></div>}
                <div><p className="mb-2 text-sm font-semibold">Missing keywords</p><Chips items={match.missing} tone="miss" /></div>
              </>
            )}
            {(match.softMatched.length > 0 || match.softMissing.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="mb-2 text-sm font-semibold">Soft skills matched</p><Chips items={match.softMatched} tone="ok" /></div>
                <div><p className="mb-2 text-sm font-semibold">Soft skills not mentioned</p><Chips items={match.softMissing} tone="miss" /></div>
              </div>
            )}
            {match.experience.length > 0 && (
              <div><p className="mb-2 text-sm font-semibold">Experience requirements in the job</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{match.experience.map((e) => <li key={e}>{e}</li>)}</ul></div>
            )}
          </div>
        )}
      </Card>

      <section className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-card">
        <div className="bg-hero p-6 md:p-8">
          <h2 className="text-2xl font-bold">Want a Detailed ATS Optimization?</h2>
          <p className="mt-2 text-muted-foreground">Get a deeper analysis of your resume and actionable suggestions for just ₹9.</p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {["Detailed ATS analysis","Job description matching","Missing keyword suggestions","Weak bullet-point improvements","Professional summary suggestions","Skills optimization","Experience optimization","Before/After comparison","Detailed recommendations","Downloadable report"].map((f) => (
              <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button variant="hero" size="xl" onClick={() => setPaywall(true)}>Unlock ATS Boost — ₹9</Button>
            <p className="text-sm text-muted-foreground">One-time payment • No subscription</p>
          </div>
        </div>
      </section>

      <Dialog open={paywall} onOpenChange={setPaywall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ATS Boost is launching soon</DialogTitle>
            <DialogDescription>
              Secure ₹9 checkout via Razorpay is being set up. You won't be charged anything today. Your free report above stays available.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setPaywall(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
