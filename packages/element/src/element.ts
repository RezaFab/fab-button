import {
  getFabButtonClasses,
  getFabButtonTheme,
  getSectionClasses,
  getNavigationCommand,
  resolveSectionIndex,
  subscribeFabButtonConfig
} from "@rezafab/fab-button-core"

type FabButtonElementAttributes =
  | "variant"
  | "size"
  | "shape"
  | "layout"
  | "columns"
  | "rows"
  | "gap"
  | "theme"
  | "disabled"
  | "loading"
  | "keyboard-navigation"
  | "keyboard-orientation"
  | "loop-navigation"

const OBSERVED_ATTRIBUTES: FabButtonElementAttributes[] = [
  "variant",
  "size",
  "shape",
  "layout",
  "columns",
  "rows",
  "gap",
  "theme",
  "disabled",
  "loading",
  "keyboard-navigation",
  "keyboard-orientation",
  "loop-navigation"
]

export class FabButtonElement extends HTMLElement {
  private activeSectionIndex = -1
  private managedHostClasses = new Set<string>()
  private unsubscribeConfig: (() => void) | undefined

  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES
  }

  private readonly onHostClick = (event: Event) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const section = target.closest<HTMLElement>("[data-section]")
    if (!section || !this.contains(section)) return

    const key = section.dataset.section
    if (!key) return

    this.dispatchEvent(
      new CustomEvent("section-click", {
        detail: { key },
        bubbles: true,
        composed: true
      })
    )
  }

  private readonly onHostKeyDown = (event: KeyboardEvent) => {
    if (!this.isToolbarMode() || this.isDisabled()) return

    const command = getNavigationCommand(event.key, this.getKeyboardOrientation())
    if (!command) return

    const target = event.target as HTMLElement | null
    const section = target?.closest<HTMLElement>("[data-section][data-section-index]")
    if (!section || !this.contains(section)) return

    const enabledIndices = this.getEnabledSectionIndices()
    if (!enabledIndices.length) return

    const indexValue = Number(section.dataset.sectionIndex)
    const currentIndex = Number.isNaN(indexValue) ? this.activeSectionIndex : indexValue
    const nextIndex = resolveSectionIndex({
      command,
      currentIndex,
      enabledIndices,
      loop: this.isLoopNavigation()
    })
    if (nextIndex === null) return

    event.preventDefault()
    this.activeSectionIndex = nextIndex
    this.syncRovingTabIndex()
    this.getSectionElements()[nextIndex]?.focus()
  }

  private readonly onHostFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null
    const section = target?.closest<HTMLElement>("[data-section][data-section-index]")
    if (!section || !this.contains(section)) return

    const indexValue = Number(section.dataset.sectionIndex)
    if (!Number.isNaN(indexValue)) {
      this.activeSectionIndex = indexValue
      this.syncRovingTabIndex()
    }
  }

  connectedCallback() {
    this.unsubscribeConfig = subscribeFabButtonConfig(() => {
      this.refresh()
    })
    this.addEventListener("click", this.onHostClick)
    this.addEventListener("keydown", this.onHostKeyDown)
    this.addEventListener("focusin", this.onHostFocusIn)
    this.refresh()
  }

  disconnectedCallback() {
    this.unsubscribeConfig?.()
    this.unsubscribeConfig = undefined
    this.removeEventListener("click", this.onHostClick)
    this.removeEventListener("keydown", this.onHostKeyDown)
    this.removeEventListener("focusin", this.onHostFocusIn)
  }

  attributeChangedCallback() {
    this.refresh()
  }

  private isToolbarMode() {
    return this.getAttribute("keyboard-navigation") === "toolbar"
  }

  private isDisabled() {
    return this.hasAttribute("disabled") || this.hasAttribute("loading")
  }

  private getKeyboardOrientation() {
    const orientation = this.getAttribute("keyboard-orientation")
    if (orientation === "horizontal" || orientation === "vertical" || orientation === "both") {
      return orientation
    }
    return this.getAttribute("layout") === "grid" ? "both" : "horizontal"
  }

  private isLoopNavigation() {
    const value = this.getAttribute("loop-navigation")
    if (value === "false") return false
    return true
  }

  private getSectionElements() {
    return Array.from(this.querySelectorAll<HTMLElement>("[data-section]"))
  }

  private getEnabledSectionIndices() {
    if (this.isDisabled()) return []
    return this.getSectionElements().reduce<number[]>((enabled, section, index) => {
      if (!section.hasAttribute("disabled") && section.getAttribute("aria-disabled") !== "true") {
        enabled.push(index)
      }
      return enabled
    }, [])
  }

  private syncRovingTabIndex() {
    const sections = this.getSectionElements()
    const enabledIndices = this.getEnabledSectionIndices()

    if (!enabledIndices.length) {
      this.activeSectionIndex = -1
      sections.forEach((section) => {
        section.tabIndex = -1
      })
      return
    }

    if (!enabledIndices.includes(this.activeSectionIndex)) {
      this.activeSectionIndex = enabledIndices[0]
    }

    sections.forEach((section, index) => {
      if (section.hasAttribute("disabled") || section.getAttribute("aria-disabled") === "true") {
        section.tabIndex = -1
        return
      }
      section.tabIndex = index === this.activeSectionIndex ? 0 : -1
    })
  }

  private refresh() {
    const layout = (this.getAttribute("layout") as "flex" | "grid") || "flex"
    const variant = this.getAttribute("variant") || "default"
    const size = this.getAttribute("size") || "md"
    const shape = this.getAttribute("shape") || "rounded"
    const theme = this.getAttribute("theme") || getFabButtonTheme()
    const loading = this.hasAttribute("loading")
    const disabled = this.isDisabled()

    this.applyManagedHostClasses(
      getFabButtonClasses({
        layout,
        variant: variant as "default" | "primary" | "dark" | "outline" | "ghost",
        size: size as "sm" | "md" | "lg",
        shape: shape as "square" | "rounded" | "pill",
        theme: theme as "light" | "dark" | "system",
        disabled,
        loading
      })
    )

    this.dataset.layout = layout
    this.dataset.variant = variant
    this.dataset.size = size
    this.dataset.shape = shape
    this.dataset.theme = theme
    this.dataset.disabled = disabled ? "true" : "false"

    this.setAttribute("role", this.isToolbarMode() ? "toolbar" : "group")
    const keyboardOrientation = this.getKeyboardOrientation()
    if (this.isToolbarMode() && keyboardOrientation !== "both") {
      this.setAttribute("aria-orientation", keyboardOrientation)
    } else {
      this.removeAttribute("aria-orientation")
    }
    this.setAttribute("aria-disabled", disabled ? "true" : "false")
    this.setAttribute("aria-busy", loading ? "true" : "false")

    const columns = this.getAttribute("columns")
    const rows = this.getAttribute("rows")
    const gap = this.getAttribute("gap")

    if (columns) this.style.setProperty("--fab-button-columns", columns)
    if (rows) this.style.setProperty("--fab-button-rows", rows)
    if (gap) this.style.setProperty("--fab-button-gap", gap)

    this.querySelectorAll<HTMLElement>("[data-section]").forEach((section, index) => {
      this.applyManagedSectionClasses(
        section,
        getSectionClasses({
          disabled,
          theme: theme as "light" | "dark" | "system",
          interactive: true
        })
      )
      section.dataset.sectionIndex = String(index)
      if (disabled) {
        section.setAttribute("aria-disabled", "true")
      } else {
        section.removeAttribute("aria-disabled")
      }
    })

    if (this.isToolbarMode()) {
      this.syncRovingTabIndex()
    } else {
      this.getSectionElements().forEach((section) => {
        section.removeAttribute("tabindex")
      })
    }
  }

  private applyManagedHostClasses(nextClasses: string) {
    this.managedHostClasses.forEach((className) => {
      this.classList.remove(className)
    })
    this.managedHostClasses.clear()
    nextClasses
      .split(/\s+/)
      .filter(Boolean)
      .forEach((className) => {
        this.classList.add(className)
        this.managedHostClasses.add(className)
      })
  }

  private applyManagedSectionClasses(section: HTMLElement, nextClasses: string) {
    const previousClasses = section.dataset.fabManagedClassNames
    if (previousClasses) {
      previousClasses
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => {
          section.classList.remove(className)
        })
    }
    nextClasses
      .split(/\s+/)
      .filter(Boolean)
      .forEach((className) => {
        section.classList.add(className)
      })
    section.dataset.fabManagedClassNames = nextClasses
  }
}

export const defineFabButtonElement = (tagName = "fab-button") => {
  if (typeof window === "undefined" || typeof customElements === "undefined") return
  if (!customElements.get(tagName)) {
    customElements.define(tagName, FabButtonElement)
  }
}
