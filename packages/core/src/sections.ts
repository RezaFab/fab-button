import type { FabButtonSectionBase, FabButtonSectionGuard } from "./types"

export const normalizeSections = <T extends FabButtonSectionBase>(sections: T[] = []): T[] =>
  sections.map((section, index) => ({
    ...section,
    key: section.key || String(index)
  }))

const resolveSectionGuard = <TSection extends FabButtonSectionBase>(
  section: TSection,
  guard: FabButtonSectionGuard<TSection> | undefined,
  fallback: boolean
) => {
  if (guard === undefined) return fallback
  if (typeof guard === "function") return guard(section)
  return guard
}

export const isSectionVisible = <TSection extends FabButtonSectionBase>(section: TSection) =>
  resolveSectionGuard(section, section.visibleWhen as FabButtonSectionGuard<TSection> | undefined, true)

export const isSectionDisabled = <TSection extends FabButtonSectionBase>(section: TSection) =>
  Boolean(section.disabled) ||
  resolveSectionGuard(section, section.disabledWhen as FabButtonSectionGuard<TSection> | undefined, false)

export const visibleWhen = <TSection extends FabButtonSectionBase = FabButtonSectionBase>(
  guard: FabButtonSectionGuard<TSection>
) =>
  ({ visibleWhen: guard }) as Pick<TSection, "visibleWhen">

export const disabledWhen = <TSection extends FabButtonSectionBase = FabButtonSectionBase>(
  guard: FabButtonSectionGuard<TSection>
) =>
  ({ disabledWhen: guard }) as Pick<TSection, "disabledWhen">
