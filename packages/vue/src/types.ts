import type { StyleValue, VNodeChild } from "vue"
import type {
  FabButtonKeyboardNavigation,
  FabButtonKeyboardOrientation,
  FabButtonLayout,
  FabButtonSectionBase,
  FabButtonShape,
  FabButtonSize,
  FabButtonTheme,
  FabButtonVariant
} from "@rezafab/fab-button-core"

export type FabButtonSectionContent = VNodeChild | (() => VNodeChild)

export interface FabButtonSection extends FabButtonSectionBase {
  content: FabButtonSectionContent
  className?: string
  style?: StyleValue
  onClick?: (event: MouseEvent) => void
}

export interface FabButtonProps {
  sections: FabButtonSection[]
  variant?: FabButtonVariant
  size?: FabButtonSize
  shape?: FabButtonShape
  layout?: FabButtonLayout
  columns?: string
  rows?: string
  gap?: string
  className?: string
  style?: StyleValue
  unstyled?: boolean
  disabled?: boolean
  loading?: boolean
  theme?: FabButtonTheme
  ariaLabel?: string
  keyboardNavigation?: FabButtonKeyboardNavigation
  keyboardOrientation?: FabButtonKeyboardOrientation
  loopNavigation?: boolean
  onClick?: (event: MouseEvent) => void
}
