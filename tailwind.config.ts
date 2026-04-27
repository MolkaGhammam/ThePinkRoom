import type { Config } from "tailwindcss";
import { designKitPreset } from "./design-kit/tokens/tailwind-preset";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./design-kit/**/*.{ts,tsx}",
  ],
  presets: [designKitPreset as Config],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
