import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { AuthService } from '@dn-d-servant/util';
import { DmPageStore } from '../../dm-page.store';
import { DmNotesApiModel } from '../../dm-page-models';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dm-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.control.s)': 'ctrlSave($event)' },
  imports: [FormsModule, MatIcon, SpinnerOverlayComponent, RichTextareaComponent],
  styles: `
    :host {
      display: block;
      padding: 13px 0 20px;
      font-family: sans-serif;
      overflow: visible;
      /* Pass a readable text colour into rich-textarea via the CSS custom property it supports */
      --rt-text-color: rgba(210, 195, 160, 0.92);
      --rt-caret-color: rgba(100, 150, 220, 0.8);
    }

    /* Override the default light toolbar since panels are dark */
    :host ::ng-deep rich-textarea .rt-toolbar {
      background: rgba(22, 14, 6, 0.97) !important;
      border-color: rgba(200, 160, 60, 0.3) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7) !important;
      button {
        color: rgba(220, 195, 130, 0.85);
        &:hover {
          background: rgba(200, 160, 60, 0.14) !important;
          border-color: rgba(200, 160, 60, 0.4) !important;
          color: #e8c96a;
        }
      }
    }
    :host ::ng-deep rich-textarea .rt-separator {
      background: rgba(200, 160, 60, 0.25);
    }

    /* ── Header ─────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(
          90deg,
          transparent,
          rgba(80, 130, 200, 0.5) 20%,
          rgba(100, 150, 220, 0.7) 50%,
          rgba(80, 130, 200, 0.5) 80%,
          transparent
        )
        1;
    }
    .header-title {
      font-size: 22px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #a0b8e8;
      text-shadow: 0 0 18px rgba(80, 120, 200, 0.35);
      display: flex;
      align-items: center;
      gap: 10px;
      mat-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
        color: #6080c0;
      }
    }
    .header-subtitle {
      font-size: 11px;
      color: rgba(80, 120, 200, 0.4);
      letter-spacing: 0.05em;
      margin-top: 5px;
      font-family: sans-serif;
      font-style: italic;
      text-transform: none;
    }
    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .autosave-indicator {
      font-family: sans-serif;
      font-size: 10px;
      letter-spacing: 0.05em;
      color: rgba(100, 200, 120, 0.5);
      display: flex;
      align-items: center;
      gap: 5px;
      transition: opacity 0.3s;
      mat-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
      }
      &--hidden {
        opacity: 0;
      }
    }


    /* ── Notes grid — 2 columns, full height ─────── */
    .notes-grid {
      display: flex;
      gap: 18px;
      align-items: stretch;
      min-height: calc(100vh - 120px);
    }

    @media (max-width: 700px) {
      :host {
        padding: 13px 0 20px;
      }
      .notes-grid {
        flex-direction: column;
      }
      .rt-wrap {
        min-height: 260px;
      }
    }

    /* ── Single note panel ───────────────────────── */
    .note-panel {
      flex: 1;
      border-radius: 3px;
      overflow: hidden;
      background: linear-gradient(160deg, rgba(28, 22, 14, 0.97) 0%, rgba(18, 14, 8, 0.99) 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.02);
      transition: border-color 0.2s;
      display: flex;
      flex-direction: column;
      &:hover {
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px 9px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .panel-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      flex-shrink: 0;
    }
    .panel-title {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .panel-desc {
      font-family: sans-serif;
      font-size: 10px;
      margin-left: auto;
      color: rgba(255, 255, 255, 0.2);
      font-style: italic;
      letter-spacing: 0.03em;
    }

    /* colour variants */
    .panel--world {
      border-color: rgba(80, 130, 200, 0.2);
      .panel-header {
        background: rgba(80, 130, 200, 0.06);
      }
      .panel-icon {
        color: rgba(80, 150, 220, 0.6);
      }
      .panel-title {
        color: rgba(100, 160, 230, 0.8);
      }
    }
    .panel--secrets {
      border-color: rgba(180, 30, 30, 0.3);
      .panel-header {
        background: rgba(180, 30, 30, 0.1);
      }
      .panel-icon {
        color: rgba(200, 60, 50, 0.7);
      }
      .panel-title {
        color: rgba(220, 80, 70, 0.85);
      }
    }
    .panel--npcs {
      border-color: rgba(130, 100, 200, 0.2);
      .panel-header {
        background: rgba(130, 100, 200, 0.06);
      }
      .panel-icon {
        color: rgba(150, 120, 210, 0.6);
      }
      .panel-title {
        color: rgba(170, 140, 230, 0.8);
      }
    }

    /* ── Rich-textarea inside panel ─────────────── */
    .rt-wrap {
      position: relative;
      flex: 1;
      min-height: 400px;
      background: rgba(0, 0, 0, 0.15);
    }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">
      <div class="header-actions">
        <span class="autosave-indicator" [class.autosave-indicator--hidden]="!autoSaved()">
          <mat-icon>check_circle</mat-icon>
          Automaticky uloženo
        </span>
        <button class="pt-filter-btn" (click)="save()">
          <mat-icon>save</mat-icon>
          Uložit
        </button>
      </div>

      <div class="notes-grid">
        <!-- World notes -->
        <div class="note-panel panel--world">
          <div class="panel-header">
            <!--            <mat-icon class="panel-icon">public</mat-icon>-->
            <span class="panel-title">Hlavní info</span>
            <!--            <span class="panel-desc">Lore, lokace, pravidla světa</span>-->
          </div>
          <div class="rt-wrap">
            <rich-textarea
              [(ngModel)]="worldNotes"
              (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"
            ></rich-textarea>
          </div>
        </div>

        <!-- Secrets -->
        <div class="note-panel panel--secrets">
          <div class="panel-header">
            <mat-icon class="panel-icon">lock</mat-icon>
            <span class="panel-title">Plány, NPC, Frakce, ...</span>
            <span class="panel-desc">Co hráči nevědí</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea
              [(ngModel)]="secrets"
              (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"
            ></rich-textarea>
          </div>
        </div>
      </div>
    </spinner-overlay>
  `,
})
export class DmNotesComponent {
  readonly store = inject(DmPageStore);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  worldNotes = '';
  secrets = '';
  autoSaved = signal(false);

  private readonly change$ = new Subject<void>();

  constructor() {
    // Load from store when data arrives
    effect(() => {
      const data = this.store.dmNotes();
      untracked(() => {
        if (data) {
          this.worldNotes = data.worldNotes ?? '';
          this.secrets = data.secrets ?? '';
          // With OnPush, plain-property mutations are invisible to Angular's CD.
          // markForCheck() schedules a re-check so ngModel propagates to rich-textarea.
          this.cdr.markForCheck();
        }
      });
    });

    effect(() => {
      const username = this.auth.currentUser()?.username;
      untracked(() => {
        if (username) this.store.loadDmNotes(username);
      });
    });

    // Auto-save to DB 2.5s after last change
    this.change$.pipe(debounceTime(2500), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.save();
      this.autoSaved.set(true);
      setTimeout(() => this.autoSaved.set(false), 3000);
    });
  }

  onAnyChange(): void {
    this.change$.next();
  }

  ctrlSave(e: Event): void { e.preventDefault(); this.save(); }

  save(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    const model: DmNotesApiModel = {
      username,
      worldNotes: this.worldNotes,
      secrets: this.secrets,
    };
    this.store.saveDmNotes(model);
  }
}
