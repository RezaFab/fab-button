import type { CSSProperties, MouseEvent, ReactNode } from "react"
import type {
  FabButtonLayout,
  FabButtonSectionBase,
  FabButtonShape,
  FabButtonSize,
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
  ariaLabel?: string
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}
