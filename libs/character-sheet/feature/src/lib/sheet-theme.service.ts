import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '@dn-d-servant/util';

const STORAGE_KEY = 'sheet-theme-dark';

@Injectable({ providedIn: 'root' })
export class SheetThemeService {
  private readonly ls = inject(LocalStorageService);

  readonly darkMode = signal<boolean>(this.ls.getDataSync<boolean>(STORAGE_KEY) ?? false);

  toggle(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    this.ls.setDataSync(STORAGE_KEY, next);
  }
}

