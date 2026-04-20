// src/theme/colors.ts
export const colors = {
  smacRed:       "#E3000F",
  smacRedDark:   "#B8000C",
  smacRedLight:  "#FDECEA",
  gray:          "#6B7280",
  grayLight:     "#F3F4F6",
  grayBorder:    "#E5E7EB",
  dark:          "#111827",
  text:          "#374151",
  white:         "#FFFFFF",
  success:       "#16A34A",
  warning:       "#D97706",
} as const;

// Type utilitaire — permet d'utiliser les clés comme type
export type ColorKey = keyof typeof colors;