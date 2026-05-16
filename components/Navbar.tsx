"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, UserCircle2, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/create", label: "Create" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  async function handleSignOut() {
    setLoggingOut(true);

    try {
      await authClient.signOut();
      setProfileMenuOpen(false);
      setMobileOpen(false);
      router.push("/auth");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 font-display text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-surface-2 text-text"
                  : "text-muted hover:bg-surface hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs text-muted">ckb1qzda...f91</span>
          </div>
          <Link href="/create" className="btn-primary text-sm">
            <Zap className="h-4 w-4" />
            Create Contest
          </Link>
          {!isPending &&
            (session ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:border-border-bright hover:bg-surface-2"
                >
                  <UserCircle2 className="h-6 w-6" />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-border bg-surface p-2 shadow-xl shadow-black/20">
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate font-display text-sm font-semibold text-text">
                        {session.user.name || "Contest User"}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted">
                        {session.user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-display text-sm text-text transition-colors hover:bg-surface-2 disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="btn-outline text-sm">
                Sign In
              </Link>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="btn-ghost p-2 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-2 border-t border-border bg-surface px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-xl px-4 py-2.5 font-display text-sm font-medium",
                pathname === link.href
                  ? "bg-surface-2 text-text"
                  : "text-muted hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/create"
            onClick={() => setMobileOpen(false)}
            className="btn-primary mt-2 justify-center text-sm"
          >
            Create Contest
          </Link>
          {!isPending &&
            (session ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-display text-sm text-text transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="btn-outline mt-2 justify-center text-sm"
              >
                Sign In
              </Link>
            ))}
        </div>
      )}
    </header>
  );
}
