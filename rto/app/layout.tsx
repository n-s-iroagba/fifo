import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GeoRoutingModal } from "@/components/GeoRoutingModal";

export const metadata: Metadata = {
  title: "CertHero LMS — Trade Certification & Skills Assessment Portal",
  description: "Official Registered Training Organisation (RTO) LMS portal for trade certification, high-risk work licensing, mining compliance, and sponsored FIFO skills verification.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/certhero-logo.png",
  },
};

export default function RtoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <GeoRoutingModal />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
