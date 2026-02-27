import type { Metadata } from "next";
import { Space_Grotesk, DM_Serif_Display, Space_Mono, Syne, Inter, Instrument_Serif, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${dmSerif.variable} ${spaceMono.variable} ${syne.variable} ${inter.variable} ${instrument.variable} ${manrope.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <div className="noise-overlay fixed inset-0 pointer-events-none z-[9999] opacity-10 mix-blend-multiply" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
