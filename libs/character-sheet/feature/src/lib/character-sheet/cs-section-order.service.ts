import { Injectable } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * Manages the display order of collapsible sections for a given page.
 * Order is persisted to localStorage per page key.
 */
@Injectable({ providedIn: 'root' })
export class CsSectionOrderService {
  /**
   * Returns a signal with the current ordered keys for the given page.
   * Initialises from localStorage or falls back to the provided default order.
   */
  getOrder(pageKey: string, defaultOrder: readonly string[]): string[] {
    try {
      const stored = localStorage.getItem(`cs-order-${pageKey}`);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        // Validate: must contain exactly the same keys (handles added/removed sections)
        if (
          Array.isArray(parsed) &&
          parsed.length === defaultOrder.length &&
          defaultOrder.every(k => parsed.includes(k))
        ) {
          return parsed;
        }
      }
    } catch {
      // Corrupted data — fall through to default
    }
    return [...defaultOrder];
  }

  /**
   * Apply a drag-drop reorder and persist.
   * Returns the new order array.
   */
  reorder(pageKey: string, currentOrder: string[], previousIndex: number, currentIndex: number): string[] {
    const next = [...currentOrder];
    moveItemInArray(next, previousIndex, currentIndex);
    this.persist(pageKey, next);
    return next;
  }

  /** Reset to default order and clear storage. */
  reset(pageKey: string, defaultOrder: readonly string[]): string[] {
    try {
      localStorage.removeItem(`cs-order-${pageKey}`);
    } catch { /* noop */ }
    return [...defaultOrder];
  }

  private persist(pageKey: string, order: string[]): void {
    try {
      localStorage.setItem(`cs-order-${pageKey}`, JSON.stringify(order));
    } catch {
      // Storage quota exceeded or blocked in private mode
    }
  }
}


