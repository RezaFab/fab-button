import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type AriaRole,
  type KeyboardEvent as ReactKeyboardEvent
} from "react"
import {
  getFabButtonConfig,
  getFabButtonTheme,
  getEnabledSectionIndices,
  getFabButtonClasses,
  getFabButtonCssVars,
  getShortcutSectionIndex,
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

const toShortcutDataAttribute = (shortcut: FabButtonProps["sections"][number]["shortcut"]) => {
  if (shortcut === undefined) return undefined
  return Array.isArray(shortcut) ? shortcut.join(",") : `${shortcut}`
}

const toShortcutIdDataAttribute = (shortcutId: FabButtonProps["sections"][number]["shortcutId"]) => {
  if (shortcutId === undefined) return undefined
  return Array.isArray(shortcutId) ? shortcutId.join(",") : `${shortcutId}`
}

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

  useEffect(() => {
    if (!hasSectionActions) return
    if (typeof window === "undefined") return

    const onWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      const shortcutSectionIndex = getShortcutSectionIndex(normalizedSections, event, isDisabled)
      if (shortcutSectionIndex === null) return

      const shortcutSection = normalizedSections[shortcutSectionIndex]
      if (!shortcutSection?.onClick) return

      const shortcutButton = sectionRefs.current[shortcutSectionIndex]
      if (!shortcutButton || shortcutButton.disabled) return

      event.preventDefault()
      if (toolbarMode) {
        setActiveIndex(shortcutSectionIndex)
      }
      shortcutButton.focus()
      shortcutButton.click()
    }

    window.addEventListener("keydown", onWindowKeyDown)
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown)
    }
  }, [normalizedSections, isDisabled, hasSectionActions, toolbarMode])

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
  const rootRole: AriaRole = toolbarMode ? "toolbar" : "group"
  const rootAriaOrientation =
    toolbarMode && keyboardOrientation !== "both" ? keyboardOrientation : undefined
  const rootAriaBusy = loading ? "true" : undefined
  const rootAriaDisabled = isDisabled ? "true" : undefined

  const handleToolbarKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
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
        role={rootRole}
        aria-label={ariaLabel}
        aria-orientation={rootAriaOrientation}
        aria-busy={rootAriaBusy}
        aria-disabled={rootAriaDisabled}
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
              data-shortcut={toShortcutDataAttribute(section.shortcut)}
              data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
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
      aria-busy={rootAriaBusy}
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
            data-shortcut={toShortcutDataAttribute(section.shortcut)}
            data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
            aria-label={section.ariaLabel}
          >
            {section.content}
          </span>
        ))
      )}
    </button>
  )
}
