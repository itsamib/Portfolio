"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Users, LineChart, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRtl = language === "fa";

  const navItems = [
    { href: "/", label: t("nav.dashboard", language), icon: Home },
    { href: "/data-entry", label: t("nav.dataEntry", language), icon: PlusCircle },
    { href: "/accounts", label: t("nav.accounts", language), icon: Users },
  ];

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

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  function Brand() {
    return (
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-200 dark:border-white/10">
        <div className="p-2 bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
          <LineChart className="w-5 h-5" />
        </div>
        <span className="font-bold text-slate-900 dark:text-gray-100 text-base leading-tight">
          {t("header.title", language)}
        </span>
      </div>
    );
  }

  return (
    <aside
      className={`hidden md:block fixed top-16 h-[calc(100vh-4rem)] w-60 p-4 z-30 ${
        isRtl ? "right-0" : "left-0"
      }`}
    >
      <div className="glass-card h-full flex flex-col p-4">
        <Brand />
        <NavLinks />
        <div className="mt-auto px-2 py-3 text-xs text-slate-500 dark:text-gray-500 border-t border-slate-200 dark:border-white/5">
          {t("app.footerNote", language)}
        </div>
      </div>
    </aside>
  );
}
