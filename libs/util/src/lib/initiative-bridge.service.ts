import { Injectable, signal } from '@angular/core';

export interface InitiativeBridgeEntry {
  name: string;
}

/**
 * Tiny cross-library signal bus that lets any component (e.g., the Monsters tab)
 * queue a name for the Initiative Tracker to add as a new row.
 */
@Injectable({ providedIn: 'root' })
export class InitiativeBridgeService {
  private readonly _queue = signal<InitiativeBridgeEntry[]>([]);

  /** Read-only view of pending entries; the tracker `effect()` watches this. */
  readonly queue = this._queue.asReadonly();

  /** Push a new monster name into the queue. */
  addMonster(name: string): void {
    this._queue.update(q => [...q, { name }]);
  }

  /** Called by the tracker to drain the queue. Returns items that were pending. */
  drain(): InitiativeBridgeEntry[] {
    const items = this._queue();
    if (items.length) this._queue.set([]);
    return items;
  }
}

