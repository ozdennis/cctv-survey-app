import type { Metadata } from "next";
import { Space_Grotesk, DM_Serif_Display, Space_Mono, Syne, Inter, Instrument_Serif, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ variable: "--font-dmserif", weight: "400", subsets: ["latin"], style: ["normal", "italic"] });
const spaceMono = Space_Mono({ variable: "--font-spacemono", weight: ["400", "700"], subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", weight: "400", subsets: ["latin"], style: ["normal", "italic"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PT. Pantauan Nusantara - Enterprise Security Integration",
  description: "CCTV, IT Networking, and Advanced Access Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSerif.variable} ${spaceMono.variable} ${syne.variable} ${inter.variable} ${instrument.variable} ${manrope.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
