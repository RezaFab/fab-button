import {
  getFabButtonClasses,
  getFabButtonTheme,
  getSectionClasses,
  getSectionShortcutHint,
  getShortcutSectionIndex,
  getNavigationCommand,
  resolveSectionConfirmPrompt,
  resolveSectionIndex,
  subscribeFabButtonConfig
} from "@rezafab/fab-button-core"
import type { FabButtonResolvedSectionConfirm, FabButtonSectionActionSource } from "@rezafab/fab-button-core"

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
const KEYBOARD_ACTIVATION_KEYS = new Set(["Enter", " ", "Spacebar"])

export class FabButtonElement extends HTMLElement {
  private activeSectionIndex = -1
  private managedHostClasses = new Set<string>()
  private unsubscribeConfig: (() => void) | undefined
  private pendingConfirmSection: HTMLElement | null = null
  private confirmBypassSection: HTMLElement | null = null
  private pendingSectionActionSource:
    | { section: HTMLElement; source: FabButtonSectionActionSource }
    | null = null
  private pendingConfirmSectionActionSource: FabButtonSectionActionSource | null = null
  private confirmDialogElement: HTMLElement | null = null
  private confirmDialogCleanup: (() => void) | null = null

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
    const indexValue = Number(section.dataset.sectionIndex)
    const index = Number.isNaN(indexValue)
      ? this.getSectionElements().findIndex((entry) => entry === section)
      : indexValue
    const source = this.consumeSectionActionSource(section, event)

    this.dispatchEvent(
      new CustomEvent("section-click", {
        detail: { key },
        bubbles: true,
        composed: true
      })
    )
    this.dispatchEvent(
      new CustomEvent("section-action", {
        detail: { key, index, source },
        bubbles: true,
        composed: true
      })
    )
  }

  private readonly onHostClickCapture = (event: Event) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const section = target.closest<HTMLElement>("[data-section]")
    if (!section || !this.contains(section)) return
    if (this.confirmBypassSection === section) {
      this.confirmBypassSection = null
      return
    }

    const confirm = this.parseSectionConfirm(section)
    if (!confirm) return

    const fallbackTitle = section.getAttribute("aria-label") || section.dataset.section || section.textContent?.trim()
    const confirmPrompt = resolveSectionConfirmPrompt(
      { confirm },
      {
        fallbackTitle
      }
    )
    if (!confirmPrompt) return
    const confirmActionSource = this.consumeSectionActionSource(section, event)

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    this.openConfirmDialog(section, confirmPrompt)
    this.pendingConfirmSectionActionSource = confirmActionSource
  }

  private readonly onHostKeyDown = (event: KeyboardEvent) => {
    if (!this.isToolbarMode() || this.isDisabled()) return

    const target = event.target as HTMLElement | null
    const section = target?.closest<HTMLElement>("[data-section][data-section-index]")
    if (!section || !this.contains(section)) return

    if (KEYBOARD_ACTIVATION_KEYS.has(event.key)) {
      this.setPendingSectionActionSource(section, "keyboard-nav")
      return
    }

    const command = getNavigationCommand(event.key, this.getKeyboardOrientation())
    if (!command) return

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

  private readonly onWindowKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled()) return

    const sections = this.getSectionElements()
    if (!sections.length) return

    const shortcutSectionIndex = getShortcutSectionIndex(
      sections.map((section) => ({
        key: section.dataset.section ?? "",
        shortcut: section.dataset.shortcut,
        shortcutId: this.parseSectionShortcutId(section.dataset.shortcutId),
        disabled:
          section.hasAttribute("disabled") ||
          section.getAttribute("aria-disabled") === "true" ||
          section.dataset.asyncState === "loading"
      })),
      event,
      this.isDisabled()
    )
    if (shortcutSectionIndex === null) return

    const shortcutSection = sections[shortcutSectionIndex]
    if (!shortcutSection) return

    event.preventDefault()
    if (this.isToolbarMode()) {
      this.activeSectionIndex = shortcutSectionIndex
      this.syncRovingTabIndex()
    }
    this.setPendingSectionActionSource(shortcutSection, "shortcut")
    shortcutSection.focus()
    shortcutSection.click()
  }

  connectedCallback() {
    this.unsubscribeConfig = subscribeFabButtonConfig(() => {
      this.refresh()
    })
    this.addEventListener("click", this.onHostClickCapture, true)
    this.addEventListener("click", this.onHostClick)
    this.addEventListener("keydown", this.onHostKeyDown)
    this.addEventListener("focusin", this.onHostFocusIn)
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.onWindowKeyDown)
    }
    this.refresh()
  }

  disconnectedCallback() {
    this.unsubscribeConfig?.()
    this.unsubscribeConfig = undefined
    this.closeConfirmDialog()
    this.removeEventListener("click", this.onHostClickCapture, true)
    this.removeEventListener("click", this.onHostClick)
    this.removeEventListener("keydown", this.onHostKeyDown)
    this.removeEventListener("focusin", this.onHostFocusIn)
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.onWindowKeyDown)
    }
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

  private parseSectionShortcutId(rawShortcutId: string | undefined) {
    if (!rawShortcutId) return undefined

    if (rawShortcutId.includes(",")) {
      const ids = rawShortcutId
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.trunc(value))
      return ids.length ? ids : undefined
    }

    const numericId = Number(rawShortcutId.trim())
    if (!Number.isFinite(numericId)) return undefined
    return Math.trunc(numericId)
  }

  private parseSectionConfirm(section: HTMLElement) {
    const hasConfirmAttribute = section.hasAttribute("data-confirm")
    const rawConfirm = section.dataset.confirm?.trim().toLowerCase()
    const title = section.dataset.confirmTitle?.trim()
    const description = section.dataset.confirmDescription?.trim()

    const hasPromptContent = Boolean(title || description)
    if (!hasConfirmAttribute && !hasPromptContent) return undefined

    if (rawConfirm === "false" || rawConfirm === "0" || rawConfirm === "no") return undefined

    if (!hasPromptContent) return true

    return {
      title,
      description
    }
  }

  private syncSectionShortcutHint(section: HTMLElement) {
    const shortcutHint = getSectionShortcutHint({
      shortcut: section.dataset.shortcut,
      shortcutId: this.parseSectionShortcutId(section.dataset.shortcutId)
    })

    const existingHintNode = section.querySelector<HTMLElement>('[data-fab-shortcut-hint="true"]')

    if (!shortcutHint) {
      section.removeAttribute("data-shortcut-hint")
      existingHintNode?.remove()
      return
    }

    section.dataset.shortcutHint = shortcutHint

    if (!existingHintNode) {
      const hintNode = document.createElement("span")
      hintNode.className = "fab-button__shortcut-hint"
      hintNode.dataset.fabShortcutHint = "true"
      hintNode.setAttribute("aria-hidden", "true")
      hintNode.textContent = shortcutHint
      section.appendChild(hintNode)
      return
    }

    existingHintNode.textContent = shortcutHint
  }

  private closeConfirmDialog() {
    this.confirmDialogCleanup?.()
    this.confirmDialogCleanup = null

    if (this.confirmDialogElement?.isConnected) {
      this.confirmDialogElement.remove()
    }
    this.confirmDialogElement = null
    this.pendingConfirmSection = null
    this.pendingConfirmSectionActionSource = null
  }

  private proceedConfirmedSectionAction() {
    const targetSection = this.pendingConfirmSection
    const sectionActionSource = this.pendingConfirmSectionActionSource ?? "click"
    this.closeConfirmDialog()
    if (!targetSection) return
    if (targetSection.hasAttribute("disabled") || targetSection.getAttribute("aria-disabled") === "true") return

    this.confirmBypassSection = targetSection
    this.setPendingSectionActionSource(targetSection, sectionActionSource)
    targetSection.focus()
    targetSection.click()
  }

  private openConfirmDialog(section: HTMLElement, prompt: FabButtonResolvedSectionConfirm) {
    if (typeof document === "undefined") return

    this.closeConfirmDialog()
    this.pendingConfirmSection = section

    const backdrop = document.createElement("div")
    backdrop.className = "fab-button-confirm__backdrop"
    backdrop.dataset.theme = this.dataset.theme || this.getAttribute("theme") || getFabButtonTheme()
    backdrop.setAttribute("role", "presentation")

    const dialog = document.createElement("div")
    dialog.className = "fab-button-confirm"
    dialog.setAttribute("role", "dialog")
    dialog.setAttribute("aria-modal", "true")
    dialog.setAttribute("aria-label", prompt.title)
    dialog.addEventListener("click", (event) => {
      event.stopPropagation()
    })

    const title = document.createElement("h3")
    title.className = "fab-button-confirm__title"
    title.textContent = prompt.title
    dialog.appendChild(title)

    if (prompt.description) {
      const description = document.createElement("p")
      description.className = "fab-button-confirm__description"
      description.textContent = prompt.description
      dialog.appendChild(description)
    }

    const actions = document.createElement("div")
    actions.className = "fab-button-confirm__actions"

    const cancelButton = document.createElement("button")
    cancelButton.type = "button"
    cancelButton.className = "fab-button-confirm__button fab-button-confirm__button--cancel"
    cancelButton.textContent = prompt.cancelText
    cancelButton.addEventListener("click", () => {
      this.closeConfirmDialog()
    })

    const confirmButton = document.createElement("button")
    confirmButton.type = "button"
    confirmButton.className = "fab-button-confirm__button fab-button-confirm__button--confirm"
    confirmButton.textContent = prompt.confirmText
    confirmButton.addEventListener("click", () => {
      this.proceedConfirmedSectionAction()
    })

    actions.appendChild(cancelButton)
    actions.appendChild(confirmButton)
    dialog.appendChild(actions)

    backdrop.appendChild(dialog)
    backdrop.addEventListener("click", () => {
      this.closeConfirmDialog()
    })

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      this.closeConfirmDialog()
    }

    document.addEventListener("keydown", onDocumentKeyDown)
    this.confirmDialogCleanup = () => {
      document.removeEventListener("keydown", onDocumentKeyDown)
    }
    document.body.appendChild(backdrop)
    this.confirmDialogElement = backdrop
  }

  private setPendingSectionActionSource(section: HTMLElement, source: FabButtonSectionActionSource) {
    this.pendingSectionActionSource = { section, source }
  }

  private consumeSectionActionSource(
    section: HTMLElement,
    event: Event
  ): FabButtonSectionActionSource {
    if (this.pendingSectionActionSource?.section === section) {
      const source = this.pendingSectionActionSource.source
      this.pendingSectionActionSource = null
      return source
    }
    if (event instanceof MouseEvent && event.detail === 0) return "keyboard-nav"
    return "click"
  }

  private getEnabledSectionIndices() {
    if (this.isDisabled()) return []
    return this.getSectionElements().reduce<number[]>((enabled, section, index) => {
      if (
        !section.hasAttribute("disabled") &&
        section.getAttribute("aria-disabled") !== "true" &&
        section.dataset.asyncState !== "loading"
      ) {
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
      this.syncSectionShortcutHint(section)
      const isSectionLoading = section.dataset.asyncState === "loading"
      if (disabled) {
        section.setAttribute("aria-disabled", "true")
      } else {
        if (isSectionLoading) {
          section.setAttribute("aria-disabled", "true")
        } else {
          section.removeAttribute("aria-disabled")
        }
      }
      if (isSectionLoading) {
        section.setAttribute("aria-busy", "true")
      } else {
        section.removeAttribute("aria-busy")
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
