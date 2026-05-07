<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from "svelte"
  import {
    type FabButtonSectionActionSource,
    type FabButtonSectionAsyncState,
    getEnabledSectionIndices,
    getFabButtonTheme,
    getFabButtonClasses,
    getFabButtonCssVars,
    getShortcutSectionIndex,
    getNavigationCommand,
    getSectionShortcutHint,
    resolveSectionConfirmPrompt,
    resolveSectionIndex,
    getSectionClasses,
    subscribeFabButtonConfig,
    normalizeSections,
    isSectionVisible,
    isSectionDisabled
  } from "@rezafab/fab-button-core"
  import type { FabButtonProps, FabButtonSection } from "./types"

  import "@rezafab/fab-button-styles/style.css"

  const AUTO_ASYNC_FEEDBACK_MS = 1600
  const KEYBOARD_ACTIVATION_KEYS = new Set(["Enter", " ", "Spacebar"])

  const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
    Boolean(value) && typeof (value as { then?: unknown }).then === "function"

  export let sections: FabButtonSection[] = []
  export let variant: NonNullable<FabButtonProps["variant"]> = "default"
  export let size: NonNullable<FabButtonProps["size"]> = "md"
  export let shape: NonNullable<FabButtonProps["shape"]> = "rounded"
  export let layout: NonNullable<FabButtonProps["layout"]> = "flex"
  export let columns: FabButtonProps["columns"] = undefined
  export let rows: FabButtonProps["rows"] = undefined
  export let gap: FabButtonProps["gap"] = undefined
  export let className: FabButtonProps["className"] = undefined
  export let style: FabButtonProps["style"] = undefined
  export let unstyled = false
  export let disabled = false
  export let loading = false
  export let theme: FabButtonProps["theme"] = undefined
  export let ariaLabel: FabButtonProps["ariaLabel"] = undefined
  export let keyboardNavigation: NonNullable<FabButtonProps["keyboardNavigation"]> = "tab"
  export let keyboardOrientation: FabButtonProps["keyboardOrientation"] = undefined
  export let loopNavigation = true
  export let overflowMode: NonNullable<FabButtonProps["overflowMode"]> = "none"
  export let actionPreset: NonNullable<FabButtonProps["actionPreset"]> = "default"
  export let splitButtonMenuLabel = "\u25BE"
  export let splitButtonTriggerSide: NonNullable<FabButtonProps["splitButtonTriggerSide"]> = "right"
  export let overflowBreakpoint = 768
  export let overflowVisibleCount = 2
  export let overflowMenuLabel = "More"
  export let onSectionAction: FabButtonProps["onSectionAction"] = undefined
  export let onClick: FabButtonProps["onClick"] = undefined

  const dispatch = createEventDispatcher<{
    click: MouseEvent
    sectionClick: { key: string; event: MouseEvent }
    sectionAction: { key: string; index: number; source: FabButtonSectionActionSource }
  }>()

  const toStyleString = (vars: Record<string, string>) =>
    Object.entries(vars)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ")

  const toShortcutDataAttribute = (shortcut: FabButtonSection["shortcut"]) => {
    if (shortcut === undefined) return undefined
    return Array.isArray(shortcut) ? shortcut.join(",") : `${shortcut}`
  }

  const toShortcutIdDataAttribute = (shortcutId: FabButtonSection["shortcutId"]) => {
    if (shortcutId === undefined) return undefined
    return Array.isArray(shortcutId) ? shortcutId.join(",") : `${shortcutId}`
  }

  let activeIndex = -1
  let pendingConfirm:
    | {
        sectionIndex: number
        source: FabButtonSectionActionSource
        title: string
        description?: string
        confirmText: string
        cancelText: string
      }
    | null = null
  let pendingConfirmBypassIndex: number | null = null
  let pendingSectionActionSource:
    | { sectionIndex: number; source: FabButtonSectionActionSource }
    | null = null
  let runtimeAsyncStates: Record<string, FabButtonSectionAsyncState> = {}
  const asyncResetTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()
  let styleConfigVersion = 0
  let sectionRefs: Array<HTMLButtonElement | null> = []
  let rootRef: HTMLDivElement | null = null
  let isCompactViewport = false
  let overflowMenuOpen = false
  let splitPrimarySectionKey: string | null = null
  const unsubscribeConfig = subscribeFabButtonConfig(() => {
    styleConfigVersion += 1
  })

  onDestroy(() => {
    Array.from(asyncResetTimers.keys()).forEach((sectionKey) => {
      const timer = asyncResetTimers.get(sectionKey)
      if (!timer) return
      globalThis.clearTimeout(timer)
      asyncResetTimers.delete(sectionKey)
    })
    unsubscribeConfig()
  })

  $: normalizedSections = normalizeSections(sections ?? [])
  $: resolvedSections = normalizedSections
    .filter((section) => isSectionVisible(section))
    .map((section) => ({
      ...section,
      disabled: isSectionDisabled(section)
    }))
  $: {
    const validKeys = new Set(resolvedSections.map((section) => section.key))
    const nextState: Record<string, FabButtonSectionAsyncState> = {}
    let changed = false

    for (const [sectionKey, sectionState] of Object.entries(runtimeAsyncStates)) {
      if (!validKeys.has(sectionKey)) {
        const timer = asyncResetTimers.get(sectionKey)
        if (timer) {
          globalThis.clearTimeout(timer)
          asyncResetTimers.delete(sectionKey)
        }
        changed = true
        continue
      }
      nextState[sectionKey] = sectionState
    }

    if (changed || Object.keys(nextState).length !== Object.keys(runtimeAsyncStates).length) {
      runtimeAsyncStates = nextState
    }
  }

  const getSectionAsyncState = (section: FabButtonSection): FabButtonSectionAsyncState => {
    if (section.asyncState !== undefined) return section.asyncState
    return runtimeAsyncStates[section.key] ?? "idle"
  }

  const clearAsyncResetTimer = (sectionKey: string) => {
    const timer = asyncResetTimers.get(sectionKey)
    if (!timer) return
    globalThis.clearTimeout(timer)
    asyncResetTimers.delete(sectionKey)
  }

  const scheduleAsyncStateReset = (section: FabButtonSection) => {
    clearAsyncResetTimer(section.key)
    const timer = globalThis.setTimeout(() => {
      if (section.asyncState !== undefined) return
      if (runtimeAsyncStates[section.key] === undefined) return
      const nextState = { ...runtimeAsyncStates }
      delete nextState[section.key]
      runtimeAsyncStates = nextState
      asyncResetTimers.delete(section.key)
    }, section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS)
    asyncResetTimers.set(section.key, timer)
  }

  const startAsyncSectionAction = (section: FabButtonSection, result: unknown) => {
    if (section.asyncState !== undefined) return
    if (!isPromiseLike(result)) return

    clearAsyncResetTimer(section.key)
    runtimeAsyncStates = { ...runtimeAsyncStates, [section.key]: "loading" }

    Promise.resolve(result)
      .then(() => {
        runtimeAsyncStates = { ...runtimeAsyncStates, [section.key]: "success" }
        scheduleAsyncStateReset(section)
      })
      .catch(() => {
        runtimeAsyncStates = { ...runtimeAsyncStates, [section.key]: "error" }
        scheduleAsyncStateReset(section)
      })
  }

  const setPendingSectionActionSource = (
    sectionIndex: number,
    source: FabButtonSectionActionSource
  ) => {
    pendingSectionActionSource = { sectionIndex, source }
  }

  const resolveSectionActionSource = (
    sectionIndex: number,
    event: MouseEvent
  ): FabButtonSectionActionSource => {
    if (pendingSectionActionSource && pendingSectionActionSource.sectionIndex === sectionIndex) {
      const source = pendingSectionActionSource.source
      pendingSectionActionSource = null
      return source
    }
    return event.detail === 0 ? "keyboard-nav" : "click"
  }

  $: hasSectionActions = resolvedSections.some((section) => Boolean(section.onClick))
  $: isDisabled = disabled || loading
  $: toolbarMode = hasSectionActions && keyboardNavigation === "toolbar"
  $: resolvedKeyboardOrientation = keyboardOrientation ?? (layout === "grid" ? "both" : "horizontal")
  $: safeOverflowVisibleCount = Math.max(1, Math.trunc(overflowVisibleCount))
  $: sectionEntries = resolvedSections.map((section, index) => ({ section, index }))
  $: isSplitButtonEnabled = hasSectionActions && actionPreset === "split" && sectionEntries.length > 1
  $: splitPrimarySectionEntry =
    !isSplitButtonEnabled
      ? null
      : splitPrimarySectionKey === null
        ? sectionEntries[0] ?? null
        : sectionEntries.find((entry) => entry.section.key === splitPrimarySectionKey) ??
          sectionEntries[0] ??
          null
  $: if (!isSplitButtonEnabled) {
    splitPrimarySectionKey = null
  } else if (splitPrimarySectionEntry) {
    splitPrimarySectionKey = splitPrimarySectionEntry.section.key
  }
  $: isOverflowEnabled =
    !isSplitButtonEnabled &&
    hasSectionActions &&
    overflowMode === "more" &&
    sectionEntries.length > safeOverflowVisibleCount
  $: isOverflowActive = isOverflowEnabled && isCompactViewport
  $: isCollapsibleMenuActive = isSplitButtonEnabled || isOverflowActive
  $: visibleSectionEntries = isSplitButtonEnabled
    ? splitPrimarySectionEntry
      ? [splitPrimarySectionEntry]
      : []
    : isOverflowActive
      ? sectionEntries.slice(0, safeOverflowVisibleCount)
      : sectionEntries
  $: overflowSectionEntries = isSplitButtonEnabled
    ? splitPrimarySectionEntry
      ? sectionEntries.filter((entry) => entry.section.key !== splitPrimarySectionEntry.section.key)
      : []
    : isOverflowActive
      ? sectionEntries.slice(safeOverflowVisibleCount)
      : []
  $: if (typeof window !== "undefined") {
    isCompactViewport = isOverflowEnabled ? window.innerWidth <= overflowBreakpoint : false
  }
  $: hiddenOverflowIndexSet =
    isCollapsibleMenuActive && !overflowMenuOpen
      ? new Set(overflowSectionEntries.map((entry) => entry.index))
      : new Set()
  $: sectionsForInteraction = resolvedSections.map((section) => {
    const sectionAsyncState = getSectionAsyncState(section)
    return {
      ...section,
      disabled: section.disabled || sectionAsyncState === "loading"
    }
  })
  $: enabledIndices = getEnabledSectionIndices(sectionsForInteraction, isDisabled).filter(
    (index) => !hiddenOverflowIndexSet.has(index)
  )
  $: if (!isCollapsibleMenuActive) {
    overflowMenuOpen = false
  }
  $: if (toolbarMode) {
    if (!enabledIndices.length) {
      activeIndex = -1
    } else if (!enabledIndices.includes(activeIndex)) {
      activeIndex = enabledIndices[0]
    }
  }
  $: styleVars = getFabButtonCssVars({ columns, rows, gap })
  $: resolvedTheme = theme ?? getFabButtonTheme()
  $: rootClassName = unstyled
    ? (styleConfigVersion, className)
    : (styleConfigVersion,
      getFabButtonClasses({
        className,
        layout,
        size,
        shape,
        variant,
        theme: resolvedTheme,
        disabled: isDisabled,
        loading
      }))
  $: rootStyle = [toStyleString(styleVars), style].filter(Boolean).join("; ")

  const handleRootClick = (event: MouseEvent) => {
    onClick?.(event)
    dispatch("click", event)
  }

  const handleSectionClick = (
    section: FabButtonSection,
    sectionIndex: number,
    event: MouseEvent,
    options?: { closeOverflowMenuOnClick?: boolean }
  ) => {
    const sectionActionSource = resolveSectionActionSource(sectionIndex, event)

    if (options?.closeOverflowMenuOnClick) {
      overflowMenuOpen = false
    }

    const sectionAsyncState = getSectionAsyncState(section)
    if (sectionAsyncState === "loading") {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (pendingConfirmBypassIndex === sectionIndex) {
      pendingConfirmBypassIndex = null
      if (isSplitButtonEnabled && section.onClick) {
        splitPrimarySectionKey = section.key
      }
      const confirmedResult = section.onClick?.(event)
      if (section.onClick) {
        const meta = { key: section.key, index: sectionIndex, source: sectionActionSource }
        onSectionAction?.(meta)
        dispatch("sectionAction", meta)
      }
      startAsyncSectionAction(section, confirmedResult)
      dispatch("sectionClick", { key: section.key, event })
      return
    }

    const fallbackTitle =
      typeof section.content === "string" || typeof section.content === "number"
        ? `${section.content}`
        : section.ariaLabel || section.key
    const confirmPrompt = resolveSectionConfirmPrompt(section, { fallbackTitle })
    if (confirmPrompt) {
      event.preventDefault()
      event.stopPropagation()
      overflowMenuOpen = false
      pendingConfirm = {
        sectionIndex,
        source: sectionActionSource,
        title: confirmPrompt.title,
        description: confirmPrompt.description,
        confirmText: confirmPrompt.confirmText,
        cancelText: confirmPrompt.cancelText
      }
      return
    }

    const clickResult = section.onClick?.(event)
    if (isSplitButtonEnabled && section.onClick) {
      splitPrimarySectionKey = section.key
    }
    if (section.onClick) {
      const meta = { key: section.key, index: sectionIndex, source: sectionActionSource }
      onSectionAction?.(meta)
      dispatch("sectionAction", meta)
    }
    startAsyncSectionAction(section, clickResult)
    dispatch("sectionClick", { key: section.key, event })
  }

  const closeConfirmDialog = () => {
    pendingSectionActionSource = null
    pendingConfirm = null
  }

  const proceedConfirmedSectionAction = () => {
    if (!pendingConfirm) return

    const nextIndex = pendingConfirm.sectionIndex
    const nextSource = pendingConfirm.source
    pendingConfirm = null
    const targetButton = sectionRefs[nextIndex]
    if (!targetButton || targetButton.disabled) return

    pendingConfirmBypassIndex = nextIndex
    targetButton.focus()
    setPendingSectionActionSource(nextIndex, nextSource)
    targetButton.click()
  }

  const focusSection = async (index: number) => {
    await tick()
    sectionRefs[index]?.focus()
  }

  const registerSection = (node: HTMLButtonElement, index: number) => {
    sectionRefs[index] = node
    return {
      destroy: () => {
        if (sectionRefs[index] === node) sectionRefs[index] = null
      }
    }
  }

  const handleToolbarKeydown = (event: KeyboardEvent) => {
    if (!toolbarMode || !enabledIndices.length) return

    const target = event.target as HTMLElement | null
    const sectionButton = target?.closest<HTMLButtonElement>("button[data-section-index]")
    if (!sectionButton) return

    const indexValue = Number(sectionButton.dataset.sectionIndex)
    const currentIndex = Number.isNaN(indexValue) ? activeIndex : indexValue

    if (KEYBOARD_ACTIVATION_KEYS.has(event.key)) {
      event.preventDefault()
      setPendingSectionActionSource(currentIndex, "keyboard-nav")
      sectionButton.click()
      return
    }

    const command = getNavigationCommand(event.key, resolvedKeyboardOrientation)
    if (!command) return

    const nextIndex = resolveSectionIndex({
      command,
      currentIndex,
      enabledIndices,
      loop: loopNavigation
    })
    if (nextIndex === null) return

    event.preventDefault()
    activeIndex = nextIndex
    focusSection(nextIndex)
  }

  const handleWindowShortcutKeydown = (event: KeyboardEvent) => {
    if (!hasSectionActions) return
    if (pendingConfirm) {
      if (event.key === "Escape") {
        event.preventDefault()
        pendingSectionActionSource = null
        pendingConfirm = null
      }
      return
    }

    if (overflowMenuOpen && event.key === "Escape") {
      event.preventDefault()
      overflowMenuOpen = false
      return
    }

    const shortcutSectionIndex = getShortcutSectionIndex(sectionsForInteraction, event, isDisabled)
    if (shortcutSectionIndex === null) return

    const shortcutSection = sectionsForInteraction[shortcutSectionIndex]
    if (!shortcutSection?.onClick) return

    const shortcutButton = sectionRefs[shortcutSectionIndex]
    if (!shortcutButton || shortcutButton.disabled) return

    event.preventDefault()
    if (toolbarMode) {
      activeIndex = shortcutSectionIndex
    }
    if (shortcutButton.offsetParent !== null) {
      shortcutButton.focus()
    }
    setPendingSectionActionSource(shortcutSectionIndex, "shortcut")
    shortcutButton.click()
  }

  onMount(() => {
    if (typeof window === "undefined") return undefined

    const syncViewportCompactState = () => {
      if (!isOverflowEnabled) {
        isCompactViewport = false
        return
      }
      isCompactViewport = window.innerWidth <= overflowBreakpoint
    }

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!overflowMenuOpen) return
      const target = event.target as Node | null
      if (!target) return
      if (rootRef?.contains(target)) return
      overflowMenuOpen = false
    }

    syncViewportCompactState()
    window.addEventListener("keydown", handleWindowShortcutKeydown)
    window.addEventListener("resize", syncViewportCompactState)
    document.addEventListener("mousedown", handleDocumentMouseDown)
    return () => {
      window.removeEventListener("keydown", handleWindowShortcutKeydown)
      window.removeEventListener("resize", syncViewportCompactState)
      document.removeEventListener("mousedown", handleDocumentMouseDown)
    }
  })
</script>

{#if hasSectionActions}
  <div
    bind:this={rootRef}
    class={rootClassName}
    style={rootStyle}
    role={toolbarMode ? "toolbar" : "group"}
    aria-label={ariaLabel}
    aria-orientation={toolbarMode && resolvedKeyboardOrientation !== "both"
      ? resolvedKeyboardOrientation
      : undefined}
    aria-busy={loading || undefined}
    aria-disabled={isDisabled || undefined}
    data-layout={layout}
    data-variant={variant}
    data-size={size}
    data-shape={shape}
    data-theme={resolvedTheme}
    data-action-preset={actionPreset}
    data-split-trigger-side={splitButtonTriggerSide}
    data-disabled={isDisabled || undefined}
    on:keydown={handleToolbarKeydown}
  >
    {#if loading}
      <span class={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })} aria-live="polite" role="status">
        Loading...
      </span>
    {:else}
      {#each visibleSectionEntries as entry (entry.section.key)}
        {@const section = entry.section}
        {@const index = entry.index}
        {@const sectionAsyncState = getSectionAsyncState(section)}
        {@const sectionShortcutHint = getSectionShortcutHint(section)}
        <button
          use:registerSection={index}
          type="button"
          class={unstyled
            ? section.className
            : getSectionClasses({
                ...section,
                disabled: isDisabled || section.disabled || sectionAsyncState === "loading",
                interactive: true,
                theme: resolvedTheme
              })}
          style={section.style}
          disabled={isDisabled || section.disabled || sectionAsyncState === "loading"}
          tabindex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
          aria-label={section.ariaLabel}
          aria-busy={sectionAsyncState === "loading" ? "true" : undefined}
          data-section={section.key}
          data-section-index={index}
          data-shortcut={toShortcutDataAttribute(section.shortcut)}
          data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
          data-shortcut-hint={sectionShortcutHint ?? undefined}
          data-async-state={sectionAsyncState !== "idle" ? sectionAsyncState : undefined}
          data-split-primary={isSplitButtonEnabled &&
          splitPrimarySectionEntry &&
          splitPrimarySectionEntry.section.key === section.key
            ? "true"
            : undefined}
          on:focus={() => {
            if (toolbarMode) activeIndex = index
          }}
          on:click={(event) => handleSectionClick(section, index, event)}
        >
          {section.content}
          {#if !unstyled && sectionShortcutHint}
            <span class="fab-button__shortcut-hint" aria-hidden="true">{sectionShortcutHint}</span>
          {/if}
        </button>
      {/each}
      {#if isCollapsibleMenuActive && overflowSectionEntries.length}
        <div class="fab-button__overflow" data-split={isSplitButtonEnabled ? "true" : undefined}>
          <button
            type="button"
            class={unstyled
              ? undefined
              : getSectionClasses({
                  interactive: true,
                  theme: resolvedTheme
                })}
            aria-haspopup="menu"
            aria-expanded={overflowMenuOpen ? "true" : "false"}
            aria-label={isSplitButtonEnabled ? "More actions" : undefined}
            data-overflow-trigger="true"
            data-split-trigger={isSplitButtonEnabled ? "true" : undefined}
            on:click={() => {
              overflowMenuOpen = !overflowMenuOpen
            }}
          >
            {#if isSplitButtonEnabled}
              <span class="fab-button__split-trigger-icon" aria-hidden="true">{splitButtonMenuLabel}</span>
            {:else}
              {overflowMenuLabel}
            {/if}
          </button>
          <div class="fab-button__overflow-menu" role="menu" hidden={!overflowMenuOpen} data-open={overflowMenuOpen ? "true" : "false"}>
            {#each overflowSectionEntries as entry (entry.section.key)}
              {@const section = entry.section}
              {@const index = entry.index}
              {@const sectionAsyncState = getSectionAsyncState(section)}
              {@const sectionShortcutHint = getSectionShortcutHint(section)}
              <button
                use:registerSection={index}
                type="button"
                role="menuitem"
                class={unstyled
                  ? section.className
                  : getSectionClasses({
                      ...section,
                      disabled: isDisabled || section.disabled || sectionAsyncState === "loading",
                      interactive: true,
                      theme: resolvedTheme
                    })}
                style={section.style}
                disabled={isDisabled || section.disabled || sectionAsyncState === "loading"}
                tabindex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
                aria-label={section.ariaLabel}
                aria-busy={sectionAsyncState === "loading" ? "true" : undefined}
                data-section={section.key}
                data-section-index={index}
                data-shortcut={toShortcutDataAttribute(section.shortcut)}
                data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
                data-shortcut-hint={sectionShortcutHint ?? undefined}
                data-async-state={sectionAsyncState !== "idle" ? sectionAsyncState : undefined}
                data-overflow-item="true"
                on:focus={() => {
                  if (toolbarMode) activeIndex = index
                }}
                on:click={(event) => handleSectionClick(section, index, event, { closeOverflowMenuOnClick: true })}
              >
                {section.content}
                {#if !unstyled && sectionShortcutHint}
                  <span class="fab-button__shortcut-hint" aria-hidden="true">{sectionShortcutHint}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>

  {#if pendingConfirm}
    <div
      class="fab-button-confirm__backdrop"
      data-theme={resolvedTheme}
      role="presentation"
      on:click={(event) => {
        if (event.target !== event.currentTarget) return
        closeConfirmDialog()
      }}
    >
      <div
        class="fab-button-confirm"
        role="dialog"
        aria-modal="true"
        aria-label={pendingConfirm.title}
      >
        <h3 class="fab-button-confirm__title">{pendingConfirm.title}</h3>
        {#if pendingConfirm.description}
          <p class="fab-button-confirm__description">{pendingConfirm.description}</p>
        {/if}
        <div class="fab-button-confirm__actions">
          <button
            type="button"
            class="fab-button-confirm__button fab-button-confirm__button--cancel"
            on:click={closeConfirmDialog}
          >
            {pendingConfirm.cancelText}
          </button>
          <button
            type="button"
            class="fab-button-confirm__button fab-button-confirm__button--confirm"
            on:click={proceedConfirmedSectionAction}
          >
            {pendingConfirm.confirmText}
          </button>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <button
    type="button"
    class={rootClassName}
    style={rootStyle}
    aria-label={ariaLabel}
    aria-busy={loading || undefined}
    disabled={isDisabled}
    data-layout={layout}
    data-variant={variant}
    data-size={size}
    data-shape={shape}
    data-theme={resolvedTheme}
    data-action-preset={actionPreset}
    data-split-trigger-side={splitButtonTriggerSide}
    data-disabled={isDisabled || undefined}
    on:click={handleRootClick}
  >
    {#if loading}
      <span class={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })} aria-live="polite" role="status">
        Loading...
      </span>
    {:else}
      {#each resolvedSections as section (section.key)}
        {@const sectionShortcutHint = getSectionShortcutHint(section)}
        <span
          class={unstyled ? section.className : getSectionClasses({ ...section, theme: resolvedTheme })}
          style={section.style}
          data-section={section.key}
          data-shortcut={toShortcutDataAttribute(section.shortcut)}
          data-shortcut-id={toShortcutIdDataAttribute(section.shortcutId)}
          data-shortcut-hint={sectionShortcutHint ?? undefined}
          aria-label={section.ariaLabel}
        >
          {section.content}
          {#if !unstyled && sectionShortcutHint}
            <span class="fab-button__shortcut-hint" aria-hidden="true">{sectionShortcutHint}</span>
          {/if}
        </span>
      {/each}
    {/if}
  </button>
{/if}
