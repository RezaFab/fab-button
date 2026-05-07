export type FabButtonLayout = "flex" | "grid"

export type FabButtonSize = "sm" | "md" | "lg"

export type FabButtonShape = "square" | "rounded" | "pill"

export type FabButtonVariant = "default" | "primary" | "dark" | "outline" | "ghost"

export type FabButtonKeyboardNavigation = "tab" | "toolbar"

export type FabButtonKeyboardOrientation = "horizontal" | "vertical" | "both"
export type FabButtonOverflowMode = "none" | "more"
export type FabButtonActionPreset = "default" | "split"
export type FabButtonShortcutKey = string | number
export type FabButtonSectionShortcut = FabButtonShortcutKey | FabButtonShortcutKey[]
export type FabButtonShortcutId = number
export type FabButtonSectionShortcutId = FabButtonShortcutId | FabButtonShortcutId[]
export type FabButtonSectionAsyncState = "idle" | "loading" | "success" | "error"
export type FabButtonSectionActionSource = "click" | "shortcut" | "keyboard-nav"
export interface FabButtonSectionActionMeta {
  key: string
  index: number
  source: FabButtonSectionActionSource
}
export interface FabButtonSectionConfirmConfig {
  title?: string
  description?: string
}
export type FabButtonSectionConfirm = boolean | FabButtonSectionConfirmConfig
export type FabButtonSectionGuard<TSection> = boolean | ((section: TSection) => boolean)

export type FabButtonCssMode = "manual" | "library"

export type FabButtonLibraryPreset = "tailwind" | "bootstrap" | "custom"
export type FabButtonTheme = "light" | "dark" | "system"

export interface FabButtonSectionBase {
  key: string
  shortcut?: FabButtonSectionShortcut
  shortcutId?: FabButtonSectionShortcutId
  confirm?: FabButtonSectionConfirm
  asyncState?: FabButtonSectionAsyncState
  asyncFeedbackDuration?: number
  className?: string
  disabled?: boolean
  visibleWhen?: FabButtonSectionGuard<FabButtonSectionBase>
  disabledWhen?: FabButtonSectionGuard<FabButtonSectionBase>
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
