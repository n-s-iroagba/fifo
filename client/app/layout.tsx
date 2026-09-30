import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "@/components/Providers";
import JivoChat from "@/components/ui/JivoChat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const isAvelingHeader = headersList.get('x-is-aveling') === 'true';
  const rawHost = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
  const isAveling = isAvelingHeader || host.startsWith('aveling.') || host === 'aveling.online' || host === 'www.aveling.online';

  if (isAveling) {
    return {
      title: "Aveling LMS - FIFO Training & Certification Portal",
      description: "Official LMS training portal for FIFO worker compliance, theory courseware, exams, and practical training.",
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Aveling LMS",
      },
    };
  }

  return {
    title: "BlueCollar | Your Gateway to Global Opportunities",
    description: "Secure and transparent job application platform with real-time tracking.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "BlueCollar",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b3486",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isAvelingHeader = headersList.get('x-is-aveling') === 'true';
  const rawHost = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
  const isAveling = isAvelingHeader || host.startsWith('aveling.') || host === 'aveling.online' || host === 'www.aveling.online';

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content={isAveling ? "#FFC700" : "#0b3486"} />
      </head>
      <body className={`min-h-full flex flex-col font-sans ${isAveling ? 'bg-zinc-50 text-zinc-900' : 'bg-surface text-on-surface'}`}>
        <Providers>
          {children}
          {!isAveling && <JivoChat />}
        </Providers>
      </body>
    </html>
  );
}


