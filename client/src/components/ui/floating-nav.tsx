import { useState, useEffect } from "react";
import { Button } from "./button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface FloatingNavProps {
  navItems: Array<{
    name: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export function FloatingNav({ navItems }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user } = useAuth();

  // When user scrolls down, add background to the floating nav
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed bottom-5 left-0 right-0 z-50 flex justify-center transition-all duration-300",
      hasScrolled ? "translate-y-0" : ""
    )}>
      <div className={cn(
        "flex items-center rounded-full transition-all duration-300",
        isOpen ? "bg-background shadow-lg border px-4 py-2" : "",
        hasScrolled || isOpen ? "opacity-100" : "opacity-70 hover:opacity-100"
      )}>
        {isOpen && (
          <nav className="flex items-center space-x-1 mr-2">
            {navItems.map((item, i) => (
              <Link key={i} href={item.href}>
                <Button variant="ghost" size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-sm"
                >
                  {item.icon}
                  <span className="ml-1">{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>
        )}
        
        <Button
          size="icon"
          className={cn(
            "rounded-full h-12 w-12 shadow-md transition-transform duration-300",
            isOpen ? "rotate-45 bg-muted hover:bg-muted/80" : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className={cn("h-5 w-5", isOpen ? "text-primary" : "text-primary-foreground")} />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
    </div>
  );
}
