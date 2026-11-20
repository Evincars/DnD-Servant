import { inject, Injectable } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { CharacterSheetApiService } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

/**
 * Manages the display order of collapsible sections for a given page.
 * Order is persisted to localStorage per page key.
 */
@Injectable({ providedIn: 'root' })
export class CsSectionOrderService {
  private readonly api = inject(CharacterSheetApiService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

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

  getRemoteOrder(
    pageKey: string,
    remoteOrder: string[] | undefined,
    defaultOrder: readonly string[],
  ): string[] {
    if (!this.isValidOrder(remoteOrder, defaultOrder)) {
      const localOrder = this.getOrder(pageKey, defaultOrder);
      if (this.auth.currentUser()?.username) this.persist(pageKey, localOrder);
      return localOrder;
    }
    this.persistLocal(pageKey, remoteOrder);
    return [...remoteOrder];
  }

  getLayoutOrder(pageKey: string, defaultOrder: readonly string[]): string[] {
    return this.getOrder(pageKey, defaultOrder);
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

  /** Directly set and persist an explicit order. */
  setOrder(pageKey: string, order: string[]): void {
    this.persist(pageKey, order);
  }

  /** Reset to default order and clear storage. */
  reset(pageKey: string, defaultOrder: readonly string[]): string[] {
    try {
      localStorage.removeItem(`cs-order-${pageKey}`);
    } catch { /* noop */ }
    return [...defaultOrder];
  }

  private persist(pageKey: string, order: string[]): void {
    this.persistLocal(pageKey, order);
    const baseUsername = this.auth.currentUser()?.username;
    if (!baseUsername) return;

    const username = pageKey === 'group-sheet' ? `${baseUsername}_group` : baseUsername;
    const request = pageKey === 'group-sheet'
      ? this.api.saveGroupSheetLayout(username, order)
      : this.api.saveCharacterSheetLayout(username, order);

    request.pipe(take(1)).subscribe({
      error: () => this.snackBar.open('Rozvržení se nepodařilo synchronizovat.', 'Zavřít', {
        verticalPosition: 'top',
        duration: 3500,
      }),
    });
  }

  private persistLocal(pageKey: string, order: string[]): void {
    try {
      localStorage.setItem(`cs-order-${pageKey}`, JSON.stringify(order));
    } catch {
      // Storage quota exceeded or blocked in private mode
    }
  }

  private isValidOrder(
    order: string[] | undefined,
    defaultOrder: readonly string[],
  ): order is string[] {
    return !!order
      && Array.isArray(order)
      && order.length === defaultOrder.length
      && defaultOrder.every(key => order.includes(key));
  }
}


