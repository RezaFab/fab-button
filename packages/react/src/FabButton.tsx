import type { CSSProperties } from "react"
import {
  getFabButtonClasses,
  getFabButtonCssVars,
  getSectionClasses,
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
  ariaLabel,
  onClick
}: FabButtonProps) => {
  const normalizedSections = normalizeSections(sections ?? [])
  const hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
  const isDisabled = disabled || loading
  const styleVars = getFabButtonCssVars({
    columns,
    rows,
    gap
  }) as CSSProperties
  const rootClassName = unstyled
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
  const rootStyle = mergeStyles(styleVars, style)

  if (hasSectionActions) {
    return (
      <div
        className={rootClassName}
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
        {loading ? (
          <span className={unstyled ? undefined : "fab-button__section"} aria-live="polite">
            Loading...
          </span>
        ) : (
          normalizedSections.map((section) => (
            <button
              key={section.key}
              type="button"
              className={unstyled ? section.className : getSectionClasses(section)}
              style={section.style}
              disabled={isDisabled || section.disabled}
              aria-label={section.ariaLabel}
              data-section={section.key}
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
      disabled={isDisabled}
      data-layout={layout}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={isDisabled || undefined}
      onClick={onClick}
    >
      {loading ? (
        <span className={unstyled ? undefined : "fab-button__section"} aria-live="polite">
          Loading...
        </span>
      ) : (
        normalizedSections.map((section) => (
          <span
            key={section.key}
            className={unstyled ? section.className : getSectionClasses(section)}
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
