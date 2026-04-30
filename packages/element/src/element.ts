type FabButtonElementAttributes =
  | "variant"
  | "size"
  | "shape"
  | "layout"
  | "columns"
  | "rows"
  | "gap"
  | "disabled"

const OBSERVED_ATTRIBUTES: FabButtonElementAttributes[] = [
  "variant",
  "size",
  "shape",
  "layout",
  "columns",
  "rows",
  "gap",
  "disabled"
]

export class FabButtonElement extends HTMLElement {
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

  connectedCallback() {
    this.addEventListener("click", this.onHostClick)
    this.refresh()
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onHostClick)
  }

  attributeChangedCallback() {
    this.refresh()
  }

  private refresh() {
    this.classList.add("fab-button")
    this.dataset.layout = this.getAttribute("layout") || "flex"
    this.dataset.variant = this.getAttribute("variant") || "default"
    this.dataset.size = this.getAttribute("size") || "md"
    this.dataset.shape = this.getAttribute("shape") || "rounded"
    this.dataset.disabled = this.hasAttribute("disabled") ? "true" : "false"

    const columns = this.getAttribute("columns")
    const rows = this.getAttribute("rows")
    const gap = this.getAttribute("gap")

    if (columns) this.style.setProperty("--fab-button-columns", columns)
    if (rows) this.style.setProperty("--fab-button-rows", rows)
    if (gap) this.style.setProperty("--fab-button-gap", gap)

    this.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
      section.classList.add("fab-button__section")
      if (this.hasAttribute("disabled")) {
        section.setAttribute("aria-disabled", "true")
      } else {
        section.removeAttribute("aria-disabled")
      }
    })
  }
}

export const defineFabButtonElement = (tagName = "fab-button") => {
  if (typeof window === "undefined" || typeof customElements === "undefined") return
  if (!customElements.get(tagName)) {
    customElements.define(tagName, FabButtonElement)
  }
}
