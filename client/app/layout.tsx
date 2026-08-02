import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import JivoChat from "@/components/ui/JivoChat";
import { PushNotificationManager } from "@/components/PushNotificationManager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlueCollarRecruitment | Your Gateway to Global Opportunities",
  description: "Secure and transparent job application platform with real-time tracking.",
  manifest: "/manifest.json",
  themeColor: "#0b3486",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BlueCollarRecruitment",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-surface text-on-surface">
        <Providers>
          {children}
          <PushNotificationManager />
          <JivoChat />
        </Providers>
      </body>
    </html>
  );
}

