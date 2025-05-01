import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { Analytics } from "@vercel/analytics/react";
import { Alert, Box, Typography, Paper } from '@mui/material';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ['400', '700'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SBIR Dashboard",
  description: "Dashboard for viewing SBIR/STTR solicitations",
  icons: {
    icon: '/sbir_dashboard-icon.svg',
    shortcut: '/sbir_dashboard-icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <ThemeRegistry>{children}</ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
