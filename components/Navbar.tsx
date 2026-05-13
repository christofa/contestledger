"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/create", label: "Create" },
  { href: "/auth", label: "Profile" }, // redirects to login before showing profile
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg font-display font-medium text-sm transition-colors",
                pathname === link.href
                  ? "text-text bg-surface-2"
                  : "text-muted hover:text-text hover:bg-surface"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-muted text-xs">ckb1qzda…f91</span>
          </div>
          <Link href="/create" className="btn-primary text-sm">
            <Zap className="w-4 h-4" />
            Create Contest
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden btn-ghost p-2"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-2.5 rounded-xl font-display font-medium text-sm",
                pathname === link.href
                  ? "text-text bg-surface-2"
                  : "text-muted hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/create" className="btn-primary mt-2 justify-center text-sm">
            Create Contest
          </Link>
        </div>
      )}
    </header>
  );
}
