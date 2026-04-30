import type { FabButtonClassOptions, FabButtonSectionClassOptions } from "./types"

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ")

export const getFabButtonClasses = (options: FabButtonClassOptions = {}) =>
  cx(
    "fab-button",
    options.className,
    options.disabled && "is-disabled",
    options.loading && "is-loading",
    options.layout && `is-layout-${options.layout}`,
    options.size && `is-size-${options.size}`,
    options.shape && `is-shape-${options.shape}`,
    options.variant && `is-variant-${options.variant}`
  )

export const getSectionClasses = (options: FabButtonSectionClassOptions = {}) =>
  cx("fab-button__section", options.className, options.disabled && "is-disabled")
