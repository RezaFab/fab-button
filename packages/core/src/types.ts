export type FabButtonLayout = "flex" | "grid"

export type FabButtonSize = "sm" | "md" | "lg"

export type FabButtonShape = "square" | "rounded" | "pill"

export type FabButtonVariant = "default" | "primary" | "dark" | "outline" | "ghost"

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
  disabled?: boolean
  loading?: boolean
}

export interface FabButtonSectionClassOptions {
  className?: string
  disabled?: boolean
}
