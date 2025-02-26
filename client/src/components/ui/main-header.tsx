import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Image as ImageIcon, Wand2, CreditCard, Upload, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MainHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      name: "Features",
      link: "/#features",
      icon: <Wand2 className="h-4 w-4" />,
    },
    {
      name: "Pricing",
      link: "/#pricing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <Upload className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-1.5 cursor-pointer pl-2">
              <ImageIcon className="h-5 w-5" />
              <span className="font-bold text-lg">Bettercaption</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center gap-4 flex-1">
          <nav className="flex items-center space-x-4">
            {navItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.link}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          </div>
          <ThemeToggle />
        

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 pr-2 flex-1 justify-end">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth">
                <Button size="sm" variant="outline">
                  Log in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                {navItems.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.link}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <div className="border-t my-4"></div>
                {user ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full mb-2" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setOpen(false)}>
                      <Button className="w-full" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}