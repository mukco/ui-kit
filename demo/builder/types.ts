export const COMPOSITE_TYPE = "__composite__"
export const STACK_TYPE = "__stack__"

export type Block = {
  id: string
  type: string // COMPOSITE_TYPE for a saved-component instance, STACK_TYPE for an inline nested stack
  props: Record<string, unknown>
  layout: { w: number } // flex ratio relative to siblings in its row: 12 full/solo, 8 ~two-thirds, 6 half, 4 third, 3 quarter
  customCss?: string // raw "prop: value;" pairs applied to this block's wrapper — builder-only escape hatch
  compositeId?: string // set when type === COMPOSITE_TYPE — which saved component this instance renders
  // set when type === STACK_TYPE — this block's cell holds its own vertical
  // stack of rows instead of rendering a single component. Scoped to this
  // one column, live and editable (unlike a frozen composite instance).
  // Nests to any depth: a stack's own rows can themselves contain stacks.
  stackRows?: Row[]
}

// The canvas is a stack of rows; a row lays its blocks out side by side,
// sharing width by their `layout.w` ratio. A solo block always fills its row.
export type Row = {
  id: string
  blocks: Block[]
}

// A component the user saved from a multi-block selection — its own little
// row/block tree, reused by every Block instance that points at it via
// compositeId. Instances are frozen previews on canvas (drag/resize/delete
// as one unit; edit the insides by ungrouping, tweaking, and re-saving).
export type CustomComponent = {
  id: string
  name: string
  icon: string
  rows: Row[]
}

export type PropDef = {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select" | "textarea"
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  hint?: string
  min?: number
  max?: number
}

export type ComponentDef = {
  type: string
  label: string
  category: string
  icon: string
  defaults: Record<string, unknown>
  propDefs: PropDef[]
  imports: string[]
  defaultW: number // 12-col span
  render: (props: Record<string, unknown>, children?: React.ReactNode) => React.ReactNode
  code: (props: Record<string, unknown>) => string
  // Marks a component that can hold other blocks inside it (e.g. Box) — its
  // cell gets its own `Block.stackRows`, rendered as the second arg to
  // `render` instead of the plain placeholder in `props`. `codeOpen`/
  // `codeClose` give codegen the real opening/closing tags so nested blocks'
  // JSX can be spliced between them (see codegen.ts).
  container?: boolean
  codeOpen?: (props: Record<string, unknown>) => string
  codeClose?: () => string
}
