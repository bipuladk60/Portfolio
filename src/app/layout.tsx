import type { Metadata, Viewport } from "next";
import { Barlow, Fredoka, Martian_Mono, Nunito, Saira_Condensed } from "next/font/google";
import { CHAPTER_BOOT_SCRIPT } from "@/lib/chapter-boot";
import "./globals.css";

// Chapter 1 (the expedition HUD) fonts.
// Saira Condensed: tall, squared headings that read like expedition signage and mission patches.
const display = Saira_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Barlow: a slightly rounded grotesk drawn from highway signage; warm and very legible for body copy.
const body = Barlow({
  variable: "--font-body-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Martian Mono: a wide instrument-panel mono for telemetry, labels and readouts.
const mono = Martian_Mono({
  variable: "--font-mono-face",
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
      <body className={`${display.variable} ${body.variable} ${mono.variable} ${fredoka.variable} ${nunito.variable} grain antialiased`}>
        {children}
      </body>
    </html>
  );
}
