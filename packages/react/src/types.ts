import type { CSSProperties, MouseEvent, ReactNode } from "react"
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

export interface FabButtonSection extends FabButtonSectionBase {
  content: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
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
  style?: CSSProperties
  unstyled?: boolean
  disabled?: boolean
  loading?: boolean
  theme?: FabButtonTheme
  ariaLabel?: string
  keyboardNavigation?: FabButtonKeyboardNavigation
  keyboardOrientation?: FabButtonKeyboardOrientation
  loopNavigation?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}
