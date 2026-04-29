import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { SheetThemeService } from '../sheet-theme.service';

/**
 * Transparent wrapper on desktop (display:contents).
 * On mobile/tablet (≤1359px) renders as a collapsible card with a header button.
 * Open/collapsed state is persisted to localStorage.
 *
 * Uses a single <ng-content> to avoid Angular's content-projection-in-conditional limitation.
 * Visibility is controlled purely by CSS (display:none on the content wrapper when closed).
 */
@Component({
  selector: 'cs-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  host: {
    // On desktop: completely transparent — no box added to the layout.
    // On responsive: block card that can be toggled.
    '[style.display]': 'responsive() ? "block" : "contents"',
    '[class.cs-collapsible--responsive]': 'responsive()',
    '[class.cs-collapsible--open]': 'isOpen()',
    '[class.cs-collapsible--closed]': '!isOpen()',
    '[class.theme-dark]': 'sheetTheme.darkMode()',
  },
  template: `
    @if (responsive()) {
      <button type="button" class="cs-coll-header" (click)="toggle()">
        @if (icon()) {
          <mat-icon class="cs-coll-icon">{{ icon() }}</mat-icon>
        }
        <span class="cs-coll-title">{{ title() }}</span>
        <mat-icon class="cs-coll-chevron">
          {{ isOpen() ? 'expand_less' : 'expand_more' }}
        </mat-icon>
      </button>
    }
    <!-- Content is always projected here; CSS hides it when collapsed on responsive -->
    <div class="cs-coll-body">
      <ng-content />
    </div>
  `,
  styles: `
    /* ── Responsive card shell ────────────────────────────────────────── */
    :host.cs-collapsible--responsive {
      display: block;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
      border: 1px solid rgba(180, 130, 50, 0.22);
      background: rgba(255, 248, 230, 0.97);
    }

    /* ── Header button ───────────────────────────────────────────────── */
    .cs-coll-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(200, 160, 60, 0.08);
      border: none;
      border-bottom: 1px solid rgba(180, 130, 50, 0.18);
      cursor: pointer;
      gap: 8px;
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: bold;
      color: #5a3a10;
      text-align: left;
      transition: background 0.15s;

      &:hover {
        background: rgba(200, 160, 60, 0.16);
      }
    }

    :host.cs-collapsible--open .cs-coll-header {
      border-bottom-color: rgba(180, 130, 50, 0.18);
    }

    :host.cs-collapsible--closed .cs-coll-header {
      border-bottom: none;
    }

    .cs-coll-title { flex: 1; }

    .cs-coll-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
      flex-shrink: 0;
      color: rgba(140, 90, 20, 0.7);
      margin-right: 8px;
    }

    .cs-coll-chevron {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      flex-shrink: 0;
      color: rgba(120, 80, 20, 0.7);
    }

    /* ── Body: hidden when collapsed on responsive ───────────────────── */
    :host.cs-collapsible--responsive.cs-collapsible--closed .cs-coll-body {
      display: none;
    }

    .cs-coll-body {
      /* no padding here — child components carry their own 12 px internal padding */
    }

    :host.cs-collapsible--responsive .cs-coll-body {
      /* side + vertical inset so content doesn't butt the card border */
      padding: 6px 8px;
    }

    /* ── Hide inner section title when collapsible header already shows it ── */
    :host.cs-collapsible--responsive ::ng-deep .cs-section-title {
      display: none !important;
    }

    /* ── Dark theme ──────────────────────────────────────────────────── */
    :host.cs-collapsible--responsive.theme-dark {
      background: rgba(16, 10, 4, 0.97);
      border-color: rgba(200, 160, 60, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
    }

    :host.theme-dark .cs-coll-header {
      color: #e8c96a;
      border-bottom-color: rgba(200, 160, 60, 0.15);
      background: rgba(200, 160, 60, 0.06);

      &:hover {
        background: rgba(200, 160, 60, 0.14);
      }
    }

    :host.theme-dark .cs-coll-chevron {
      color: rgba(200, 160, 60, 0.7);
    }

    :host.theme-dark .cs-coll-icon {
      color: rgba(200, 160, 60, 0.7);
    }
  `,
})
export class CsCollapsibleComponent {
  readonly title = input.required<string>();
  readonly storageKey = input.required<string>();
  readonly icon = input<string>('');
  /** When no localStorage entry exists, this determines the initial state. Default: true (open). */
  readonly defaultOpen = input<boolean>(true);

  readonly sheetTheme = inject(SheetThemeService);

  private readonly _breakpoints = inject(BreakpointObserver);
  readonly responsive = toSignal(
    this._breakpoints.observe('(max-width: 1359px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  readonly isOpen = signal(true);

  constructor() {
    // Initialise from localStorage once the storageKey input is available.
    effect(() => {
      const key = this.storageKey();
      const def = this.defaultOpen();
      const stored = localStorage.getItem(`cs-section-${key}`);
      untracked(() => {
        this.isOpen.set(stored !== null ? stored !== 'false' : def);
      });
    });
  }

  toggle(): void {
    this.setOpen(!this.isOpen());
  }

  setOpen(open: boolean): void {
    this.isOpen.set(open);
    try {
      localStorage.setItem(`cs-section-${this.storageKey()}`, String(open));
    } catch {
      // Storage quota exceeded or blocked in private mode
    }
  }
}
