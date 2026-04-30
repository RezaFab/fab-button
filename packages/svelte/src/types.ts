import type {
  FabButtonKeyboardNavigation,
  FabButtonKeyboardOrientation,
  FabButtonLayout,
  FabButtonSectionBase,
  FabButtonShape,
  FabButtonSize,
  FabButtonVariant
} from "@rezafab/fab-button-core"

export type FabButtonSectionContent = string | number | null | undefined

export interface FabButtonSection extends FabButtonSectionBase {
  content: FabButtonSectionContent
  className?: string
  style?: string
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
  style?: string
  unstyled?: boolean
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
  keyboardNavigation?: FabButtonKeyboardNavigation
  keyboardOrientation?: FabButtonKeyboardOrientation
  loopNavigation?: boolean
  onClick?: (event: MouseEvent) => void
}
