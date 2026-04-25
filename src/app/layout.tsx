import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Pink Room",
  description: "Appointment management for The Pink Room.",
};

// Font CSS variables are passed down via the className on <html> in [locale]/layout.tsx.
export const fontVariables = `${sans.variable} ${serif.variable}`;

// This layout renders no HTML — [locale]/layout.tsx owns the full <html> tree.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
