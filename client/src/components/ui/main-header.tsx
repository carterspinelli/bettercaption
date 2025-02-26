import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ImageIcon, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

export function MainHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Features",
      href: "/#features",
    },
    {
      name: "Pricing",
      href: "/#pricing",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        {/* Logo - Left aligned */}
        <div className="mr-4 flex md:w-1/4 justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6" /> 
            <span className="font-bold">Bettercaption</span>
          </Link>
        </div>

        {/* Navigation - Center aligned */}
        <div className="flex-1 items-center justify-center hidden md:flex md:w-2/4">
          <nav className="flex items-center space-x-6">
            {navItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center justify-end space-x-4 md:w-1/4 ml-auto">
          <ThemeToggle />

          {/* Auth Buttons - Only visible on desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col py-6">
                  <div className="flex items-center justify-center mb-6">
                    <ImageIcon className="h-6 w-6 mr-2" />
                    <span className="font-bold">Bettercaption</span>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navItems.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium py-2 transition-colors hover:text-primary text-center"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto pt-6 border-t">
                    {user ? (
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        <Button className="w-full" size="sm">
                          Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link href="/auth" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full" size="sm">
                            Log in
                          </Button>
                        </Link>
                        <Link href="/auth" onClick={() => setOpen(false)}>
                          <Button className="w-full" size="sm">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}