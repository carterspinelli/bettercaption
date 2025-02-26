import { Hero } from "@/components/ui/animated-hero";
import { PricingSection } from "@/components/blocks/pricing-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";
import { Image, Github, Twitter, Instagram } from "lucide-react";
import { MainHeader } from "@/components/ui/main-header";

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export const TIERS = [
  {
    id: "free",
    name: "Free",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "Perfect for trying out our AI-powered tools",
    features: [
      "5 image enhancements per month",
      "Basic caption suggestions",
      "Standard image quality",
      "Community support",
      "Basic analytics"
    ],
    cta: "Get Started",
  },
  {
    id: "creator",
    name: "Creator",
    price: {
      monthly: 9.99,
      yearly: 7.99,
    },
    description: "For serious content creators",
    features: [
      "50 image enhancements per month",
      "Advanced caption generation",
      "High-quality output",
      "Priority support",
      "Social media insights"
    ],
    cta: "Start Creating",
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: {
      monthly: 24.99,
      yearly: 19.99,
    },
    description: "For professional influencers",
    features: [
      "Unlimited enhancements",
      "Premium caption generation",
      "Ultra HD quality",
      "24/7 priority support",
      "Advanced analytics"
    ],
    cta: "Go Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    description: "For large teams and agencies",
    features: [
      "Everything in Professional",
      "Custom API access",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration tools"
    ],
    cta: "Contact Us",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MainHeader />
      <div className="fixed top-0 right-0 p-4 z-50">
        <ThemeToggle />
      </div>
      <Hero />
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>
        <PricingSection
          title="Simple Pricing"
          subtitle="Choose the plan that best fits your needs"
          frequencies={PAYMENT_FREQUENCIES}
          tiers={TIERS}
        />
      </div>
      <Footer
        logo={<Image className="h-10 w-10" />}
        brandName="Bettercaption"
        socialLinks={[
          {
            icon: <Instagram className="h-5 w-5" />,
            href: "https://instagram.com",
            label: "Instagram",
          },
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "/features", label: "Features" },
          { href: "/pricing", label: "Pricing" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/support", label: "Support" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/cookies", label: "Cookie Policy" },
        ]}
        copyright={{
          text: "© 2025 Bettercaption",
          license: "All rights reserved",
        }}
      />
    </div>
  );
}