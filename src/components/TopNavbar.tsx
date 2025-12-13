import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeartIcon } from "./icons/PaymentIcons";

export function TopNavbar({ className }: { className?: string }) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <div className={cn("fixed inset-x-0 top-4 z-50 px-4", className)}>
      <div className="mx-auto max-w-5xl rounded-full border border-border bg-background/80 px-3 shadow-tipkoro backdrop-blur-md">
        <div className="flex items-center justify-between py-2 gap-2">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HeartIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">TipKoro</span>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => scrollToSection("how")} 
              className="rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection("pricing")} 
              className="rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection("creators")} 
              className="rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Creators
            </button>
          </nav>
          
          {/* Right-side actions */}
          <div className="ml-auto flex items-center gap-2">
            <Link to="/waitlist">
              <Button
                variant="default"
                className="rounded-full px-6 h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
