import type { FabButtonSectionBase, FabButtonSectionConfirmConfig } from "./types"

interface FabButtonConfirmPromptOptions {
  fallbackTitle?: string
  confirmImpl?: (message: string) => boolean
}

export interface FabButtonResolvedSectionConfirm {
  title: string
  description?: string
  confirmText: string
  cancelText: string
}

const DEFAULT_CONFIRM_TITLE = "Are you sure you want to continue?"
const DEFAULT_CONFIRM_TEXT = "Confirm"
const DEFAULT_CANCEL_TEXT = "Cancel"

const normalizeConfirmConfig = (
  confirm: FabButtonSectionBase["confirm"]
): FabButtonSectionConfirmConfig | null => {
  if (!confirm) return null
  if (confirm === true) return {}
  return confirm
}

const toConfirmMessage = (
  config: FabButtonSectionConfirmConfig,
  fallbackTitle?: string
) => {
  const title = config.title?.trim() || fallbackTitle || DEFAULT_CONFIRM_TITLE
  const description = config.description?.trim()
  return description ? `${title}\n\n${description}` : title
}

export const resolveSectionConfirmPrompt = (
  section: Pick<FabButtonSectionBase, "confirm">,
  options: Pick<FabButtonConfirmPromptOptions, "fallbackTitle"> = {}
): FabButtonResolvedSectionConfirm | null => {
  const confirmConfig = normalizeConfirmConfig(section.confirm)
  if (!confirmConfig) return null

  const title = confirmConfig.title?.trim() || options.fallbackTitle || DEFAULT_CONFIRM_TITLE
  const description = confirmConfig.description?.trim() || undefined

  return {
    title,
    description,
    confirmText: DEFAULT_CONFIRM_TEXT,
    cancelText: DEFAULT_CANCEL_TEXT
  }
}

export const shouldProceedSectionConfirm = (
  section: Pick<FabButtonSectionBase, "confirm">,
  options: FabButtonConfirmPromptOptions = {}
) => {
  const prompt = resolveSectionConfirmPrompt(section, options)
  if (!prompt) return true
  const message = prompt.description ? `${prompt.title}\n\n${prompt.description}` : prompt.title
  if (!message) return true

  const runConfirm =
    options.confirmImpl ??
    (typeof globalThis !== "undefined" && typeof globalThis.confirm === "function"
      ? globalThis.confirm.bind(globalThis)
      : undefined)
  if (!runConfirm) return true
  return runConfirm(message)
}
