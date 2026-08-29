import { COMPOSITE_TYPE, STACK_TYPE, type Block, type CustomComponent, type Row } from "./types"
import { REGISTRY_MAP } from "./registry"
import { parseCssText } from "./cssText"

function styleObjectSource(entries: Record<string, string>): string {
  const pairs = Object.entries(entries).map(([k, v]) => `${k}: "${v.replace(/"/g, '\\"')}"`)
  return `{ ${pairs.join(", ")} }`
}

function blockWrapperStyle(b: Block, extra?: Record<string, string>): Record<string, string> {
  return { ...extra, ...(b.customCss ? parseCssText(b.customCss) : null) }
}

function collectImports(rows: Row[], customComponents: CustomComponent[], imports: Set<string>) {
  for (const r of rows) {
    for (const b of r.blocks) {
      if (b.type === COMPOSITE_TYPE) {
        const composite = customComponents.find((c) => c.id === b.compositeId)
        if (composite) collectImports(composite.rows, customComponents, imports)
        continue
      }
      if (b.type === STACK_TYPE) {
        if (b.stackRows) collectImports(b.stackRows, customComponents, imports)
        continue
      }
      const def = REGISTRY_MAP.get(b.type)
      if (def) for (const imp of def.imports) imports.add(imp)
      if (b.stackRows) collectImports(b.stackRows, customComponents, imports)
    }
  }
}

function emitBlock(b: Block, indent: string, customComponents: CustomComponent[], lines: string[], blockLines: Record<string, [number, number]>, extraStyle?: Record<string, string>) {
  if (b.type === COMPOSITE_TYPE) {
    const composite = customComponents.find((c) => c.id === b.compositeId)
    const style = blockWrapperStyle(b, extraStyle)
    const start = lines.length + 1
    lines.push(Object.keys(style).length ? `${indent}<div style={${styleObjectSource(style)}}>` : `${indent}<div>`)
    if (composite) emitRows(composite.rows, `${indent}  `, customComponents, lines, blockLines)
    lines.push(`${indent}</div>`)
    blockLines[b.id] = [start, lines.length]
    return
  }

  if (b.type === STACK_TYPE) {
    const style = blockWrapperStyle(b, extraStyle)
    const start = lines.length + 1
    lines.push(`${indent}<div style={${styleObjectSource({ display: "flex", flexDirection: "column", gap: "1rem", ...style })}}>`)
    if (b.stackRows) emitRows(b.stackRows, `${indent}  `, customComponents, lines, blockLines)
    lines.push(`${indent}</div>`)
    blockLines[b.id] = [start, lines.length]
    return
  }

  const def = REGISTRY_MAP.get(b.type)
  if (!def) {
    lines.push(`${indent}{/* unknown: ${b.type} */}`)
    return
  }

  if (def.container && b.stackRows && b.stackRows.length > 0 && def.codeOpen && def.codeClose) {
    const style = blockWrapperStyle(b, extraStyle)
    const start = lines.length + 1
    const innerIndent = Object.keys(style).length ? `${indent}    ` : `${indent}  `
    if (Object.keys(style).length) lines.push(`${indent}<div style={${styleObjectSource(style)}}>`)
    lines.push(`${Object.keys(style).length ? `${indent}  ` : indent}${def.codeOpen(b.props)}`)
    emitRows(b.stackRows, innerIndent, customComponents, lines, blockLines)
    lines.push(`${Object.keys(style).length ? `${indent}  ` : indent}${def.codeClose()}`)
    if (Object.keys(style).length) lines.push(`${indent}</div>`)
    blockLines[b.id] = [start, lines.length]
    return
  }

  const start = lines.length + 1
  if (extraStyle || b.customCss) {
    lines.push(`${indent}<div style={${styleObjectSource(blockWrapperStyle(b, extraStyle))}}>`)
    for (const line of def.code(b.props).split("\n")) lines.push(`${indent}  ${line}`)
    lines.push(`${indent}</div>`)
  } else {
    for (const line of def.code(b.props).split("\n")) lines.push(`${indent}${line}`)
  }
  blockLines[b.id] = [start, lines.length]
}

function emitRows(rows: Row[], indent: string, customComponents: CustomComponent[], lines: string[], blockLines: Record<string, [number, number]>) {
  for (const r of rows) {
    if (r.blocks.length === 1) {
      emitBlock(r.blocks[0]!, indent, customComponents, lines, blockLines)
    } else {
      lines.push(`${indent}<div style={{ display: "flex", gap: "1rem" }}>`)
      for (const b of r.blocks) {
        emitBlock(b, `${indent}  `, customComponents, lines, blockLines, { flex: `${b.layout.w} ${b.layout.w} 0%`, minWidth: "0" })
      }
      lines.push(`${indent}</div>`)
    }
    lines.push("")
  }
  if (lines[lines.length - 1] === "") lines.pop()
}

export type GeneratedCode = {
  code: string
  // 1-indexed [firstLine, lastLine] each block occupies in `code` — lets the
  // code panel glow the JSX that belongs to whatever is selected on canvas.
  blockLines: Record<string, [number, number]>
}

export function generateCode(rows: Row[], customComponents: CustomComponent[]): GeneratedCode {
  if (rows.length === 0) {
    return {
      code: `// Drag components from the palette to start.
// Your JSX will appear here.

import "@mukco/ui-kit/ui.css"
`,
      blockLines: {},
    }
  }

  const imports = new Set<string>()
  collectImports(rows, customComponents, imports)

  const importLine = imports.size
    ? `import { ${[...imports].sort().join(", ")} } from "@mukco/ui-kit"`
    : `import "@mukco/ui-kit/ui.css"`

  const lines: string[] = [
    importLine,
    `import "@mukco/ui-kit/ui.css"`,
    "",
    "export function Demo() {",
    "  return (",
    `    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>`,
  ]
  const blockLines: Record<string, [number, number]> = {}

  emitRows(rows, "      ", customComponents, lines, blockLines)

  lines.push("    </div>", "  )", "}", "")

  return { code: lines.join("\n"), blockLines }
}

export function generateJson(rows: Row[]): string {
  return JSON.stringify(rows, null, 2)
}
