import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Event Details", path: "/" },
  { name: "Venue", path: "/venue" },
  { name: "Golf Outing", path: "/golf" },
  { name: "Lodging", path: "/hotels" },
  { name: "RSVP List", path: "/rsvp-list" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="font-serif text-2xl font-bold text-primary tracking-tight cursor-pointer">
                  A Legacy of Service
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-secondary cursor-pointer",
                      location === link.path ? "text-secondary border-b-2 border-secondary pb-1" : "text-primary/70"
                    )}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
              <Button 
                onClick={() => {
                  if (location !== '/') {
                    window.location.href = '/#rsvp-section';
                  } else {
                    document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="rounded-full px-6"
              >
                RSVP
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary hover:text-secondary p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-border/40 shadow-inner">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                      location === link.path
                        ? "bg-muted text-secondary"
                        : "text-primary/70 hover:bg-muted/50 hover:text-secondary"
                    )}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t-[6px] border-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl mb-4 text-white">Honoring a Distinguished Career</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 font-light text-lg">
            Please join us in celebrating years of dedicated service, leadership, and unwavering commitment.
          </p>
          <div className="w-16 h-[1px] bg-secondary mx-auto mb-8"></div>
          <div className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Officer Darren Johnson Retirement Celebration. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
