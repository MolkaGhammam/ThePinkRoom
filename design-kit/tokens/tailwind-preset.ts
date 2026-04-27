import type { Config } from "tailwindcss";
import { colors, radii, typography, effects, sizes } from "./index";

export const designKitPreset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "DM Serif Display", "Playfair Display", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        canvas: colors.bg.canvas,
        surface: colors.bg.surface,
        muted: colors.bg.muted,
        inverse: colors.bg.inverse,
        ink: {
          DEFAULT: colors.text.primary,
          secondary: colors.text.secondary,
          muted: colors.text.muted,
          inverse: colors.text.inverse,
        },
        line: {
          subtle: colors.border.subtle,
          strong: colors.border.strong,
        },
        pink: {
          DEFAULT: colors.accent.pink.bg,
          soft: colors.accent.pink.bgSoft,
          fg: colors.accent.pink.fg,
          ring: colors.accent.pink.ring,
        },
        mint: {
          DEFAULT: colors.accent.mint.bg,
          soft: colors.accent.mint.bgSoft,
          fg: colors.accent.mint.fg,
          ring: colors.accent.mint.ring,
        },
        lavender: {
          DEFAULT: colors.accent.lavender.bg,
          soft: colors.accent.lavender.bgSoft,
          fg: colors.accent.lavender.fg,
          solid: colors.accent.lavender.solid,
          "solid-hover": colors.accent.lavender.solidHover,
          ring: colors.accent.lavender.ring,
        },
        chip: {
          idle: colors.chip.idleBg,
          "idle-fg": colors.chip.idleFg,
          selected: colors.chip.selectedBg,
          "selected-fg": colors.chip.selectedFg,
        },
        success: colors.mark.success,
      },
      borderRadius: {
        ...radii,
      },
      fontSize: typography.fontSize as unknown as Record<
        string,
        [string, { lineHeight: string; letterSpacing?: string }]
      >,
      boxShadow: {
        card: effects.shadow.card,
        soft: effects.shadow.sm,
      },
      maxWidth: {
        viewport: sizes.viewport.mobile,
      },
    },
  },
};

export default designKitPreset;
