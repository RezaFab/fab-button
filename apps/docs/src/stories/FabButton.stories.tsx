import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { FAB_BUTTON_SHORTCUT_ID_TO_CODE, FabButton } from "@rezafab/fab-button-react"


const meta = {
  title: "FabButton/Examples",
  component: FabButton,
  args: {
    theme: "light"
  },
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"]
    }
  }
} satisfies Meta<typeof FabButton>

export default meta

type Story = StoryObj<typeof meta>

interface KeyboardLayoutKey {
  id: number
  span?: number
}

const KEY_UNIT_WIDTH = 56
const KEY_GAP = 8

const QWERTY_ROWS: KeyboardLayoutKey[][] = [
  [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
    { id: 75 },
    { id: 76 },
    { id: 77 }
  ],
  [
    { id: 14 },
    { id: 15 },
    { id: 16 },
    { id: 17 },
    { id: 18 },
    { id: 19 },
    { id: 20 },
    { id: 21 },
    { id: 22 },
    { id: 23 },
    { id: 24 },
    { id: 25 },
    { id: 26 },
    { id: 27, span: 2.2 }
  ],
  [
    { id: 28, span: 1.5 },
    { id: 29 },
    { id: 30 },
    { id: 31 },
    { id: 32 },
    { id: 33 },
    { id: 34 },
    { id: 35 },
    { id: 36 },
    { id: 37 },
    { id: 38 },
    { id: 39 },
    { id: 40 },
    { id: 41, span: 1.5 }
  ],
  [
    { id: 42, span: 1.8 },
    { id: 43 },
    { id: 44 },
    { id: 45 },
    { id: 46 },
    { id: 47 },
    { id: 48 },
    { id: 49 },
    { id: 50 },
    { id: 51 },
    { id: 52 },
    { id: 53 },
    { id: 54, span: 2.2 }
  ],
  [
    { id: 55, span: 2.2 },
    { id: 56 },
    { id: 57 },
    { id: 58 },
    { id: 59 },
    { id: 60 },
    { id: 61 },
    { id: 62 },
    { id: 63 },
    { id: 64 },
    { id: 65 },
    { id: 66, span: 2.4 }
  ],
  [
    { id: 67, span: 1.4 },
    { id: 68 },
    { id: 69 },
    { id: 70, span: 4.6 },
    { id: 71 },
    { id: 72 },
    { id: 73 },
    { id: 74, span: 1.4 }
  ]
]

const NAVIGATION_ROWS: KeyboardLayoutKey[][] = [
  [{ id: 78 }, { id: 79 }, { id: 80 }],
  [{ id: 81 }, { id: 82 }, { id: 83 }],
  [{ id: 84 }],
  [{ id: 85 }, { id: 86 }, { id: 87 }]
]

const NUMPAD_ROWS: KeyboardLayoutKey[][] = [
  [{ id: 88 }, { id: 89 }, { id: 90 }, { id: 91 }],
  [{ id: 100 }, { id: 101 }, { id: 102 }, { id: 92 }],
  [{ id: 97 }, { id: 98 }, { id: 99 }],
  [{ id: 94 }, { id: 95 }, { id: 96 }, { id: 93 }],
  [{ id: 103, span: 2.2 }, { id: 104 }]
]

const NUMPAD_EXTRA_ROWS: KeyboardLayoutKey[][] = [[{ id: 125 }, { id: 126 }], [{ id: 127 }, { id: 128 }]]

const KEY_LABEL_OVERRIDES: Record<string, string> = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Backspace: "Backspace",
  Tab: "Tab",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  CapsLock: "Caps",
  Semicolon: ";",
  Quote: "'",
  Enter: "Enter",
  ShiftLeft: "Shift L",
  ShiftRight: "Shift R",
  ControlLeft: "Ctrl L",
  ControlRight: "Ctrl R",
  MetaLeft: "Meta L",
  MetaRight: "Meta R",
  AltLeft: "Alt L",
  AltRight: "Alt R",
  Space: "Space",
  ContextMenu: "Menu",
  PrintScreen: "PrtSc",
  ScrollLock: "Scroll",
  Pause: "Pause",
  Insert: "Insert",
  Delete: "Delete",
  Home: "Home",
  End: "End",
  PageUp: "PgUp",
  PageDown: "PgDn",
  ArrowUp: "Up",
  ArrowLeft: "Left",
  ArrowDown: "Down",
  ArrowRight: "Right",
  NumLock: "NumLock",
  NumpadDivide: "Num /",
  NumpadMultiply: "Num *",
  NumpadSubtract: "Num -",
  NumpadAdd: "Num +",
  NumpadEnter: "Num Enter",
  NumpadDecimal: "Num .",
  NumpadEqual: "Num =",
  NumpadComma: "Num ,",
  NumpadParenLeft: "Num (",
  NumpadParenRight: "Num )",
  IntlBackslash: "Intl \\",
  IntlRo: "Intl Ro",
  IntlYen: "Intl Yen",
  Convert: "Convert",
  NonConvert: "NonConv",
  KanaMode: "Kana",
  Lang1: "Lang1",
  Lang2: "Lang2",
  Lang3: "Lang3",
  Lang4: "Lang4",
  Lang5: "Lang5",
  Fn: "Fn",
  VolumeMute: "Mute",
  VolumeDown: "Vol -",
  VolumeUp: "Vol +",
  MediaTrackNext: "Track +",
  MediaTrackPrevious: "Track -",
  MediaStop: "Stop",
  MediaPlayPause: "Play/Pause",
  LaunchMail: "Mail",
  LaunchApp1: "App1",
  LaunchApp2: "App2",
  BrowserSearch: "Search",
  BrowserHome: "Home",
  BrowserBack: "Back",
  BrowserForward: "Forward",
  BrowserRefresh: "Refresh",
  BrowserStop: "Stop",
  BrowserFavorites: "Fav"
}

const getKeyboardKeyLabel = (code: string) => {
  if (KEY_LABEL_OVERRIDES[code]) return KEY_LABEL_OVERRIDES[code]
  if (/^Key[A-Z]$/.test(code)) return code.replace("Key", "")
  if (/^Digit[0-9]$/.test(code)) return code.replace("Digit", "")
  if (/^F[0-9]{1,2}$/.test(code)) return code
  if (/^Numpad[0-9]$/.test(code)) return `Num ${code.replace("Numpad", "")}`
  return code
}

const getKeyWidth = (span = 1) => `${Math.round(span * KEY_UNIT_WIDTH + (span - 1) * KEY_GAP)}px`
const chunkIds = (ids: number[], size: number) => {
  const chunks: number[][] = []
  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size))
  }
  return chunks
}

const renderKeyboardKey = (item: KeyboardLayoutKey, compact = false) => {
  const code = FAB_BUTTON_SHORTCUT_ID_TO_CODE[item.id] ?? "Unknown"
  return (
    <article
      key={`${item.id}-${compact ? "compact" : "normal"}`}
      className={`kbd-map__key${compact ? " kbd-map__key--compact" : ""}`}
      style={{ width: compact ? undefined : getKeyWidth(item.span) }}
    >
      <span className="kbd-map__id">{item.id}</span>
      <span className="kbd-map__label">{getKeyboardKeyLabel(code)}</span>
      <span className="kbd-map__code">{code}</span>
    </article>
  )
}

const KeyboardLayoutMap = () => {
  const allIds = Object.keys(FAB_BUTTON_SHORTCUT_ID_TO_CODE)
    .map((id) => Number(id))
    .sort((first, second) => first - second)
  const standardIds = allIds.filter((id) => id >= 1 && id <= 104)
  const additionalIds = allIds.filter((id) => id >= 105)
  const standardRows = chunkIds(standardIds, 4)
  const additionalRows = chunkIds(additionalIds, 4)

  const renderTableRows = (rows: number[][], prefix: string) =>
    rows.map((row, rowIndex) => (
      <tr key={`${prefix}-row-${rowIndex}`}>
        {Array.from({ length: 4 }, (_, columnIndex) => {
          const id = row[columnIndex]
          if (id === undefined) {
            return (
              <td key={`${prefix}-${rowIndex}-${columnIndex}-id`} className="kbd-map__table-empty" />
            )
          }
          return [
            <td key={`${prefix}-${rowIndex}-${columnIndex}-id`}>{id}</td>,
            <td key={`${prefix}-${rowIndex}-${columnIndex}-code`}>{FAB_BUTTON_SHORTCUT_ID_TO_CODE[id]}</td>
          ]
        }).flat()}
      </tr>
    ))

  return (
    <section className="kbd-map">
      <header className="kbd-map__header">
        <h2>FAB Button Keyboard Mapping 1-149</h2>
        <p>ID shortcut dan KeyboardEvent.code dalam format tabel.</p>
      </header>

      <article className="kbd-map__panel">
        <h3>100% Full-Size Keyboard (104 Keys)</h3>
        <table className="kbd-map__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(standardRows, "standard")}</tbody>
        </table>
      </article>

      <article className="kbd-map__panel">
        <h3>Additional Keys (Non 100%)</h3>
        <table className="kbd-map__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
              <th>ID</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(additionalRows, "additional")}</tbody>
        </table>
      </article>
    </section>
  )
}

export const Default: Story = {
  args: {
    variant: "default",
    sections: [{ key: "main", content: "FabButton Default" }]
  }
}

export const TechStackButton: Story = {
  args: {
    variant: "primary",
    sections: [
      { key: "js", content: "JS" },
      { key: "ts", content: "TS" },
      { key: "vite", content: "Vite" }
    ]
  }
}

export const IconLabelCountButton: Story = {
  args: {
    shape: "pill",
    sections: [
      { key: "icon", content: "Bell", ariaLabel: "Notification icon" },
      { key: "label", content: "Alerts" },
      { key: "count", content: "12" }
    ]
  }
}

export const PuzzleButtonFourActions: Story = {
  args: {
    layout: "grid",
    columns: "repeat(2, minmax(84px, 1fr))",
    rows: "repeat(2, minmax(42px, auto))",
    gap: "6px",
    sections: [
      { key: "up", content: "Up", onClick: () => undefined, ariaLabel: "Move up" },
      { key: "left", content: "Left", onClick: () => undefined, ariaLabel: "Move left" },
      { key: "right", content: "Right", onClick: () => undefined, ariaLabel: "Move right" },
      { key: "down", content: "Down", onClick: () => undefined, ariaLabel: "Move down" }
    ]
  }
}

export const ToolbarKeyboardNavigation: Story = {
  args: {
    keyboardNavigation: "toolbar",
    keyboardOrientation: "horizontal",
    loopNavigation: true,
    sections: [
      { key: "copy", content: "Copy", onClick: () => undefined, ariaLabel: "Copy item" },
      { key: "share", content: "Share", onClick: () => undefined, ariaLabel: "Share item" },
      { key: "save", content: "Save", onClick: () => undefined, ariaLabel: "Save item" }
    ]
  }
}

const KeyboardShortcutActionsDemo = () => {
  const [lastAction, setLastAction] = useState("None")

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
        Built-in shortcuts: <strong>1</strong> (direct key), <strong>ID 16</strong> (Digit2),{" "}
        <strong>ID 17</strong> (Digit3)
      </p>
      <FabButton
        keyboardNavigation="toolbar"
        sections={[
          {
            key: "copy",
            shortcut: "1",
            content: "Copy",
            onClick: () => setLastAction("Copy")
          },
          {
            key: "share",
            shortcutId: 16,
            content: "Share",
            onClick: () => setLastAction("Share")
          },
          {
            key: "save",
            shortcutId: 17,
            content: "Save",
            onClick: () => setLastAction("Save")
          }
        ]}
      />
      <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Last action: {lastAction}</p>
    </div>
  )
}

export const KeyboardShortcutIntegration: Story = {
  render: () => <KeyboardShortcutActionsDemo />,
  args: {
    sections: []
  }
}

export const FullKeyboardShortcutIdMap: Story = {
  render: () => <KeyboardLayoutMap />,
  args: {
    sections: []
  },
  parameters: {
    layout: "fullscreen"
  }
}

export const LegacyCSSIntegration: Story = {
  render: (args) => (
    <div className="legacy-wrapper">
      <FabButton {...args} />
    </div>
  ),
  args: {
    variant: "outline",
    sections: [
      { key: "name", content: "Legacy UI" },
      { key: "status", content: "Compatible" }
    ]
  }
}

export const TailwindLikeClassNameExample: Story = {
  args: {
    className: "tailwind-like",
    unstyled: true,
    sections: [
      { key: "left", content: "Tailwind-like" },
      { key: "right", content: "Class Name API" }
    ]
  }
}

export const UnstyledMode: Story = {
  args: {
    unstyled: true,
    style: {
      display: "inline-flex",
      border: "2px dashed #6366f1",
      borderRadius: "12px",
      padding: "4px",
      gap: "6px",
      fontFamily: "monospace"
    },
    sections: [
      {
        key: "slot-1",
        content: "Unstyled",
        style: {
          padding: "8px 12px",
          background: "#e0e7ff",
          borderRadius: "8px"
        }
      },
      {
        key: "slot-2",
        content: "Custom Painted",
        style: {
          padding: "8px 12px",
          background: "#c7d2fe",
          borderRadius: "8px"
        }
      }
    ]
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    sections: [
      { key: "label", content: "Disabled" },
      { key: "hint", content: "No action" }
    ]
  }
}

export const Loading: Story = {
  args: {
    loading: true,
    sections: [{ key: "label", content: "Submit" }]
  }
}

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    variant: "default",
    sections: [
      { key: "label", content: "Dark Theme" },
      { key: "state", content: "Native Support" }
    ]
  }
}
