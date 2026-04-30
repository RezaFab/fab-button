export type FabButtonCssVarValue = string | number | undefined

export interface FabButtonCssVarOptions {
  bg?: FabButtonCssVarValue
  color?: FabButtonCssVarValue
  border?: FabButtonCssVarValue
  radius?: FabButtonCssVarValue
  height?: FabButtonCssVarValue
  fontSize?: FabButtonCssVarValue
  fontWeight?: FabButtonCssVarValue
  columns?: FabButtonCssVarValue
  rows?: FabButtonCssVarValue
  gap?: FabButtonCssVarValue
  sectionPadding?: FabButtonCssVarValue
}

const toCssVarValue = (value: FabButtonCssVarValue) =>
  typeof value === "number" ? `${value}` : value

export const getFabButtonCssVars = (options: FabButtonCssVarOptions = {}) => {
  const vars: Record<string, string> = {}

  if (options.bg !== undefined) vars["--fab-button-bg"] = toCssVarValue(options.bg) ?? ""
  if (options.color !== undefined) vars["--fab-button-color"] = toCssVarValue(options.color) ?? ""
  if (options.border !== undefined)
    vars["--fab-button-border"] = toCssVarValue(options.border) ?? ""
  if (options.radius !== undefined)
    vars["--fab-button-radius"] = toCssVarValue(options.radius) ?? ""
  if (options.height !== undefined)
    vars["--fab-button-height"] = toCssVarValue(options.height) ?? ""
  if (options.fontSize !== undefined)
    vars["--fab-button-font-size"] = toCssVarValue(options.fontSize) ?? ""
  if (options.fontWeight !== undefined)
    vars["--fab-button-font-weight"] = toCssVarValue(options.fontWeight) ?? ""
  if (options.columns !== undefined)
    vars["--fab-button-columns"] = toCssVarValue(options.columns) ?? ""
  if (options.rows !== undefined) vars["--fab-button-rows"] = toCssVarValue(options.rows) ?? ""
  if (options.gap !== undefined) vars["--fab-button-gap"] = toCssVarValue(options.gap) ?? ""
  if (options.sectionPadding !== undefined)
    vars["--fab-button-section-padding"] = toCssVarValue(options.sectionPadding) ?? ""

  return vars
}
