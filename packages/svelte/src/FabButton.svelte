<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import {
    getFabButtonClasses,
    getFabButtonCssVars,
    getSectionClasses,
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
  export let ariaLabel: FabButtonProps["ariaLabel"] = undefined
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

  $: normalizedSections = normalizeSections(sections ?? [])
  $: hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
  $: isDisabled = disabled || loading
  $: styleVars = getFabButtonCssVars({ columns, rows, gap })
  $: rootClassName = unstyled
    ? className
    : getFabButtonClasses({
        className,
        layout,
        size,
        shape,
        variant,
        disabled: isDisabled,
        loading
      })
  $: rootStyle = [toStyleString(styleVars), style].filter(Boolean).join("; ")

  const handleRootClick = (event: MouseEvent) => {
    onClick?.(event)
    dispatch("click", event)
  }

  const handleSectionClick = (section: FabButtonSection, event: MouseEvent) => {
    section.onClick?.(event)
    dispatch("sectionClick", { key: section.key, event })
  }
</script>

{#if hasSectionActions}
  <div
    class={rootClassName}
    style={rootStyle}
    role="group"
    aria-label={ariaLabel}
    aria-disabled={isDisabled || undefined}
    data-layout={layout}
    data-variant={variant}
    data-size={size}
    data-shape={shape}
    data-disabled={isDisabled || undefined}
  >
    {#if loading}
      <span class={unstyled ? undefined : "fab-button__section"} aria-live="polite">Loading...</span>
    {:else}
      {#each normalizedSections as section (section.key)}
        <button
          type="button"
          class={unstyled ? section.className : getSectionClasses(section)}
          style={section.style}
          disabled={isDisabled || section.disabled}
          aria-label={section.ariaLabel}
          data-section={section.key}
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
    disabled={isDisabled}
    data-layout={layout}
    data-variant={variant}
    data-size={size}
    data-shape={shape}
    data-disabled={isDisabled || undefined}
    on:click={handleRootClick}
  >
    {#if loading}
      <span class={unstyled ? undefined : "fab-button__section"} aria-live="polite">Loading...</span>
    {:else}
      {#each normalizedSections as section (section.key)}
        <span
          class={unstyled ? section.className : getSectionClasses(section)}
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
