import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { LanguageProvider } from "@/context/LanguageContext";
import MainLayout from "@/components/MainLayout";
import SWRegister from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "پورتفولیو من | مدیریت سرمایه‌گذاری و تحلیل پورتفولیو",
  description: "مدیریت و تحلیل عملکرد پورتفولیو، سود و زیان و بازدهی سرمایه‌گذاری با پشتیبانی از تاریخ شمسی و میلادی.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "پورتفولیو من",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="antialiased min-h-screen">
        <SWRegister />
        <LanguageProvider>
          <DataProvider>
            <MainLayout>{children}</MainLayout>
          </DataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
