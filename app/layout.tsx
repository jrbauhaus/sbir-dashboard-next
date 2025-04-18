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
  const afwerxUpdate = 'AFWERX Update: "The Department of the Air Force has removed its submitted topics from the 25.2/B OSD SBIR/STTR solicitation while they undergo internal review..."';
  const filterGuidance = 'Please use the Branch filter to view opportunities from other agencies.';

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <Paper 
          elevation={0} 
          square 
          sx={{ 
            py: 1, 
            px: 2, 
            bgcolor: 'background.paper', 
            borderBottom: 1, 
            borderColor: 'divider', 
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
            {afwerxUpdate}
          </Typography>
          <Box sx={{ height: '0.5em' }} /> 
          <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {filterGuidance}
          </Typography>
        </Paper>
        <ThemeRegistry>{children}</ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
