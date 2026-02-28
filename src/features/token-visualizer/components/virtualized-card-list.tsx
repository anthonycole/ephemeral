"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "@/features/token-visualizer/styles.module.css";

type VirtualizedCardListProps<T> = {
  items: T[];
  estimateSize: number;
  renderItem: (item: T, index: number) => ReactNode;
};

export function VirtualizedCardList<T>({ items, estimateSize, renderItem }: VirtualizedCardListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 8
  });

  return (
    <div ref={parentRef} className={styles.virtualViewport}>
      <div className={styles.virtualInner} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            data-index={virtualItem.index}
            className={styles.virtualItem}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
