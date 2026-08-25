import { useState, type HTMLAttributes, type ReactNode } from "react"
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "../cn"

interface Props<T> {
  items: T[]
  getKey: (item: T, index: number) => string
  /** Receives the reordered array; the list stays controlled by the app. */
  onReorder: (next: T[]) => void
  /** Render one row. Spread `handle` on your drag handle button. */
  renderItem: (item: T, handle: HTMLAttributes<HTMLButtonElement>, dragging: boolean) => ReactNode
  className?: string
}

/**
 * Vertical drag-to-reorder list (dnd-kit under the hood). Keyboard and touch
 * work via the same handle. This is what powers notebook-cell reordering;
 * pass each cell's dragHandleProps through like SandboxCell expects.
 */
export function SortedList<T>({ items, getKey, onReorder, renderItem, className }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: { active: { id: unknown }; over: { id: unknown } | null }) {
    if (!event.over) return
    const from = items.findIndex((_, i) => getKey(items[i], i) === event.active.id)
    const to = items.findIndex((_, i) => getKey(items[i], i) === event.over!.id)
    if (from < 0 || to < 0 || from === to) return
    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item, i) => getKey(item, i))} strategy={verticalListSortingStrategy}>
        <div className={cn("ui-sortlist", className)}>
          {items.map((item, i) => (
            <SortableRow key={getKey(item, i)} id={getKey(item, i)} renderItem={renderItem} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow<T>({ id, item, renderItem }: { id: string; item: T; renderItem: Props<T>["renderItem"] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [handleProps] = useState<HTMLAttributes<HTMLButtonElement>>(() => ({
    ...attributes,
    ...listeners,
    title: "Drag to reorder",
  }))

  return (
    <div
      ref={setNodeRef}
      className={cn("ui-sortlist-row", isDragging && "ui-sortlist-row--dragging")}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {renderItem(item, handleProps, isDragging)}
    </div>
  )
}
