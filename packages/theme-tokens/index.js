export const fabButtonThemeTokens = {
  color: {
    zinc050: "#fafafa",
    zinc100: "#f4f4f5",
    zinc300: "#d4d4d8",
    zinc500: "#71717a",
    zinc600: "#52525b",
    zinc700: "#3f3f46",
    zinc800: "#27272a",
    zinc900: "#18181b",
    white: "#ffffff",
    blue600: "#2563eb",
    blue700: "#1d4ed8"
  },
  alpha: {
    black08: "rgba(0, 0, 0, 0.08)",
    white12: "rgba(255, 255, 255, 0.12)",
    white18: "rgba(255, 255, 255, 0.18)",
    blue40: "rgba(59, 130, 246, 0.4)"
  },
  radius: {
    square: "0.35rem",
    rounded: "0.625rem",
    pill: "999px"
  },
  spacing: {
    "2xs": "0.125rem",
    xxs: "0.25rem",
    xs: "0.375rem",
    sm: "0.6875rem",
    md: "0.875rem",
    lg: "1rem"
  },
  fontSize: {
    sm: "0.8125rem",
    md: "0.9375rem",
    lg: "1rem"
  },
  fontWeight: {
    semibold: "600"
  },
  size: {
    height: {
      sm: "2.125rem",
      md: "2.5rem",
      lg: "2.875rem"
    }
  },
  transition: {
    fast: "140ms ease"
  },
  button: {
    base: {
      bg: "var(--fab-color-zinc-100)",
      colorLight: "var(--fab-color-zinc-900)",
      colorDark: "var(--fab-color-zinc-100)",
      borderLight: "1px solid var(--fab-color-zinc-300)",
      borderDark: "1px solid var(--fab-color-zinc-700)"
    },
    variant: {
      default: {
        bg: "var(--fab-color-zinc-100)",
        colorLight: "var(--fab-color-zinc-900)",
        colorDark: "var(--fab-color-zinc-100)",
        borderLight: "1px solid var(--fab-color-zinc-300)",
        borderDark: "1px solid var(--fab-color-zinc-700)"
      },
      primary: {
        bg: "var(--fab-color-blue-600)",
        color: "var(--fab-color-white)",
        border: "1px solid var(--fab-color-blue-700)"
      },
      dark: {
        bg: "var(--fab-color-zinc-900)",
        color: "var(--fab-color-zinc-050)",
        border: "1px solid var(--fab-color-zinc-800)"
      },
      outline: {
        bg: "transparent",
        colorLight: "var(--fab-color-zinc-900)",
        colorDark: "var(--fab-color-zinc-100)",
        borderLight: "1px solid var(--fab-color-zinc-500)",
        borderDark: "1px solid var(--fab-color-zinc-600)"
      },
      ghost: {
        bg: "transparent",
        colorLight: "var(--fab-color-zinc-900)",
        colorDark: "var(--fab-color-zinc-100)",
        border: "1px solid transparent"
      }
    },
    interaction: {
      focusRing: "0 0 0 3px var(--fab-alpha-blue-40)",
      hoverBrightness: "0.97",
      sectionHoverLight: "var(--fab-alpha-black-08)",
      sectionHoverDark: "var(--fab-alpha-white-12)",
      sectionHoverPrimary: "var(--fab-alpha-white-18)"
    },
    state: {
      disabledOpacity: "0.6",
      disabledSectionOpacity: "0.75"
    }
  }
}

export default fabButtonThemeTokens
