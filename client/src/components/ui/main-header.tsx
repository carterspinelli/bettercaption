import { Link } from "wouter";
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user-nav"
import { BettercaptionLogo } from "@/components/logos"
import { useSession } from 'next-auth/react'

interface MainHeaderProps {
  user?: any
}

export default function MainHeader({ user }: MainHeaderProps) {

  const navItems = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Features',
      href: '/features',
    },
    {
      name: 'Pricing',
      href: '/#pricing',
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        {/* Logo - Left aligned */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <BettercaptionLogo className="h-6 w-6" />
            <span className="font-bold">Bettercaption</span>
          </Link>
        </div>

        {/* Navigation - Center aligned */}
        <div className="flex flex-1 items-center justify-center">
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
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="flex items-center">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}