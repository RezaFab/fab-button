import "@rezafab/fab-button-styles/style.css"
import { FabButtonElement, defineFabButtonElement } from "./element"
export {
  configureFabButton,
  createFabButtonConfig,
  getFabButtonConfig,
  getFabButtonCssMode,
  resetFabButtonConfig
} from "@rezafab/fab-button-core"
export type { FabButtonStyleConfig, FabButtonLibraryClassMap } from "@rezafab/fab-button-core"

export { FabButtonElement, defineFabButtonElement }

defineFabButtonElement()
