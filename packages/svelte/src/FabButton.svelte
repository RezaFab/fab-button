<script lang="ts">
  import { createEventDispatcher, onDestroy, tick } from "svelte"
  import {
    getEnabledSectionIndices,
    getFabButtonTheme,
    getFabButtonClasses,
    getFabButtonCssVars,
    getNavigationCommand,
    resolveSectionIndex,
    getSectionClasses,
    subscribeFabButtonConfig,
    normalizeSections
  } from "@rezafab/fab-button-core"
  import type { FabButtonProps, FabButtonSection } from "./types"

  import "@rezafab/fab-button-styles/style.css"

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
  export let onClick: FabButtonProps["onClick"] = undefined

  const dispatch = createEventDispatcher<{
    click: MouseEvent
    sectionClick: { key: string; event: MouseEvent }
  }>()

  const toStyleString = (vars: Record<string, string>) =>
    Object.entries(vars)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ")

  let activeIndex = -1
  let styleConfigVersion = 0
  let sectionRefs: Array<HTMLButtonElement | null> = []
  const unsubscribeConfig = subscribeFabButtonConfig(() => {
    styleConfigVersion += 1
  })

  onDestroy(() => {
    unsubscribeConfig()
  })

  $: normalizedSections = normalizeSections(sections ?? [])
  $: hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
  $: isDisabled = disabled || loading
  $: toolbarMode = hasSectionActions && keyboardNavigation === "toolbar"
  $: resolvedKeyboardOrientation = keyboardOrientation ?? (layout === "grid" ? "both" : "horizontal")
  $: enabledIndices = getEnabledSectionIndices(normalizedSections, isDisabled)
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

  const handleSectionClick = (section: FabButtonSection, event: MouseEvent) => {
    section.onClick?.(event)
    dispatch("sectionClick", { key: section.key, event })
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

    const command = getNavigationCommand(event.key, resolvedKeyboardOrientation)
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
    activeIndex = nextIndex
    focusSection(nextIndex)
  }
</script>

{#if hasSectionActions}
  <div
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
    data-disabled={isDisabled || undefined}
    on:keydown={handleToolbarKeydown}
  >
    {#if loading}
      <span class={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })} aria-live="polite" role="status">
        Loading...
      </span>
    {:else}
      {#each normalizedSections as section, index (section.key)}
        <button
          use:registerSection={index}
          type="button"
          class={unstyled ? section.className : getSectionClasses({ ...section, interactive: true, theme: resolvedTheme })}
          style={section.style}
          disabled={isDisabled || section.disabled}
          tabindex={toolbarMode ? (index === activeIndex ? 0 : -1) : undefined}
          aria-label={section.ariaLabel}
          data-section={section.key}
          data-section-index={index}
          on:focus={() => {
            if (toolbarMode) activeIndex = index
          }}
          on:click={(event) => handleSectionClick(section, event)}
        >
          {section.content}
        </button>
      {/each}
    {/if}
  </div>
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
    data-disabled={isDisabled || undefined}
    on:click={handleRootClick}
  >
    {#if loading}
      <span class={unstyled ? undefined : getSectionClasses({ theme: resolvedTheme })} aria-live="polite" role="status">
        Loading...
      </span>
    {:else}
      {#each normalizedSections as section (section.key)}
        <span
          class={unstyled ? section.className : getSectionClasses({ ...section, theme: resolvedTheme })}
          style={section.style}
          data-section={section.key}
          aria-label={section.ariaLabel}
        >
          {section.content}
        </span>
      {/each}
    {/if}
  </button>
{/if}
