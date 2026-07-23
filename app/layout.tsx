import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "Portfolio Performance Tracker",
  description: "Track equity, cash flow, and ROI across your accounts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <DataProvider>
          <Sidebar />
          <main className="ml-60 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
