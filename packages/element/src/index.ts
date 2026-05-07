import "@rezafab/fab-button-styles/style.css"
import { FabButtonElement, defineFabButtonElement } from "./element"
export {
  configureFabButton,
  createFabButtonConfig,
  getFabButtonConfig,
  getFabButtonCssMode,
  resetFabButtonConfig,
  visibleWhen,
  disabledWhen
} from "@rezafab/fab-button-core"
export type {
  FabButtonStyleConfig,
  FabButtonLibraryClassMap,
  FabButtonSectionGuard,
  FabButtonSectionActionMeta,
  FabButtonSectionActionSource
} from "@rezafab/fab-button-core"

export { FabButtonElement, defineFabButtonElement }

defineFabButtonElement()
