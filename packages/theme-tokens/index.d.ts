export interface FabButtonThemeTokens {
  color: Record<string, string>
  alpha: Record<string, string>
  radius: Record<string, string>
  spacing: Record<string, string>
  fontSize: Record<string, string>
  fontWeight: Record<string, string>
  size: {
    height: Record<"sm" | "md" | "lg", string>
  }
  transition: Record<string, string>
  button: {
    base: Record<string, string>
    variant: Record<string, Record<string, string>>
    interaction: Record<string, string>
    state: Record<string, string>
  }
}

export const fabButtonThemeTokens: FabButtonThemeTokens

export default fabButtonThemeTokens
