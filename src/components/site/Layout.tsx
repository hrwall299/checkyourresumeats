import { Link } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground">
        <FileCheck2 className="size-4" />
      </span>
      ATS<span className="-ml-2 text-primary">Boost</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="/#pricing" className="hover:text-foreground">Pricing</a>
          <a href="/#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <Button asChild variant="hero" size="sm" className="h-9 px-4">
          <Link to="/check">Check Resume — Free</Link>
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const links: { to: string; label: string }[] = [
    { to: "/#pricing", label: "Pricing" },
  ];
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Make Your Resume ATS-Ready.</p>
          <p className="mt-1 text-xs text-muted-foreground">Scores are ATSBoost estimates. We don't guarantee jobs or interviews.</p>
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</a>
          <a href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-muted-foreground hover:text-foreground">{l.label}</a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} ATSBoost</div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
