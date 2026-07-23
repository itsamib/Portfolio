"use client";

import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CashInterestMaturityModal from "@/components/CashInterestMaturityModal";
import { useLanguage } from "@/context/LanguageContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const isRtl = language === "fa";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <CashInterestMaturityModal />
      <div className="flex-1 flex relative max-w-7xl w-full mx-auto">
        <Sidebar />
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] p-4 pt-16 sm:p-6 md:p-8 transition-all ${
            isRtl ? "md:mr-60" : "md:ml-60"
          }`}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
