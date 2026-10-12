import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Fredoka, IBM_Plex_Sans, JetBrains_Mono, Nunito } from "next/font/google";
import { CHAPTER_BOOT_SCRIPT } from "@/lib/chapter";
import "./globals.css";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Chapter 2 (the Warmer world) fonts.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bipul Adhikari · Expedition Control",
  description:
    "Bipul Adhikari, software engineer. CS & Math at Southern Miss. Full-stack work, four hackathon wins, ML research on PFAS and COPD, and games drawn entirely in code.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CHAPTER_BOOT_SCRIPT }} />
      </head>
      <body className={`${chakra.variable} ${plex.variable} ${jetbrains.variable} ${fredoka.variable} ${nunito.variable} grain antialiased`}>
        {children}
      </body>
    </html>
  );
}
