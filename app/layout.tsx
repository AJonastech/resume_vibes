import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./provider";

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
});
const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Resume Vibes Check | AI Resume Analyzer",
  description:
    "Get your resume analyzed by AI for a fun, quirky, and insightful feedback using modern internet language.",
  keywords: [
    "resume",
    "AI analysis",
    "career",
    "job search",
    "resume feedback",
  ],
  authors: [{ name: "Resume Vibes Team" }],
  openGraph: {
    title: "Resume Vibes Check | AI Resume Analyzer",
    description:
      "Get a fun, quirky analysis of your resume with modern internet language",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Vibes Check",
    description: "AI-powered resume analysis with a modern twist",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`    
          ${satoshi.variable} 
          ${inter.variable}
          ${ibmPlexMono.variable}
          antialiased`}
      >
        <ThemeProvider defaultTheme="dark" attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
