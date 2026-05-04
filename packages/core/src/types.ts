export type FabButtonLayout = "flex" | "grid"

export type FabButtonSize = "sm" | "md" | "lg"

export type FabButtonShape = "square" | "rounded" | "pill"

export type FabButtonVariant = "default" | "primary" | "dark" | "outline" | "ghost"

export type FabButtonKeyboardNavigation = "tab" | "toolbar"

export type FabButtonKeyboardOrientation = "horizontal" | "vertical" | "both"

export type FabButtonCssMode = "manual" | "library"

export type FabButtonLibraryPreset = "tailwind" | "bootstrap" | "custom"
export type FabButtonTheme = "light" | "dark" | "system"

export interface FabButtonSectionBase {
  key: string
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

export interface FabButtonClassOptions {
  className?: string
  layout?: FabButtonLayout
  size?: FabButtonSize
  shape?: FabButtonShape
  variant?: FabButtonVariant
  theme?: FabButtonTheme
  disabled?: boolean
  loading?: boolean
}

export interface FabButtonSectionClassOptions {
  className?: string
  disabled?: boolean
  interactive?: boolean
  theme?: FabButtonTheme
}

export interface FabButtonLibraryClassMap {
  root?: string
  rootDark?: string
  rootLight?: string
  section?: string
  actionSection?: string
  actionSectionDark?: string
  actionSectionLight?: string
  loadingSection?: string
  disabled?: string
  loading?: string
  layout?: Partial<Record<FabButtonLayout, string>>
  size?: Partial<Record<FabButtonSize, string>>
  shape?: Partial<Record<FabButtonShape, string>>
  variant?: Partial<Record<FabButtonVariant, string>>
}

export interface FabButtonStyleConfig {
  cssMode?: FabButtonCssMode
  theme?: FabButtonTheme
  library?: {
    preset?: FabButtonLibraryPreset
    classes?: FabButtonLibraryClassMap
  }
}
