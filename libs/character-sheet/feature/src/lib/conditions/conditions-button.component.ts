import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { openConditionsDialog } from '../help-dialogs/conditions-dialog.component';
import { CONDITIONS, EXHAUSTION_EFFECTS, LS_KEY } from './conditions-tracker.component';

@Component({
  selector: 'conditions-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  styles: `
    :host {
      position: absolute;
      top: 3px;
      left: 57px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      z-index: 10;
      pointer-events: auto;
    }

    .cb-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'Mikadan', sans-serif;
      font-size: 9px;
      letter-spacing: .13em;
      text-transform: uppercase;
      background: rgba(14, 8, 28, 0.96);
      border: 1px solid rgba(160, 80, 200, 0.55);
      border-radius: 3px;
      color: #c890e8;
      padding: 4px 10px 4px 7px;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s, border-color .15s, color .15s, box-shadow .15s;
      box-shadow: 0 0 8px rgba(120, 60, 180, 0.25), 0 1px 4px rgba(0,0,0,0.6);

      mat-icon { font-size: 14px; width: 14px; height: 14px; }

      &:hover {
        background: rgba(60, 20, 100, 0.98);
        border-color: rgba(190, 110, 255, 0.8);
        color: #e0b8ff;
        box-shadow: 0 0 14px rgba(160, 80, 220, 0.5), 0 1px 4px rgba(0,0,0,0.7);
      }
    }

    .cb-count {
      font-family: sans-serif;
      font-size: 10px;
      font-weight: 700;
      background: rgba(200, 50, 50, 0.7);
      border-radius: 8px;
      padding: 0 5px;
      color: #fff;
      margin-left: 2px;
    }

    /* ── Active condition badges ──────────────────── */
    .cb-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      max-width: 380px;
    }

    .cb-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid;
      cursor: default;
      transition: transform .12s;

      &:hover { transform: scale(1.18); }

      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .cb-exhaustion {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 3px 7px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid rgba(210, 60, 50, 0.7);
      font-family: sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: rgba(230, 100, 80, 0.95);
      cursor: default;

      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
  `,
  template: `
    <button type="button" class="cb-btn" (click)="openDialog()">
      <mat-icon>health_and_safety</mat-icon>
      Stavy
      @if (activeCount() > 0) {
        <span class="cb-count">{{ activeCount() }}</span>
      }
    </button>

    @if (activeConds().length > 0 || exhaustion() > 0) {
      <div class="cb-badges">
        @for (c of activeConds(); track c.id) {
          <span
            class="cb-badge"
            [style.border-color]="c.color"
            [style.color]="c.color"
            [style.box-shadow]="'0 0 6px ' + c.glow"
            [matTooltip]="c.name + ' — ' + c.description"
            matTooltipShowDelay="100"
          >
            <mat-icon>{{ c.icon }}</mat-icon>
          </span>
        }
        @if (exhaustion() > 0) {
          <span
            class="cb-exhaustion"
            [matTooltip]="'Vyčerpání ' + exhaustion() + '/6 — ' + exhaustionEffect()"
            matTooltipShowDelay="100"
          >
            <mat-icon>battery_alert</mat-icon>
            {{ exhaustion() }}
          </span>
        }
      </div>
    }
  `,
})
export class ConditionsButtonComponent implements OnInit {
  private readonly dialog = inject(MatDialog);

  private readonly activeIds = signal<Set<string>>(new Set());
  readonly exhaustion = signal<number>(0);

  readonly activeConds = computed(() => CONDITIONS.filter(c => this.activeIds().has(c.id)));
  readonly activeCount = computed(() => this.activeIds().size + (this.exhaustion() > 0 ? 1 : 0));

  exhaustionEffect(): string {
    return EXHAUSTION_EFFECTS[this.exhaustion()] ?? '';
  }

  ngOnInit(): void {
    this._load();
  }

  openDialog(): void {
    openConditionsDialog(this.dialog).subscribe(() => this._load());
  }

  private _load(): void {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.activeIds.set(new Set(d.active ?? []));
        this.exhaustion.set(d.exhaustion ?? 0);
      } else {
        this.activeIds.set(new Set());
        this.exhaustion.set(0);
      }
    } catch { /* ignore */ }
  }
}

