/**
 * Merge this into your project's tailwind.config.ts.
 *
 * Critical bits:
 *  1. Import the kit's preset and add it to `presets`.
 *  2. Make sure `content` includes design-kit/**.
 *  3. The CSS variables `--font-sans` and `--font-serif` are set by
 *     next/font in app/layout.tsx — see config-templates/layout.tsx.
 */
import type { Config } from "tailwindcss";
import { designKitPreset } from "./design-kit/tokens/tailwind-preset";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./design-kit/**/*.{ts,tsx}",
  ],
  presets: [designKitPreset as Config],
  theme: {
    extend: {
      // Override the kit's font-family chain so it picks up the next/font
      // CSS variables we set in app/layout.tsx. This keeps Plus Jakarta Sans
      // as the default and Fraunces as the serif, with self-hosted weights.
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
