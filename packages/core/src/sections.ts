import type { FabButtonSectionBase } from "./types"

export const normalizeSections = <T extends FabButtonSectionBase>(sections: T[] = []): T[] =>
  sections.map((section, index) => ({
    ...section,
    key: section.key || String(index)
  }))
