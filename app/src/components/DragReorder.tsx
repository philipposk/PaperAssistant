import { useCallback, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { type FileRecord } from "../lib/db";

export function useDragReorder(
  items: FileRecord[],
  onReorder: (orderedIds: string[]) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return;
      const ids = items.map((f) => f.id);
      const from = ids.indexOf(dragId);
      const to = ids.indexOf(targetId);
      if (from < 0 || to < 0) return;
      const next = [...ids];
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      onReorder(next);
      setDragId(null);
    },
    [dragId, items, onReorder],
  );

  const onDragEnd = useCallback(() => setDragId(null), []);

  return { dragId, onDragStart, onDragOver, onDrop, onDragEnd };
}

export function DragHandle({ className }: { className?: string }) {
  return (
    <GripVertical
      size={16}
      className={`text-[var(--color-ink-4)] cursor-grab active:cursor-grabbing shrink-0 ${className ?? ""}`}
    />
  );
}

export function DraggableShell({
  id,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children,
}: {
  id: string;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (targetId: string) => void;
  onDragEnd: () => void;
  children: ReactNode;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(id);
      }}
      onDragEnd={onDragEnd}
      className={`transition-opacity ${dragging ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
