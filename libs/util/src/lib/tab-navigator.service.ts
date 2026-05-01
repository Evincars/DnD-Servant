import { Injectable, WritableSignal } from '@angular/core';

export interface TabNavigatorRegistration {
  /** Total number of tabs. */
  tabCount: number;
  /** The writable signal that controls the selected index. */
  selectedTab: WritableSignal<number>;
  /** Persist the new index (e.g. to LocalStorage). */
  persistTab: (index: number) => void;
}

/**
 * Global registry that allows the app-level keyboard/gesture handler to navigate
 * the currently active mat-tab-group without a direct DOM reference.
 *
 * Each page that hosts a `<mat-tab-group>` should call `register()` on init and
 * `unregister()` on destroy.
 */
@Injectable({ providedIn: 'root' })
export class TabNavigatorService {
  private _active: TabNavigatorRegistration | null = null;

  register(reg: TabNavigatorRegistration): void {
    this._active = reg;
  }

  unregister(reg: TabNavigatorRegistration): void {
    if (this._active === reg) {
      this._active = null;
    }
  }

  /** Navigate by delta (-1 = previous, +1 = next) with infinite wrapping. */
  navigate(delta: -1 | 1): void {
    if (!this._active) return;
    const { tabCount, selectedTab, persistTab } = this._active;
    const next = (selectedTab() + delta + tabCount) % tabCount;
    selectedTab.set(next);
    persistTab(next);
  }

  /** Jump directly to a specific tab index (clamped to valid range). */
  navigateTo(index: number): void {
    if (!this._active) return;
    const { tabCount, selectedTab, persistTab } = this._active;
    const clamped = Math.max(0, Math.min(index, tabCount - 1));
    selectedTab.set(clamped);
    persistTab(clamped);
  }

  hasActive(): boolean {
    return this._active !== null;
  }
}

