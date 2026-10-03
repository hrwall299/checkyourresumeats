import { Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BOOST_FEATURES, FAQS, FREE_FEATURES } from "./content";

export function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PricingComparison({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-7">
        <p className="font-display text-lg font-semibold">Free</p>
        <p className="mt-2 font-display text-4xl font-bold">₹0</p>
        <p className="text-sm text-muted-foreground">Always free</p>
        <ul className="mt-6 space-y-3 text-sm">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>
          ))}
        </ul>
        <Button asChild variant="outline" size="xl" className="mt-7 w-full"><a href="/check">Check My Resume — Free</a></Button>
      </div>
      <div className="relative rounded-2xl border-2 border-primary bg-card p-7 shadow-card">
        <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary-foreground">ATS Boost</span>
        <p className="font-display text-lg font-semibold">ATS Boost</p>
        <p className="mt-2 font-display text-4xl font-bold">₹9</p>
        <p className="text-sm text-muted-foreground">One-time payment • No subscription</p>
        <ul className="mt-6 space-y-3 text-sm">
          {BOOST_FEATURES.map((f) => (
            <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
          ))}
        </ul>
        {onUnlock ? (
          <Button variant="hero" size="xl" className="mt-7 w-full" onClick={onUnlock}>Unlock ATS Boost — ₹9</Button>
        ) : (
          <Button asChild variant="hero" size="xl" className="mt-7 w-full"><a href="/check">Unlock ATS Boost — ₹9</a></Button>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">Run your free check first, then unlock the detailed report.</p>
      </div>
    </div>
  );
}

export function FaqList() {
  return (
    <Accordion type="single" collapsible className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card px-6">
      {FAQS.map((f) => (
        <AccordionItem key={f.q} value={f.q}>
          <AccordionTrigger className="text-left font-display text-base font-semibold">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
