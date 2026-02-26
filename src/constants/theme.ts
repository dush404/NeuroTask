// NeuroTask — Design System (Exoplan Style)
// Exact color match to Exoplan's dark UI palette.

export const Colors = {
  // ── Core Background ──────────────────────────────────────────────────
  background: "#0D0D0D", // Pure near-black — Exoplan root BG
  surface: "#1A1A1A", // Card / panel surface
  surfaceElevated: "#222222", // Elevated card bg (task blocks)
  surfaceBorder: "rgba(255,255,255,0.07)", // Subtle card border

  // ── Green Accent (Exoplan's signature color) ─────────────────────────
  accent: "#4CAF50", // Active nodes, buttons, highlights
  accentDim: "rgba(76,175,80,0.15)",
  accentGlow: "rgba(76,175,80,0.3)",
  timelineLine: "#2D6A4F", // Vertical timeline line color
  timelineFill: "#1B4332", // Task card green fill (high priority)
  timelineFillBorder: "rgba(76,175,80,0.35)",

  // ── Teal (alternate task card) ───────────────────────────────────────
  tealFill: "#164E63",
  tealBorder: "rgba(6,182,212,0.3)",

  // ── Text ─────────────────────────────────────────────────────────────
  textPrimary: "#F5F5F5",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.3)",
  textAccent: "#4CAF50",

  // ── Priority ─────────────────────────────────────────────────────────
  priorityHigh: "#FF4D6D",
  priorityMedium: "#F59E0B",
  priorityLow: "#4CAF50",

  // ── Status ───────────────────────────────────────────────────────────
  success: "#4CAF50",
  warning: "#F59E0B",
  error: "#FF4D6D",

  // ── Score Ring ───────────────────────────────────────────────────────
  scoreRing: "#4CAF50",
  scoreRingBg: "rgba(76,175,80,0.15)",

  // ── Overlay ──────────────────────────────────────────────────────────
  overlay: "rgba(0,0,0,0.75)",

  // Glass (kept for compatibility)
  glass: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.07)",
  glassStrong: "rgba(255,255,255,0.1)",
};

export const Typography = {
  fontSizeXS: 10,
  fontSizeSM: 12,
  fontSizeMD: 14,
  fontSizeLG: 17,
  fontSizeXL: 20,
  fontSizeXXL: 26,
  fontSizeHero: 32,

  fontWeightRegular: "400" as const,
  fontWeightMedium: "500" as const,
  fontWeightSemiBold: "600" as const,
  fontWeightBold: "700" as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 0, // elevation=0 to prevent Android gray box issue
  },
  accent: {
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 0,
  },
};
