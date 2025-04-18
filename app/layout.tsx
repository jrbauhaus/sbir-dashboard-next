import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { Analytics } from "@vercel/analytics/react";
import { Alert, Box, Typography } from '@mui/material';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const afwerxUpdate = 'AFWERX Update: "The Department of the Air Force has removed its submitted topics from the 25.2/B OSD SBIR/STTR solicitation while they undergo internal review..."';
  const filterGuidance = 'Please use the Branch filter to view opportunities from other agencies.';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1100, width: '100%' }}>
          <Alert
            severity="warning"
            variant="filled"
            sx={{ borderRadius: 0, justifyContent: 'center', textAlign: 'center', display: 'flex', alignItems: 'center' }}
          >
            <Box>
              <Typography variant="body2" component="span">
                {afwerxUpdate}
              </Typography>
              <Box sx={{ height: '0.5em' }} />
              <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                {filterGuidance}
              </Typography>
            </Box>
          </Alert>
        </Box>
        <ThemeRegistry>{children}</ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
