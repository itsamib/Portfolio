"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Users, LineChart, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/data-entry", label: "Data Entry", icon: PlusCircle },
  { href: "/accounts", label: "Accounts", icon: Users },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2 py-3 mb-4">
      <div className="glass-card p-2 bg-accent/20 border-accent/30 shrink-0">
        <LineChart className="w-5 h-5 text-accent" />
      </div>
      <span className="font-semibold text-gray-100 leading-tight">
        Portfolio
        <br />
        Tracker
      </span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer automatically whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar: fixed, always visible at md+ */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-60 p-4 z-40">
        <div className="glass-card h-full flex flex-col p-4">
          <Brand />
          <NavLinks />
          <div className="mt-auto px-2 py-3 text-xs text-gray-500">
            Data stored locally in your browser.
          </div>
        </div>
      </aside>

      {/* Mobile top bar: a slim strip with just a menu button, no reserved layout space */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 p-3">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="glass-card p-2.5 flex items-center justify-center text-gray-300 hover:text-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay + slide-in drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] p-4">
            <div className="glass-card h-full flex flex-col p-4 bg-gray-950/95">
              <div className="flex items-center justify-between mb-2">
                <Brand />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-gray-400 hover:text-gray-100 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto px-2 py-3 text-xs text-gray-500">
                Data stored locally in your browser.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
