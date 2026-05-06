import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type AriaRole,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent
} from "react"
import {
  type FabButtonSectionAsyncState,
  getFabButtonConfig,
  getFabButtonTheme,
  getEnabledSectionIndices,
  getFabButtonClasses,
  getFabButtonCssVars,
  getShortcutSectionIndex,
  getNavigationCommand,
  getSectionShortcutHint,
  resolveSectionConfirmPrompt,
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

const AUTO_ASYNC_FEEDBACK_MS = 1600

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  Boolean(value) && typeof (value as { then?: unknown }).then === "function"

const toShortcutDataAttribute = (shortcut: FabButtonProps["sections"][number]["shortcut"]) => {
  if (shortcut === undefined) return undefined
  return Array.isArray(shortcut) ? shortcut.join(",") : `${shortcut}`
}

const toShortcutIdDataAttribute = (shortcutId: FabButtonProps["sections"][number]["shortcutId"]) => {
  if (shortcutId === undefined) return undefined
  return Array.isArray(shortcutId) ? shortcutId.join(",") : `${shortcutId}`
}

const getSectionConfirmFallbackTitle = (section: FabButtonProps["sections"][number]) => {
  if (typeof section.content === "string" || typeof section.content === "number") {
    return `${section.content}`
  }
  return section.ariaLabel || section.key
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
  overflowMode = "none",
  overflowBreakpoint = 768,
  overflowVisibleCount = 2,
  overflowMenuLabel = "More",
  onClick
}: FabButtonProps) => {
  useSyncExternalStore(subscribeFabButtonConfig, getFabButtonConfig, getFabButtonConfig)
  const confirmDialogTitleId = useId()
  const confirmDialogDescriptionId = useId()

  const normalizedSections = normalizeSections(sections ?? [])
  const hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
  const isDisabled = disabled || loading
  const toolbarMode = hasSectionActions && keyboardNavigation === "toolbar"
  const [activeIndex, setActiveIndex] = useState(-1)
  const [pendingConfirm, setPendingConfirm] = useState<
    | {
        sectionIndex: number
        title: string
        description?: string
        confirmText: string
        cancelText: string
      }
    | null
  >(null)
  const pendingConfirmBypassIndexRef = useRef<number | null>(null)
  const [runtimeAsyncStates, setRuntimeAsyncStates] = useState<Record<string, FabButtonSectionAsyncState>>({})
  const asyncResetTimersRef = useRef<Record<string, number>>({})
  const sectionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false)

  const clearAsyncResetTimer = (sectionKey: string) => {
    const timer = asyncResetTimersRef.current[sectionKey]
    if (timer === undefined) return
    globalThis.clearTimeout(timer)
    delete asyncResetTimersRef.current[sectionKey]
  }

  const getSectionAsyncState = (section: FabButtonProps["sections"][number]): FabButtonSectionAsyncState => {
    if (section.asyncState !== undefined) return section.asyncState
    return runtimeAsyncStates[section.key] ?? "idle"
  }

  const normalizeSectionWithAsyncState = (section: FabButtonProps["sections"][number]) => {
    const sectionAsyncState = getSectionAsyncState(section)
    return {
      ...section,
      disabled: section.disabled || sectionAsyncState === "loading"
    }
  }

  const sectionsForInteraction = useMemo(
    () => normalizedSections.map((section) => normalizeSectionWithAsyncState(section)),
    [normalizedSections, runtimeAsyncStates]
  )

  const safeOverflowVisibleCount = Math.max(1, Math.trunc(overflowVisibleCount))
  const sectionEntries = useMemo(
    () => normalizedSections.map((section, index) => ({ section, index })),
    [normalizedSections]
  )
  const isOverflowEnabled =
    hasSectionActions &&
    overflowMode === "more" &&
    sectionEntries.length > safeOverflowVisibleCount
  const isOverflowActive = isOverflowEnabled && isCompactViewport
  const visibleSectionEntries = useMemo(() => {
    if (!isOverflowActive) return sectionEntries
    return sectionEntries.slice(0, safeOverflowVisibleCount)
  }, [isOverflowActive, safeOverflowVisibleCount, sectionEntries])
  const overflowSectionEntries = useMemo(() => {
    if (!isOverflowActive) return []
    return sectionEntries.slice(safeOverflowVisibleCount)
  }, [isOverflowActive, safeOverflowVisibleCount, sectionEntries])
  const hiddenOverflowIndexSet = useMemo(() => {
    if (!isOverflowActive || isOverflowMenuOpen) return new Set<number>()
    return new Set(overflowSectionEntries.map((entry) => entry.index))
  }, [isOverflowActive, isOverflowMenuOpen, overflowSectionEntries])

  const enabledIndices = useMemo(
    () =>
      getEnabledSectionIndices(sectionsForInteraction, isDisabled).filter(
        (index) => !hiddenOverflowIndexSet.has(index)
      ),
    [sectionsForInteraction, isDisabled, hiddenOverflowIndexSet]
  )

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
    const validKeys = new Set(normalizedSections.map((section) => section.key))

    setRuntimeAsyncStates((previous) => {
      const next = { ...previous }
      let changed = false
      for (const key of Object.keys(next)) {
        if (validKeys.has(key)) continue
        delete next[key]
        clearAsyncResetTimer(key)
        changed = true
      }
      return changed ? next : previous
    })
  }, [normalizedSections])

  useEffect(() => {
    return () => {
      Object.keys(asyncResetTimersRef.current).forEach((sectionKey) => {
        clearAsyncResetTimer(sectionKey)
      })
    }
  }, [])

  useEffect(() => {
    if (!isOverflowEnabled) {
      setIsCompactViewport(false)
      return
    }
    if (typeof window === "undefined") return

    const syncViewport = () => {
      setIsCompactViewport(window.innerWidth <= overflowBreakpoint)
    }

    syncViewport()
    window.addEventListener("resize", syncViewport)
    return () => {
      window.removeEventListener("resize", syncViewport)
    }
  }, [isOverflowEnabled, overflowBreakpoint])

  useEffect(() => {
    if (!isOverflowActive) {
      setIsOverflowMenuOpen(false)
    }
  }, [isOverflowActive])

  useEffect(() => {
    if (!isOverflowMenuOpen) return
    if (typeof document === "undefined") return

    const onDocumentPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (rootRef.current?.contains(target)) return
      setIsOverflowMenuOpen(false)
    }

    document.addEventListener("mousedown", onDocumentPointerDown)
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown)
    }
  }, [isOverflowMenuOpen])

  useEffect(() => {
    if (!hasSectionActions) return
    if (typeof window === "undefined") return

    const onWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (pendingConfirm) {
        if (event.key === "Escape") {
          event.preventDefault()
          setPendingConfirm(null)
        }
        return
      }

      if (isOverflowMenuOpen && event.key === "Escape") {
        event.preventDefault()
        setIsOverflowMenuOpen(false)
        return
      }

      const shortcutSectionIndex = getShortcutSectionIndex(sectionsForInteraction, event, isDisabled)
      if (shortcutSectionIndex === null) return

      const shortcutSection = sectionsForInteraction[shortcutSectionIndex]
      if (!shortcutSection?.onClick) return

      const shortcutButton = sectionRefs.current[shortcutSectionIndex]
      if (!shortcutButton || shortcutButton.disabled) return

      event.preventDefault()
      if (toolbarMode) {
        setActiveIndex(shortcutSectionIndex)
      }
      if (shortcutButton.offsetParent !== null) {
        shortcutButton.focus()
      }
      shortcutButton.click()
    }

    window.addEventListener("keydown", onWindowKeyDown)
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown)
    }
  }, [sectionsForInteraction, isDisabled, hasSectionActions, toolbarMode, pendingConfirm, isOverflowMenuOpen])

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

  const handleSectionClick =
    (
      section: FabButtonProps["sections"][number],
      sectionIndex: number,
      options?: { closeOverflowMenuOnClick?: boolean }
    ) =>
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (options?.closeOverflowMenuOnClick) {
        setIsOverflowMenuOpen(false)
      }

      const sectionAsyncState = getSectionAsyncState(section)
      if (sectionAsyncState === "loading") {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (pendingConfirmBypassIndexRef.current === sectionIndex) {
        pendingConfirmBypassIndexRef.current = null
        const confirmedResult = section.onClick?.(event)
        if (section.asyncState !== undefined || !isPromiseLike(confirmedResult)) return

        clearAsyncResetTimer(section.key)
        setRuntimeAsyncStates((previous) => ({
          ...previous,
          [section.key]: "loading"
        }))

        Promise.resolve(confirmedResult)
          .then(() => {
            setRuntimeAsyncStates((previous) => ({
              ...previous,
              [section.key]: "success"
            }))
            clearAsyncResetTimer(section.key)
            const resetTimer = globalThis.setTimeout(() => {
              setRuntimeAsyncStates((previous) => {
                if (section.asyncState !== undefined) return previous
                if (previous[section.key] === undefined) return previous
                const next = { ...previous }
                delete next[section.key]
                return next
              })
              delete asyncResetTimersRef.current[section.key]
            }, section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS)
            asyncResetTimersRef.current[section.key] = Number(resetTimer)
          })
          .catch(() => {
            setRuntimeAsyncStates((previous) => ({
              ...previous,
              [section.key]: "error"
            }))
            clearAsyncResetTimer(section.key)
            const resetTimer = globalThis.setTimeout(() => {
              setRuntimeAsyncStates((previous) => {
                if (section.asyncState !== undefined) return previous
                if (previous[section.key] === undefined) return previous
                const next = { ...previous }
                delete next[section.key]
                return next
              })
              delete asyncResetTimersRef.current[section.key]
            }, section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS)
            asyncResetTimersRef.current[section.key] = Number(resetTimer)
          })
        return
      }

      const confirmPrompt = resolveSectionConfirmPrompt(section, {
        fallbackTitle: getSectionConfirmFallbackTitle(section)
      })
      if (confirmPrompt) {
        event.preventDefault()
        event.stopPropagation()
        if (options?.closeOverflowMenuOnClick) {
          setIsOverflowMenuOpen(false)
        }
        setPendingConfirm({
          sectionIndex,
          title: confirmPrompt.title,
          description: confirmPrompt.description,
          confirmText: confirmPrompt.confirmText,
          cancelText: confirmPrompt.cancelText
        })
        return
      }

      const clickResult = section.onClick?.(event)
      if (section.asyncState !== undefined || !isPromiseLike(clickResult)) return

      clearAsyncResetTimer(section.key)
      setRuntimeAsyncStates((previous) => ({
        ...previous,
        [section.key]: "loading"
      }))

      Promise.resolve(clickResult)
        .then(() => {
          setRuntimeAsyncStates((previous) => ({
            ...previous,
            [section.key]: "success"
          }))
          clearAsyncResetTimer(section.key)
          const resetTimer = globalThis.setTimeout(() => {
            setRuntimeAsyncStates((previous) => {
              if (section.asyncState !== undefined) return previous
              if (previous[section.key] === undefined) return previous
              const next = { ...previous }
              delete next[section.key]
              return next
            })
            delete asyncResetTimersRef.current[section.key]
          }, section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS)
          asyncResetTimersRef.current[section.key] = Number(resetTimer)
        })
        .catch(() => {
          setRuntimeAsyncStates((previous) => ({
            ...previous,
            [section.key]: "error"
          }))
          clearAsyncResetTimer(section.key)
          const resetTimer = globalThis.setTimeout(() => {
            setRuntimeAsyncStates((previous) => {
              if (section.asyncState !== undefined) return previous
              if (previous[section.key] === undefined) return previous
              const next = { ...previous }
              delete next[section.key]
              return next
            })
            delete asyncResetTimersRef.current[section.key]
          }, section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS)
          asyncResetTimersRef.current[section.key] = Number(resetTimer)
        })
    }

  const closeConfirmDialog = () => {
    setPendingConfirm(null)
  }

  const proceedConfirmedSectionAction = () => {
    if (!pendingConfirm) return
    const nextIndex = pendingConfirm.sectionIndex
    setPendingConfirm(null)

    const targetButton = sectionRefs.current[nextIndex]
    if (!targetButton || targetButton.disabled) return

    pendingConfirmBypassIndexRef.current = nextIndex
    targetButton.focus()
    targetButton.click()
  }

  if (hasSectionActions) {
    return (
      <>
        <div
          ref={rootRef}
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
            <>
              {visibleSectionEntries.map(({ section, index }) => {
                const sectionAsyncState = getSectionAsyncState(section)
                const sectionDisabled = isDisabled || section.disabled || sectionAsyncState === "loading"
                const sectionShortcutHint = getSectionShortcutHint(section)
                return (
                  <button
                    key={section.key}
                    ref={(node) => {
                      sectionRefs.current[index] = node
                    }}
                    type="button"
                    className={
                      unstyled
                        ? section.className
                        : getSectionClasses({
                            ...section,
                            disabled: sectionDisabled,
                            interactive: true,
                            theme: resolvedTheme
                          })
                    }
                    style={section.style}
                    disabled={sectionDisabled}
                    tabIndex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
                    aria-label={section.ariaLabel}
                    aria-busy={sectionAsyncState === "loading" ? "true" : undefined}
                    data-section={section.key}
                    data-section-index={index}
                    data-shortcut={toShortcutDataAttribute(section.shortcut)}
                    data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
                    data-shortcut-hint={sectionShortcutHint ?? undefined}
                    data-async-state={sectionAsyncState !== "idle" ? sectionAsyncState : undefined}
                    onFocus={() => {
                      if (toolbarMode) setActiveIndex(index)
                    }}
                    onClick={handleSectionClick(section, index)}
                  >
                    {section.content}
                    {!unstyled && sectionShortcutHint ? (
                      <span className="fab-button__shortcut-hint" aria-hidden="true">
                        {sectionShortcutHint}
                      </span>
                    ) : null}
                  </button>
                )
              })}
              {isOverflowActive && overflowSectionEntries.length ? (
                <div className="fab-button__overflow">
                  <button
                    type="button"
                    className={
                      unstyled
                        ? undefined
                        : getSectionClasses({
                            interactive: true,
                            theme: resolvedTheme
                          })
                    }
                    aria-haspopup="menu"
                    aria-expanded={isOverflowMenuOpen ? "true" : "false"}
                    data-overflow-trigger="true"
                    onClick={() => {
                      setIsOverflowMenuOpen((previous) => !previous)
                    }}
                  >
                    {overflowMenuLabel}
                  </button>
                  <div
                    className="fab-button__overflow-menu"
                    role="menu"
                    hidden={!isOverflowMenuOpen}
                    data-open={isOverflowMenuOpen ? "true" : "false"}
                  >
                    {overflowSectionEntries.map(({ section, index }) => {
                      const sectionAsyncState = getSectionAsyncState(section)
                      const sectionDisabled = isDisabled || section.disabled || sectionAsyncState === "loading"
                      const sectionShortcutHint = getSectionShortcutHint(section)
                      return (
                        <button
                          key={section.key}
                          ref={(node) => {
                            sectionRefs.current[index] = node
                          }}
                          type="button"
                          role="menuitem"
                          className={
                            unstyled
                              ? section.className
                              : getSectionClasses({
                                  ...section,
                                  disabled: sectionDisabled,
                                  interactive: true,
                                  theme: resolvedTheme
                                })
                          }
                          style={section.style}
                          disabled={sectionDisabled}
                          tabIndex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
                          aria-label={section.ariaLabel}
                          aria-busy={sectionAsyncState === "loading" ? "true" : undefined}
                          data-section={section.key}
                          data-section-index={index}
                          data-shortcut={toShortcutDataAttribute(section.shortcut)}
                          data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
                          data-shortcut-hint={sectionShortcutHint ?? undefined}
                          data-async-state={sectionAsyncState !== "idle" ? sectionAsyncState : undefined}
                          data-overflow-item="true"
                          onFocus={() => {
                            if (toolbarMode) setActiveIndex(index)
                          }}
                          onClick={handleSectionClick(section, index, { closeOverflowMenuOnClick: true })}
                        >
                          {section.content}
                          {!unstyled && sectionShortcutHint ? (
                            <span className="fab-button__shortcut-hint" aria-hidden="true">
                              {sectionShortcutHint}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
        {pendingConfirm ? (
          <div
            className="fab-button-confirm__backdrop"
            data-theme={resolvedTheme}
            role="presentation"
            onClick={closeConfirmDialog}
          >
            <div
              className="fab-button-confirm"
              role="dialog"
              aria-modal="true"
              aria-labelledby={confirmDialogTitleId}
              aria-describedby={pendingConfirm.description ? confirmDialogDescriptionId : undefined}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <h3 id={confirmDialogTitleId} className="fab-button-confirm__title">
                {pendingConfirm.title}
              </h3>
              {pendingConfirm.description ? (
                <p id={confirmDialogDescriptionId} className="fab-button-confirm__description">
                  {pendingConfirm.description}
                </p>
              ) : null}
              <div className="fab-button-confirm__actions">
                <button
                  type="button"
                  className="fab-button-confirm__button fab-button-confirm__button--cancel"
                  onClick={closeConfirmDialog}
                >
                  {pendingConfirm.cancelText}
                </button>
                <button
                  type="button"
                  className="fab-button-confirm__button fab-button-confirm__button--confirm"
                  onClick={proceedConfirmedSectionAction}
                >
                  {pendingConfirm.confirmText}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
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
        normalizedSections.map((section) => {
          const sectionShortcutHint = getSectionShortcutHint(section)
          return (
            <span
              key={section.key}
              className={unstyled ? section.className : getSectionClasses({ ...section, theme: resolvedTheme })}
              style={section.style}
              data-section={section.key}
              data-shortcut={toShortcutDataAttribute(section.shortcut)}
              data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
              data-shortcut-hint={sectionShortcutHint ?? undefined}
              aria-label={section.ariaLabel}
            >
              {section.content}
              {!unstyled && sectionShortcutHint ? (
                <span className="fab-button__shortcut-hint" aria-hidden="true">
                  {sectionShortcutHint}
                </span>
              ) : null}
            </span>
          )
        })
      )}
    </button>
  )
}
