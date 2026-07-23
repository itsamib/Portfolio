"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Users, LineChart } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/data-entry", label: "Data Entry", icon: PlusCircle },
  { href: "/accounts", label: "Accounts", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 p-4 z-40">
      <div className="glass-card h-full flex flex-col p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="glass-card p-2 bg-accent/20 border-accent/30">
            <LineChart className="w-5 h-5 text-accent" />
          </div>
          <span className="font-semibold text-gray-100 leading-tight">
            Portfolio
            <br />
            Tracker
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 py-3 text-xs text-gray-500">
          Data stored locally in your browser.
        </div>
      </div>
    </aside>
  );
}
