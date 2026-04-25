/**
 * Design tokens — single source of truth.
 * Mirrors the mint+lavender+cream language extracted from
 * references/screenshots/HomePage.png + DatePage.png.
 */

export const colors = {
  bg: {
    /** Barely-tinted blush canvas — slight pink wash so soft-pink cards have a tonal home. */
    canvas: "#FDF6F7",
    surface: "#FFFFFF",
    muted: "#F4EAEC",
    inverse: "#1A1212",
  },
  text: {
    /** Plum-ink — warmer than navy, still high contrast. */
    primary: "#2A1622",
    secondary: "#7A5C6A",
    muted: "#B49AA6",
    inverse: "#FFFFFF",
  },
  border: {
    subtle: "#EDE0E2",
    strong: "#D9C7CB",
  },
  accent: {
    /** PRIMARY identity color — washed-out blush pink (same as the Calendar panel). */
    pink: {
      bg: "#FCE7EB",
      bgSoft: "#FCE7EB",
      fg: "#5A1F32",
      ring: "#F1A8B6",
    },
    /** Selected/action color — kept lavender so existing toggles + CTA remain consistent. */
    lavender: {
      bg: "#E0D6F5",
      bgSoft: "#F1ECFB",
      fg: "#FFFFFF",
      solid: "#9B86E0",
      solidHover: "#8772D4",
      ring: "#C5B7EE",
    },
    /** Secondary supporting accent — small uses only (badges, leading chip plate). */
    mint: {
      bg: "#D6E9DF",
      bgSoft: "#E8F2EC",
      fg: "#234A3A",
      ring: "#B3D1C0",
    },
  },
  chip: {
    idleBg: "#F1ECEC",
    idleFg: "#2A1622",
    selectedBg: "#9B86E0",
    selectedFg: "#FFFFFF",
  },
  mark: {
    success: "#16A37A",
    danger: "#E5484D",
    info: "#3E63DD",
  },
} as const;

export const radii = {
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "28px",
  "2xl": "32px",
  full: "9999px",
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
} as const;

export const typography = {
  fontFamily: {
    sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    /** Editorial display serif — used on display headlines only. */
    serif: '"Fraunces", "DM Serif Display", "Playfair Display", ui-serif, Georgia, serif',
  },
  fontSize: {
    tiny: ["11px", { lineHeight: "14px" }],
    small: ["13px", { lineHeight: "18px" }],
    body: ["15px", { lineHeight: "22px" }],
    h2: ["20px", { lineHeight: "26px" }],
    "display-xl": ["28px", { lineHeight: "34px", letterSpacing: "-0.01em" }],
    "display-2xl": ["32px", { lineHeight: "38px", letterSpacing: "-0.02em" }],
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const sizes = {
  viewport: {
    mobile: "390px",
  },
  control: {
    iconButtonSm: "36px",
    iconButtonMd: "44px",
    chip: "44px",
    chipDay: "56px",
    cta: "56px",
  },
  avatar: {
    xs: "28px",
    sm: "36px",
    md: "44px",
    lg: "56px",
  },
} as const;

export const effects = {
  shadow: {
    none: "none",
    sm: "0 1px 2px rgba(15, 20, 27, 0.04), 0 1px 1px rgba(15, 20, 27, 0.02)",
    card: "0 6px 20px -8px rgba(15, 20, 27, 0.10)",
  },
  ring: {
    focus: "0 0 0 3px rgba(139, 124, 217, 0.35)",
  },
} as const;

export const tokens = {
  colors,
  radii,
  spacing,
  typography,
  sizes,
  effects,
} as const;

export type Tokens = typeof tokens;
export default tokens;
