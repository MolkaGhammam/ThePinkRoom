/**
 * app/layout.tsx — drop this into your Next.js App Router project.
 *
 * What it does:
 *  - Loads Plus Jakarta Sans (sans body) and Fraunces (serif display) via
 *    next/font/google (zero CLS, self-hosted, automatic font-display: swap).
 *  - Exposes them as CSS variables `--font-sans` and `--font-serif`, which
 *    the kit's tailwind config consumes via theme.extend.fontFamily.
 *  - Sets the `bg-canvas` body background so the kit's tokens take over
 *    immediately on first paint.
 */
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
  // Fraunces supports optical sizing and SOFT axis. The defaults are fine
  // for display use; tighten or expand axes via `axes` if needed.
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your App",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
