import { getNavigationCommand, resolveSectionIndex } from "@rezafab/fab-button-core"

type FabButtonElementAttributes =
  | "variant"
  | "size"
  | "shape"
  | "layout"
  | "columns"
  | "rows"
  | "gap"
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
  "disabled",
  "loading",
  "keyboard-navigation",
  "keyboard-orientation",
  "loop-navigation"
]

export class FabButtonElement extends HTMLElement {
  private activeSectionIndex = -1

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
    this.addEventListener("click", this.onHostClick)
    this.addEventListener("keydown", this.onHostKeyDown)
    this.addEventListener("focusin", this.onHostFocusIn)
    this.refresh()
  }

  disconnectedCallback() {
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
    this.classList.add("fab-button")
    this.dataset.layout = this.getAttribute("layout") || "flex"
    this.dataset.variant = this.getAttribute("variant") || "default"
    this.dataset.size = this.getAttribute("size") || "md"
    this.dataset.shape = this.getAttribute("shape") || "rounded"
    this.dataset.disabled = this.isDisabled() ? "true" : "false"

    this.setAttribute("role", this.isToolbarMode() ? "toolbar" : "group")
    const keyboardOrientation = this.getKeyboardOrientation()
    if (this.isToolbarMode() && keyboardOrientation !== "both") {
      this.setAttribute("aria-orientation", keyboardOrientation)
    } else {
      this.removeAttribute("aria-orientation")
    }
    this.setAttribute("aria-disabled", this.isDisabled() ? "true" : "false")
    this.setAttribute("aria-busy", this.hasAttribute("loading") ? "true" : "false")

    const columns = this.getAttribute("columns")
    const rows = this.getAttribute("rows")
    const gap = this.getAttribute("gap")

    if (columns) this.style.setProperty("--fab-button-columns", columns)
    if (rows) this.style.setProperty("--fab-button-rows", rows)
    if (gap) this.style.setProperty("--fab-button-gap", gap)

    this.querySelectorAll<HTMLElement>("[data-section]").forEach((section, index) => {
      section.classList.add("fab-button__section")
      section.dataset.sectionIndex = String(index)
      if (this.isDisabled()) {
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
}

export const defineFabButtonElement = (tagName = "fab-button") => {
  if (typeof window === "undefined" || typeof customElements === "undefined") return
  if (!customElements.get(tagName)) {
    customElements.define(tagName, FabButtonElement)
  }
}
