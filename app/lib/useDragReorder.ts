import { useState } from "react";
import type { DragEvent } from "react";

// Native drag-and-drop reordering. Spread getItemProps(id) onto each draggable
// element; dropping one item onto another moves it to that item's position.
export function useDragReorder(onReorder: (fromId: string, toId: string) => void) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function reset() {
    setDragId(null);
    setOverId(null);
  }

  function getItemProps(id: string) {
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id); // Firefox won't start a drag without data
        setDragId(id);
      },
      onDragOver: (e: DragEvent) => {
        if (dragId === null) return; // ignore drags that didn't start on one of our items
        e.preventDefault(); // allows dropping here
        e.dataTransfer.dropEffect = "move";
        if (overId !== id) setOverId(id);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        if (dragId !== null) onReorder(dragId, id);
        reset();
      },
      onDragEnd: reset,
    };
  }

  return { dragId, overId, getItemProps };
}
