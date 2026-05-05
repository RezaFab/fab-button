import type {
  FabButtonKeyboardOrientation,
  FabButtonSectionBase,
  FabButtonSectionShortcut,
  FabButtonShortcutKey
} from "./types"

export type FabButtonNavigationCommand = "prev" | "next" | "first" | "last" | null

interface ResolveSectionIndexOptions {
  command: Exclude<FabButtonNavigationCommand, null>
  currentIndex: number
  enabledIndices: number[]
  loop?: boolean
}

export interface FabButtonShortcutEventLike {
  key: string
  code?: string
  keyCode?: number
  which?: number
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  isComposing?: boolean
  defaultPrevented?: boolean
  target?: EventTarget | null
}

const EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable=''], [contenteditable='true'], [contenteditable='plaintext-only']"

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  spacebar: " ",
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown",
  del: "delete"
}

const BASIC_CODE_PATTERN = /^(key[a-z]|digit[0-9]|numpad[a-z0-9]+|arrow(left|right|up|down)|f[0-9]{1,2})$/i

export const FAB_BUTTON_SHORTCUT_ID_TO_CODE: Readonly<Record<number, string>> = Object.freeze({
  1: "Escape",
  2: "F1",
  3: "F2",
  4: "F3",
  5: "F4",
  6: "F5",
  7: "F6",
  8: "F7",
  9: "F8",
  10: "F9",
  11: "F10",
  12: "F11",
  13: "F12",
  14: "Backquote",
  15: "Digit1",
  16: "Digit2",
  17: "Digit3",
  18: "Digit4",
  19: "Digit5",
  20: "Digit6",
  21: "Digit7",
  22: "Digit8",
  23: "Digit9",
  24: "Digit0",
  25: "Minus",
  26: "Equal",
  27: "Backspace",
  28: "Tab",
  29: "KeyQ",
  30: "KeyW",
  31: "KeyE",
  32: "KeyR",
  33: "KeyT",
  34: "KeyY",
  35: "KeyU",
  36: "KeyI",
  37: "KeyO",
  38: "KeyP",
  39: "BracketLeft",
  40: "BracketRight",
  41: "Backslash",
  42: "CapsLock",
  43: "KeyA",
  44: "KeyS",
  45: "KeyD",
  46: "KeyF",
  47: "KeyG",
  48: "KeyH",
  49: "KeyJ",
  50: "KeyK",
  51: "KeyL",
  52: "Semicolon",
  53: "Quote",
  54: "Enter",
  55: "ShiftLeft",
  56: "KeyZ",
  57: "KeyX",
  58: "KeyC",
  59: "KeyV",
  60: "KeyB",
  61: "KeyN",
  62: "KeyM",
  63: "Comma",
  64: "Period",
  65: "Slash",
  66: "ShiftRight",
  67: "ControlLeft",
  68: "MetaLeft",
  69: "AltLeft",
  70: "Space",
  71: "AltRight",
  72: "MetaRight",
  73: "ContextMenu",
  74: "ControlRight",
  75: "PrintScreen",
  76: "ScrollLock",
  77: "Pause",
  78: "Insert",
  79: "Home",
  80: "PageUp",
  81: "Delete",
  82: "End",
  83: "PageDown",
  84: "ArrowUp",
  85: "ArrowLeft",
  86: "ArrowDown",
  87: "ArrowRight",
  88: "NumLock",
  89: "NumpadDivide",
  90: "NumpadMultiply",
  91: "NumpadSubtract",
  92: "NumpadAdd",
  93: "NumpadEnter",
  94: "Numpad1",
  95: "Numpad2",
  96: "Numpad3",
  97: "Numpad4",
  98: "Numpad5",
  99: "Numpad6",
  100: "Numpad7",
  101: "Numpad8",
  102: "Numpad9",
  103: "Numpad0",
  104: "NumpadDecimal",
  105: "IntlBackslash",
  106: "IntlRo",
  107: "IntlYen",
  108: "Convert",
  109: "NonConvert",
  110: "KanaMode",
  111: "Lang1",
  112: "Lang2",
  113: "F13",
  114: "F14",
  115: "F15",
  116: "F16",
  117: "F17",
  118: "F18",
  119: "F19",
  120: "F20",
  121: "F21",
  122: "F22",
  123: "F23",
  124: "F24",
  125: "NumpadEqual",
  126: "NumpadComma",
  127: "NumpadParenLeft",
  128: "NumpadParenRight",
  129: "Lang3",
  130: "Lang4",
  131: "Lang5",
  132: "Fn",
  133: "VolumeMute",
  134: "VolumeDown",
  135: "VolumeUp",
  136: "MediaTrackNext",
  137: "MediaTrackPrevious",
  138: "MediaStop",
  139: "MediaPlayPause",
  140: "LaunchMail",
  141: "LaunchApp1",
  142: "LaunchApp2",
  143: "BrowserSearch",
  144: "BrowserHome",
  145: "BrowserBack",
  146: "BrowserForward",
  147: "BrowserRefresh",
  148: "BrowserStop",
  149: "BrowserFavorites"
})

export const FAB_BUTTON_SHORTCUT_CODE_TO_ID: Readonly<Record<string, number>> = Object.freeze(
  Object.entries(FAB_BUTTON_SHORTCUT_ID_TO_CODE).reduce<Record<string, number>>((map, [id, code]) => {
    map[code] = Number(id)
    return map
  }, {})
)

const KNOWN_SHORTCUT_CODES = new Set(
  Object.values(FAB_BUTTON_SHORTCUT_ID_TO_CODE).map((value) => value.trim().toLowerCase())
)

const normalizeKeyValue = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const lowered = trimmed.toLowerCase()
  return KEY_ALIASES[lowered] ?? lowered
}

const normalizeCodeValue = (value: string) => value.trim().toLowerCase()

const toShortcutIdCodeToken = (shortcutId: number) => {
  const code = FAB_BUTTON_SHORTCUT_ID_TO_CODE[shortcutId]
  if (!code) return null
  const normalizedCode = normalizeCodeValue(code)
  return normalizedCode ? `code:${normalizedCode}` : null
}

const normalizeNumericShortcutTokens = (value: number): string[] => {
  if (!Number.isFinite(value)) return []

  const numeric = Math.trunc(value)
  if (numeric >= 0 && numeric <= 9) {
    return [`key:${numeric}`, `code:digit${numeric}`]
  }

  return [`keycode:${numeric}`]
}

const toCodeToken = (value: string) => {
  const normalizedCode = normalizeCodeValue(value)
  if (!normalizedCode) return null
  if (KNOWN_SHORTCUT_CODES.has(normalizedCode) || BASIC_CODE_PATTERN.test(value)) {
    return `code:${normalizedCode}`
  }
  return null
}

const normalizeShortcutTokens = (value: FabButtonShortcutKey): string[] => {
  if (typeof value === "number") {
    return normalizeNumericShortcutTokens(value)
  }

  const raw = `${value}`.trim()
  if (!raw) return []

  const lowered = raw.toLowerCase()

  if (lowered.startsWith("keycode:")) {
    const numeric = lowered.slice("keycode:".length).trim()
    if (!/^\d+$/.test(numeric)) return []
    return [`keycode:${Number(numeric)}`]
  }

  if (lowered.startsWith("id:") || lowered.startsWith("shortcutid:")) {
    const tokenPrefix = lowered.startsWith("id:") ? "id:" : "shortcutid:"
    const numeric = lowered.slice(tokenPrefix.length).trim()
    if (!/^\d+$/.test(numeric)) return []
    const shortcutIdCodeToken = toShortcutIdCodeToken(Number(numeric))
    return shortcutIdCodeToken ? [shortcutIdCodeToken] : []
  }

  if (lowered.startsWith("code:")) {
    const codeValue = normalizeCodeValue(lowered.slice("code:".length))
    return codeValue ? [`code:${codeValue}`] : []
  }

  if (lowered.startsWith("key:")) {
    const keyValue = normalizeKeyValue(lowered.slice("key:".length))
    return keyValue ? [`key:${keyValue}`] : []
  }

  if (/^\d+$/.test(raw)) {
    return normalizeNumericShortcutTokens(Number(raw))
  }

  const codeToken = toCodeToken(raw)
  if (codeToken) {
    return [codeToken]
  }

  const keyValue = normalizeKeyValue(raw)
  return keyValue ? [`key:${keyValue}`] : []
}

const toShortcutValues = (shortcut?: FabButtonSectionShortcut): FabButtonShortcutKey[] => {
  if (shortcut === undefined) return []
  if (typeof shortcut === "string" && shortcut.includes(",")) {
    return shortcut
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  }
  return Array.isArray(shortcut) ? shortcut : [shortcut]
}

const toShortcutIds = (shortcutId: unknown): number[] => {
  if (shortcutId === undefined || shortcutId === null) return []

  const normalizeValue = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
    if (typeof value !== "string") return null

    const trimmed = value.trim()
    if (!trimmed) return null

    const lowered = trimmed.toLowerCase()
    if (lowered.startsWith("id:") || lowered.startsWith("shortcutid:")) {
      const tokenPrefix = lowered.startsWith("id:") ? "id:" : "shortcutid:"
      const idValue = lowered.slice(tokenPrefix.length).trim()
      if (!/^\d+$/.test(idValue)) return null
      return Number(idValue)
    }

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
        .map((item) => Math.trunc(item))
    }

    const numeric = Number(trimmed)
    if (!Number.isFinite(numeric)) return null
    return Math.trunc(numeric)
  }

  if (Array.isArray(shortcutId)) {
    return shortcutId.reduce<number[]>((ids, value) => {
      const normalized = normalizeValue(value)
      if (Array.isArray(normalized)) {
        ids.push(...normalized)
      } else if (typeof normalized === "number") {
        ids.push(normalized)
      }
      return ids
    }, [])
  }

  const normalized = normalizeValue(shortcutId)
  if (Array.isArray(normalized)) return normalized
  if (typeof normalized === "number") return [normalized]
  return []
}

const getSectionShortcutTokens = (section: FabButtonSectionBase) => {
  const tokens = new Set<string>()

  const shortcutIdTokens = toShortcutIds(section.shortcutId)
    .map((shortcutId) => toShortcutIdCodeToken(shortcutId))
    .filter((token): token is string => Boolean(token))
  shortcutIdTokens.forEach((token) => tokens.add(token))

  const explicitShortcutTokens = toShortcutValues(section.shortcut)
    .flatMap((value) => normalizeShortcutTokens(value))
    .filter((value): value is string => Boolean(value))
  explicitShortcutTokens.forEach((token) => tokens.add(token))

  if (tokens.size) {
    return Array.from(tokens)
  }

  const keyFallback = section.key.trim()
  if (keyFallback) {
    if (/^\d+$/.test(keyFallback)) {
      normalizeNumericShortcutTokens(Number(keyFallback)).forEach((token) => tokens.add(token))
    } else {
      const codeToken = toCodeToken(keyFallback)
      if (codeToken) {
        tokens.add(codeToken)
      } else if (keyFallback.length === 1) {
        normalizeShortcutTokens(keyFallback).forEach((token) => tokens.add(token))
      }
    }
  }

  return Array.from(tokens)
}

const getEventShortcutTokens = (event: FabButtonShortcutEventLike) => {
  const tokens = new Set<string>()

  const normalizedKey = normalizeKeyValue(event.key ?? "")
  if (normalizedKey) tokens.add(`key:${normalizedKey}`)

  if (event.code) {
    const normalizedCode = normalizeCodeValue(event.code)
    if (normalizedCode) tokens.add(`code:${normalizedCode}`)
  }

  if (typeof event.keyCode === "number" && Number.isFinite(event.keyCode)) {
    tokens.add(`keycode:${Math.trunc(event.keyCode)}`)
  }

  if (typeof event.which === "number" && Number.isFinite(event.which)) {
    tokens.add(`keycode:${Math.trunc(event.which)}`)
  }

  return tokens
}

export const isEditableEventTarget = (target: EventTarget | null | undefined) => {
  if (!target || typeof Element === "undefined" || !(target instanceof Element)) return false
  if (target instanceof HTMLElement && target.isContentEditable) return true
  if (target.matches(EDITABLE_SELECTOR)) return true
  return Boolean(target.closest(EDITABLE_SELECTOR))
}

export const shouldHandleShortcutEvent = (event: FabButtonShortcutEventLike) => {
  if (event.defaultPrevented) return false
  if (event.isComposing) return false
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  if (isEditableEventTarget(event.target ?? null)) return false
  return true
}

export const getShortcutSectionIndex = <T extends FabButtonSectionBase>(
  sections: T[],
  event: FabButtonShortcutEventLike,
  isRootDisabled = false
) => {
  if (isRootDisabled) return null
  if (!shouldHandleShortcutEvent(event)) return null

  const eventTokens = getEventShortcutTokens(event)
  if (!eventTokens.size) return null

  for (const [index, section] of sections.entries()) {
    if (section.disabled) continue
    const shortcutTokens = getSectionShortcutTokens(section)
    if (!shortcutTokens.length) continue
    if (shortcutTokens.some((token) => eventTokens.has(token))) {
      return index
    }
  }

  return null
}

export const getEnabledSectionIndices = <T extends { disabled?: boolean }>(
  sections: T[],
  isRootDisabled = false
) => {
  if (isRootDisabled) return []
  return sections.reduce<number[]>((enabled, section, index) => {
    if (!section.disabled) enabled.push(index)
    return enabled
  }, [])
}

export const getNavigationCommand = (
  key: string,
  orientation: FabButtonKeyboardOrientation = "horizontal"
): FabButtonNavigationCommand => {
  if (key === "Home") return "first"
  if (key === "End") return "last"

  if (orientation === "horizontal") {
    if (key === "ArrowLeft") return "prev"
    if (key === "ArrowRight") return "next"
    return null
  }

  if (orientation === "vertical") {
    if (key === "ArrowUp") return "prev"
    if (key === "ArrowDown") return "next"
    return null
  }

  if (key === "ArrowLeft" || key === "ArrowUp") return "prev"
  if (key === "ArrowRight" || key === "ArrowDown") return "next"
  return null
}

export const resolveSectionIndex = ({
  command,
  currentIndex,
  enabledIndices,
  loop = true
}: ResolveSectionIndexOptions) => {
  if (!enabledIndices.length) return null
  if (command === "first") return enabledIndices[0]
  if (command === "last") return enabledIndices[enabledIndices.length - 1]

  const currentPosition = enabledIndices.indexOf(currentIndex)
  const fallbackPosition = 0
  const basePosition = currentPosition === -1 ? fallbackPosition : currentPosition

  if (command === "next") {
    const nextPosition = basePosition + 1
    if (nextPosition < enabledIndices.length) return enabledIndices[nextPosition]
    return loop ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1]
  }

  const previousPosition = basePosition - 1
  if (previousPosition >= 0) return enabledIndices[previousPosition]
  return loop ? enabledIndices[enabledIndices.length - 1] : enabledIndices[0]
}
