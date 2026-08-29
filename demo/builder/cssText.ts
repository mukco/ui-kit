// Raw "prop: value;" text parsing shared by the customCss escape hatch and
// the DevTools-style Styles panel. Two representations, two consumers:
//  - parseDecls/declsToCss keep kebab-case and original order — what the
//    Styles panel shows/edits, round-tripping through Block.customCss as text.
//  - parseCssText converts to camelCase keys — bracket-assigning a literal
//    kebab-case key onto a real DOM CSSStyleDeclaration (`el.style[prop] = v`)
//    silently does nothing, so applying customCss to the live node needs
//    camelCase property names instead.

export type CssDecl = { prop: string; value: string }

export function parseDecls(cssText: string): CssDecl[] {
  return cssText
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const idx = chunk.indexOf(":")
      if (idx === -1) return { prop: chunk, value: "" }
      return { prop: chunk.slice(0, idx).trim(), value: chunk.slice(idx + 1).trim() }
    })
    .filter((d) => d.prop.length > 0)
}

export function declsToCss(decls: CssDecl[]): string {
  return decls.map((d) => `${d.prop}: ${d.value};`).join("\n")
}

export function parseCssText(cssText: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { prop, value } of parseDecls(cssText)) {
    if (!value) continue
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[camel] = value
  }
  return out
}
