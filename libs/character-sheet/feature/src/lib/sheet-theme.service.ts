import { computed, inject, Injectable, signal } from '@angular/core';
import { CS_SPELLS_FIRST_KEY, LocalStorageService } from '@dn-d-servant/util';

export type DarkTheme = 'dark' | 'sirien' | 'night';
export type Theme = 'light' | DarkTheme;

const STORAGE_KEY = 'sheet-theme';
const LEGACY_KEY = 'sheet-theme-dark';

@Injectable({ providedIn: 'root' })
export class SheetThemeService {
  private readonly ls = inject(LocalStorageService);

  readonly theme = signal<Theme>(this._initialTheme());

  /** True for every dark variant (backwards-compatible). */
  readonly darkMode = computed(() => this.theme() !== 'light');

  /**
   * When true, the spells page (third-page / kouzla) is rendered before
   * the appearance page (second-page / vzhled). Default: false.
   */
  readonly spellsFirst = signal<boolean>(this.ls.getDataSync<boolean>(CS_SPELLS_FIRST_KEY) ?? false);

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.ls.setDataSync(STORAGE_KEY, theme);
  }

  /** Legacy toggle: switches between light and the default dark variant. */
  toggle(): void {
    this.setTheme(this.darkMode() ? 'light' : 'dark');
  }

  toggleSpellsFirst(): void {
    const next = !this.spellsFirst();
    this.spellsFirst.set(next);
    this.ls.setDataSync(CS_SPELLS_FIRST_KEY, next);
  }

  private _initialTheme(): Theme {
    const stored = this.ls.getDataSync<Theme>(STORAGE_KEY);
    if (stored) return stored;
    // Migrate from old boolean-only key
    if (this.ls.getDataSync<boolean>(LEGACY_KEY) === true) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
