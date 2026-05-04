import type {
  FabButtonClassOptions,
  FabButtonCssMode,
  FabButtonLibraryClassMap,
  FabButtonLibraryPreset,
  FabButtonSectionClassOptions,
  FabButtonStyleConfig,
  FabButtonTheme
} from "./types"

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ")

const LIBRARY_PRESETS: Record<FabButtonLibraryPreset, FabButtonLibraryClassMap> = {
  tailwind: {
    root:
      "inline-flex items-stretch gap-1 rounded-lg border p-0.5 transition",
    rootLight: "border-zinc-300 bg-zinc-100 text-zinc-900",
    rootDark: "border-zinc-700 bg-zinc-900 text-zinc-100",
    section:
      "inline-flex items-center justify-center rounded-md px-3 text-sm font-semibold leading-none transition-colors",
    actionSection: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    actionSectionLight: "hover:bg-black/10",
    actionSectionDark: "hover:bg-white/15",
    loadingSection: "opacity-80",
    disabled: "cursor-not-allowed opacity-60",
    loading: "opacity-80",
    layout: {
      flex: "inline-flex",
      grid: "inline-grid"
    },
    size: {
      sm: "min-h-8 text-xs",
      md: "min-h-10 text-sm",
      lg: "min-h-12 text-base"
    },
    shape: {
      square: "rounded",
      rounded: "rounded-lg",
      pill: "rounded-full"
    },
    variant: {
      default: "border-zinc-300 bg-zinc-100 text-zinc-900",
      primary: "border-blue-700 bg-blue-600 text-white",
      dark: "border-zinc-900 bg-zinc-900 text-zinc-50",
      outline: "bg-transparent text-zinc-900",
      ghost: "border-transparent bg-transparent text-zinc-900"
    }
  },
  bootstrap: {
    root:
      "d-inline-flex align-items-stretch gap-1 border rounded p-1",
    rootLight: "bg-light text-dark border-secondary-subtle",
    rootDark: "bg-dark text-light border-secondary",
    section:
      "d-inline-flex align-items-center justify-content-center px-3 fw-semibold text-decoration-none",
    actionSection: "btn btn-sm btn-link text-reset p-0 text-decoration-none",
    actionSectionLight: "",
    actionSectionDark: "",
    loadingSection: "opacity-75",
    disabled: "opacity-50 pe-none",
    loading: "opacity-75",
    layout: {
      flex: "d-inline-flex",
      grid: "d-inline-grid"
    },
    size: {
      sm: "small",
      md: "",
      lg: "fs-6"
    },
    shape: {
      square: "rounded-1",
      rounded: "rounded-3",
      pill: "rounded-pill"
    },
    variant: {
      default: "bg-light border-secondary-subtle text-dark",
      primary: "bg-primary border-primary text-white",
      dark: "bg-dark border-dark text-white",
      outline: "bg-transparent border-secondary text-dark",
      ghost: "bg-transparent border-0 text-dark"
    }
  },
  custom: {}
}

type ResolvedFabButtonStyleConfig = {
  cssMode: FabButtonCssMode
  theme: FabButtonTheme
  library: {
    preset: FabButtonLibraryPreset
    classes: FabButtonLibraryClassMap
  }
}

const defaultStyleConfig: ResolvedFabButtonStyleConfig = {
  cssMode: "manual",
  theme: "system",
  library: {
    preset: "tailwind",
    classes: {}
  }
}

let styleConfig: ResolvedFabButtonStyleConfig = defaultStyleConfig
const styleConfigListeners = new Set<() => void>()

const resolveTheme = (theme: FabButtonTheme): "light" | "dark" => {
  if (theme === "light" || theme === "dark") {
    return theme
  }
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return "light"
}

const mergeClassMaps = (
  base: FabButtonLibraryClassMap,
  override: FabButtonLibraryClassMap = {}
): FabButtonLibraryClassMap => ({
  ...base,
  ...override,
  layout: { ...base.layout, ...override.layout },
  size: { ...base.size, ...override.size },
  shape: { ...base.shape, ...override.shape },
  variant: { ...base.variant, ...override.variant }
})

const mergeStyleConfig = (
  current: ResolvedFabButtonStyleConfig,
  next: FabButtonStyleConfig = {}
): ResolvedFabButtonStyleConfig => ({
  cssMode: next.cssMode ?? current.cssMode,
  theme: next.theme ?? current.theme,
  library: {
    preset: next.library?.preset ?? current.library.preset,
    classes: mergeClassMaps(current.library.classes, next.library?.classes)
  }
})

const getResolvedLibraryClasses = () => {
  const presetClasses = LIBRARY_PRESETS[styleConfig.library.preset] ?? {}
  return mergeClassMaps(presetClasses, styleConfig.library.classes)
}

export const createFabButtonConfig = (config: FabButtonStyleConfig) => config

export const configureFabButton = (config: FabButtonStyleConfig = {}) => {
  styleConfig = mergeStyleConfig(styleConfig, config)
  styleConfigListeners.forEach((listener) => listener())
}

export const resetFabButtonConfig = () => {
  styleConfig = defaultStyleConfig
  styleConfigListeners.forEach((listener) => listener())
}

export const getFabButtonConfig = () => styleConfig

export const getFabButtonCssMode = (): FabButtonCssMode => styleConfig.cssMode

export const getFabButtonTheme = (): FabButtonTheme => styleConfig.theme

export const subscribeFabButtonConfig = (listener: () => void) => {
  styleConfigListeners.add(listener)
  return () => {
    styleConfigListeners.delete(listener)
  }
}

const getManualFabButtonClasses = (options: FabButtonClassOptions = {}) =>
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

const getManualSectionClasses = (options: FabButtonSectionClassOptions = {}) =>
  cx("fab-button__section", options.className, options.disabled && "is-disabled")

const getLibraryFabButtonClasses = (options: FabButtonClassOptions = {}) => {
  const classes = getResolvedLibraryClasses()
  const resolvedTheme = resolveTheme(options.theme ?? styleConfig.theme)

  return cx(
    "fab-button",
    options.disabled && "is-disabled",
    options.loading && "is-loading",
    options.layout && `is-layout-${options.layout}`,
    options.size && `is-size-${options.size}`,
    options.shape && `is-shape-${options.shape}`,
    options.variant && `is-variant-${options.variant}`,
    classes.root,
    resolvedTheme === "dark" ? classes.rootDark : classes.rootLight,
    options.className,
    options.layout && classes.layout?.[options.layout],
    options.size && classes.size?.[options.size],
    options.shape && classes.shape?.[options.shape],
    options.variant && classes.variant?.[options.variant],
    options.disabled && classes.disabled,
    options.loading && classes.loading
  )
}

const getLibrarySectionClasses = (options: FabButtonSectionClassOptions = {}) => {
  const classes = getResolvedLibraryClasses()
  const resolvedTheme = resolveTheme(options.theme ?? styleConfig.theme)
  return cx(
    "fab-button__section",
    classes.section,
    options.interactive && classes.actionSection,
    options.interactive && (resolvedTheme === "dark" ? classes.actionSectionDark : classes.actionSectionLight),
    options.disabled && classes.disabled,
    options.className
  )
}

export const getFabButtonClasses = (options: FabButtonClassOptions = {}) => {
  if (styleConfig.cssMode !== "library") {
    return getManualFabButtonClasses(options)
  }
  return getLibraryFabButtonClasses(options)
}

export const getSectionClasses = (options: FabButtonSectionClassOptions = {}) => {
  if (styleConfig.cssMode !== "library") {
    return getManualSectionClasses(options)
  }
  return getLibrarySectionClasses(options)
}
