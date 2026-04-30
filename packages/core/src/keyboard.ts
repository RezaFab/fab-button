import type { FabButtonKeyboardOrientation } from "./types"

export type FabButtonNavigationCommand = "prev" | "next" | "first" | "last" | null

interface ResolveSectionIndexOptions {
  command: Exclude<FabButtonNavigationCommand, null>
  currentIndex: number
  enabledIndices: number[]
  loop?: boolean
}

export const getEnabledSectionIndices = <T extends { disabled?: boolean }>(
  sections: T[],
  isRootDisabled = false
) => {
  if (isRootDisabled) return []
  return sections.reduce<number[]>((enabled, section, index) => {
    if (!section.disabled) enabled.push(index)
    return enabled
  }, [])
}

export const getNavigationCommand = (
  key: string,
  orientation: FabButtonKeyboardOrientation = "horizontal"
): FabButtonNavigationCommand => {
  if (key === "Home") return "first"
  if (key === "End") return "last"

  if (orientation === "horizontal") {
    if (key === "ArrowLeft") return "prev"
    if (key === "ArrowRight") return "next"
    return null
  }

  if (orientation === "vertical") {
    if (key === "ArrowUp") return "prev"
    if (key === "ArrowDown") return "next"
    return null
  }

  if (key === "ArrowLeft" || key === "ArrowUp") return "prev"
  if (key === "ArrowRight" || key === "ArrowDown") return "next"
  return null
}

export const resolveSectionIndex = ({
  command,
  currentIndex,
  enabledIndices,
  loop = true
}: ResolveSectionIndexOptions) => {
  if (!enabledIndices.length) return null
  if (command === "first") return enabledIndices[0]
  if (command === "last") return enabledIndices[enabledIndices.length - 1]

  const currentPosition = enabledIndices.indexOf(currentIndex)
  const fallbackPosition = 0
  const basePosition = currentPosition === -1 ? fallbackPosition : currentPosition

  if (command === "next") {
    const nextPosition = basePosition + 1
    if (nextPosition < enabledIndices.length) return enabledIndices[nextPosition]
    return loop ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1]
  }

  const previousPosition = basePosition - 1
  if (previousPosition >= 0) return enabledIndices[previousPosition]
  return loop ? enabledIndices[enabledIndices.length - 1] : enabledIndices[0]
}
