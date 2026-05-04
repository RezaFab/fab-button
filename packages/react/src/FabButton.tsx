import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent
} from "react"
import {
  getFabButtonConfig,
  getFabButtonTheme,
  getEnabledSectionIndices,
  getFabButtonClasses,
  getFabButtonCssVars,
  getNavigationCommand,
  resolveSectionIndex,
  getSectionClasses,
  subscribeFabButtonConfig,
  normalizeSections
} from "@rezafab/fab-button-core"
import type { FabButtonProps } from "./types"

import "@rezafab/fab-button-styles/style.css"

const mergeStyles = (base: CSSProperties, override?: CSSProperties): CSSProperties => ({
  ...base,
  ...override
})

export const FabButton = ({
  sections,
  variant = "default",
  size = "md",
  shape = "rounded",
  layout = "flex",
  columns,
  rows,
  gap,
  className,
  style,
  unstyled = false,
  disabled = false,
  loading = false,
  theme,
  ariaLabel,
  keyboardNavigation = "tab",
  keyboardOrientation = layout === "grid" ? "both" : "horizontal",
  loopNavigation = true,
  onClick
}: FabButtonProps) => {
  useSyncExternalStore(subscribeFabButtonConfig, getFabButtonConfig, getFabButtonConfig)

  const normalizedSections = normalizeSections(sections ?? [])
  const hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
  const isDisabled = disabled || loading
  const toolbarMode = hasSectionActions && keyboardNavigation === "toolbar"
  const enabledIndices = useMemo(
    () => getEnabledSectionIndices(normalizedSections, isDisabled),
    [normalizedSections, isDisabled]
  )
  const [activeIndex, setActiveIndex] = useState(enabledIndices[0] ?? -1)
  const sectionRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!toolbarMode) return
    if (!enabledIndices.length) {
      setActiveIndex(-1)
      return
    }
    if (!enabledIndices.includes(activeIndex)) {
      setActiveIndex(enabledIndices[0])
    }
  }, [activeIndex, enabledIndices, toolbarMode])

  const styleVars = getFabButtonCssVars({
    columns,
    rows,
    gap
  }) as CSSProperties
  const resolvedTheme = theme ?? getFabButtonTheme()
  const rootClassName = unstyled
    ? className
    : getFabButtonClasses({
        className,
        layout,
        size,
        shape,
        variant,
        theme: resolvedTheme,
        disabled: isDisabled,
        loading
      })
  const rootStyle = mergeStyles(styleVars, style)

  const handleToolbarKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!toolbarMode || !enabledIndices.length) return
    const command = getNavigationCommand(event.key, keyboardOrientation)
    if (!command) return

    const target = event.target as HTMLElement | null
    const sectionButton = target?.closest<HTMLButtonElement>("button[data-section-index]")
    if (!sectionButton) return

    const indexValue = Number(sectionButton.dataset.sectionIndex)
    const currentIndex = Number.isNaN(indexValue) ? activeIndex : indexValue
    const nextIndex = resolveSectionIndex({
      command,
      currentIndex,
      enabledIndices,
      loop: loopNavigation
    })
    if (nextIndex === null) return

    event.preventDefault()
    setActiveIndex(nextIndex)
    sectionRefs.current[nextIndex]?.focus()
  }

  if (hasSectionActions) {
    return (
      <div
        className={rootClassName}
        style={rootStyle}
        role={toolbarMode ? "toolbar" : "group"}
        aria-label={ariaLabel}
        aria-orientation={toolbarMode && keyboardOrientation !== "both" ? keyboardOrientation : undefined}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        data-layout={layout}
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-theme={resolvedTheme}
        data-disabled={isDisabled || undefined}
        onKeyDown={handleToolbarKeyDown}
      >
        {loading ? (
          <span
            className={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })}
            aria-live="polite"
            role="status"
          >
            Loading...
          </span>
        ) : (
          normalizedSections.map((section, index) => (
            <button
              key={section.key}
              ref={(node) => {
                sectionRefs.current[index] = node
              }}
              type="button"
              className={
                unstyled
                  ? section.className
                  : getSectionClasses({ ...section, interactive: true, theme: resolvedTheme })
              }
              style={section.style}
              disabled={isDisabled || section.disabled}
              tabIndex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
              aria-label={section.ariaLabel}
              data-section={section.key}
              data-section-index={index}
              onFocus={() => {
                if (toolbarMode) setActiveIndex(index)
              }}
              onClick={section.onClick}
            >
              {section.content}
            </button>
          ))
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={rootClassName}
      style={rootStyle}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      data-layout={layout}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-theme={resolvedTheme}
      data-disabled={isDisabled || undefined}
      onClick={onClick}
    >
      {loading ? (
        <span
          className={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })}
          aria-live="polite"
          role="status"
        >
          Loading...
        </span>
      ) : (
        normalizedSections.map((section) => (
          <span
            key={section.key}
            className={unstyled ? section.className : getSectionClasses({ ...section, theme: resolvedTheme })}
            style={section.style}
            data-section={section.key}
            aria-label={section.ariaLabel}
          >
            {section.content}
          </span>
        ))
      )}
    </button>
  )
}
