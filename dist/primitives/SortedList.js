import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../cn";
/**
 * Vertical drag-to-reorder list (dnd-kit under the hood). Keyboard and touch
 * work via the same handle. This is what powers notebook-cell reordering;
 * pass each cell's dragHandleProps through like SandboxCell expects.
 */
export function SortedList({ items, getKey, onReorder, renderItem, className }) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    function handleDragEnd(event) {
        if (!event.over)
            return;
        const from = items.findIndex((_, i) => getKey(items[i], i) === event.active.id);
        const to = items.findIndex((_, i) => getKey(items[i], i) === event.over.id);
        if (from < 0 || to < 0 || from === to)
            return;
        onReorder(arrayMove(items, from, to));
    }
    return (_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: _jsx(SortableContext, { items: items.map((item, i) => getKey(item, i)), strategy: verticalListSortingStrategy, children: _jsx("div", { className: cn("ui-sortlist", className), children: items.map((item, i) => (_jsx(SortableRow, { id: getKey(item, i), renderItem: renderItem, item: item }, getKey(item, i)))) }) }) }));
}
function SortableRow({ id, item, renderItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const [handleProps] = useState(() => ({
        ...attributes,
        ...listeners,
        title: "Drag to reorder",
    }));
    return (_jsx("div", { ref: setNodeRef, className: cn("ui-sortlist-row", isDragging && "ui-sortlist-row--dragging"), style: { transform: CSS.Transform.toString(transform), transition }, children: renderItem(item, handleProps, isDragging) }));
}
