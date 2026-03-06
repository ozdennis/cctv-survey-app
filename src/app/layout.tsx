import type { Metadata } from "next";
import { Rajdhani, IBM_Plex_Mono, Work_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"]
});

export const metadata: Metadata = {
  title: "PT. Pantauan Nusantara - Instalasi CCTV, Jaringan & Web Design Profesional",
  description: "Solusi lengkap keamanan & teknologi: Instalasi CCTV profesional, infrastruktur jaringan, dan jasa pembuatan website untuk bisnis Anda.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${rajdhani.variable} ${ibmPlexMono.variable} ${workSans.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
