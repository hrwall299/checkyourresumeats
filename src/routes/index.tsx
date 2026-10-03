import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Upload, ScanSearch, Rocket, Gauge, KeyRound, LayoutList, Wrench, Briefcase, GraduationCap, Contact, Type, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/Layout";
import { UploadDropzone } from "@/components/site/UploadDropzone";
import { FaqList, PricingComparison, SectionHeading } from "@/components/site/Sections";
import { FAQS } from "@/components/site/content";
import { setPendingFile } from "@/lib/pending-file";

const TITLE = "ATSBoost — Free ATS Resume Checker | Make Your Resume ATS-Ready";
const DESC = "Upload your PDF or DOCX resume and get a free ATS compatibility score, keyword analysis and fixes in seconds. Detailed ATS Boost report for just ₹9.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }),
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: Upload, title: "Upload Resume", text: "Upload your PDF or DOCX resume." },
  { icon: ScanSearch, title: "Get ATS Analysis", text: "We analyze structure, keywords, readability and common ATS issues." },
  { icon: Rocket, title: "Improve & Apply", text: "Use the recommendations to improve your resume." },
];
const CHECKS = [
  { icon: Gauge, t: "ATS Compatibility" }, { icon: KeyRound, t: "Keyword Match" }, { icon: LayoutList, t: "Resume Structure" },
  { icon: Wrench, t: "Skills" }, { icon: Briefcase, t: "Experience" }, { icon: GraduationCap, t: "Education" },
  { icon: Contact, t: "Contact Details" }, { icon: Type, t: "Formatting" }, { icon: Zap, t: "Action Verbs" }, { icon: Target, t: "Job Description Match" },
];

function Index() {
  const navigate = useNavigate();
  const onFile = (f: File) => { setPendingFile(f); navigate({ to: "/check" }); };
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-12 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary">
              Check. Improve. Apply with confidence.
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Is Your Resume <span className="text-primary">ATS-Friendly?</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">Upload your resume and get a free ATS compatibility check in seconds.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><a href="/check">Check My Resume — Free</a></Button>
              <Button asChild variant="outline" size="xl" className="rounded-xl"><a href="#how-it-works">See How It Works</a></Button>
            </div>
            <p className="mt-6 flex max-w-md items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              No job guarantee. We analyze resume structure, keywords and ATS compatibility.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card md:p-5">
            <UploadDropzone onFile={onFile} />
            <a href="/check?paste=1" className="mt-3 block text-center text-sm font-medium text-primary hover:underline">Or paste your resume text</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <SectionHeading eyebrow="How it works" title="Three steps to an ATS-ready resume" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><s.icon className="size-5" /></span>
                <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="What we check" title="Everything an ATS cares about" sub="Transparent checks, with an explanation for every recommendation." />
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CHECKS.map((c) => (
              <div key={c.t} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                <c.icon className="size-5 text-primary" />
                <span className="text-sm font-semibold">{c.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading eyebrow="Pricing" title="Free vs ATS Boost" sub="The basic check is genuinely useful and free. Go deeper for ₹9, once." />
        <PricingComparison />
      </section>

      <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <SectionHeading eyebrow="FAQ" title="Questions, answered honestly" />
        <FaqList />
      </section>
    </PageShell>
  );
}
