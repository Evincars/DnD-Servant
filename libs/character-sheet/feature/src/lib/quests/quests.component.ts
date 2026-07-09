import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { QuestEntry, QuestStatus } from '@dn-d-servant/character-sheet-util';
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type FilterStatus = 'all' | QuestStatus;

const LS_QUESTS_KEY = 'dnd_quests_draft';
const LS_EXPANDED_KEY = 'dnd_quests_expanded';
const LS_FILTER_KEY = 'dnd_quests_filter';

@Component({
  selector: 'quests-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent, RichTextareaComponent],
  host: { '(document:keydown.escape)': 'onEscape()', '(document:keydown.control.s)': 'ctrlSave($event)' },
  styles: `
    :host {
      display: block;
      padding: 13px 0 20px;
      font-family: sans-serif;
    }

    /* ── Page header ───────────────────────────── */
    .quests-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg,
        transparent, rgba(200,160,60,.6) 20%,
        rgba(240,200,80,.9) 50%,
        rgba(200,160,60,.6) 80%, transparent) 1;
    }

    .quests-title {
      font-size: 22px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 18px rgba(200,160,60,.4), 0 0 4px rgba(200,160,60,.2);
      display: flex;
      align-items: center;
      gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #c8a03c; }
    }

    .quests-subtitle {
      font-size: 11px;
      color: rgba(200,160,60,.4);
      letter-spacing: .05em;
      margin-top: 5px;
      font-family: sans-serif;
      font-style: italic;
      text-transform: none;
    }

    /* ── Buttons ───────────────────────────────── */
    .btn-dnd {
      font-family: sans-serif;
      font-size: 11px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border: 1px solid rgba(200,160,60,.35);
      border-radius: 3px;
      background: rgba(200,160,60,.08);
      color: rgba(200,160,60,.8);
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover {
        background: rgba(200,160,60,.16);
        border-color: rgba(200,160,60,.6);
        color: #e8c96a;
      }
    }

    .btn-dnd-icon {
      padding: 6px 10px;
    }

    .btn-dnd-save {
      border-color: rgba(80,160,80,.35);
      color: rgba(100,200,100,.8);
      background: rgba(60,120,60,.08);
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── Filter + sort bar ─────────────────────── */
    .quests-filter-bar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .quests-bar-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .filter-count {
      background: rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 9px;
      min-width: 18px;
      text-align: center;
      line-height: 16px;
    }

    .filter-tab--active .filter-count {
      background: rgba(200,160,60,.2);
    }

    .sort-tabs {
      display: none;
    }

    /* ── Quest grid ────────────────────────────── */
    .quests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      align-items: start;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: rgba(255,255,255,.12);
      font-size: 13px;
      letter-spacing: .1em;
      mat-icon {
        font-size: 44px; width: 44px; height: 44px;
        display: block; margin: 0 auto 14px;
        color: rgba(200,160,60,.15);
      }
    }

    /* ── Quest card ────────────────────────────── */
    .quest-card {
      position: relative;
      border-radius: 3px;
      background: rgba(22,20,18,.97);
      border: 1px solid rgba(200,160,60,.15);
      box-shadow: 0 4px 20px rgba(0,0,0,.55);
      overflow: visible;
      transition: border-color .2s, box-shadow .2s;
      &:hover { border-color: rgba(200,160,60,.28); box-shadow: 0 6px 28px rgba(0,0,0,.65); }
    }

    /* ── Card header ───────────────────────────── */
    .quest-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px 6px;
      cursor: pointer;
      &:hover { background: rgba(255,255,255,.02); }
    }

    .status-badge {
      font-family: sans-serif;
      font-size: 9px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border-radius: 6px;
      padding: 4px 12px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      background: rgba(200,160,60,.08);
      border: 1px solid rgba(200,160,60,.2);
      color: #9a8a6a;
      transition: background .15s, border-color .15s, color .15s;
      &:hover { background: rgba(200,160,60,.15); border-color: rgba(200,160,60,.4); color: #d4c9a0; }
    }

    .priority-dot {
      display: none;
    }

    .quest-date {
      font-size: 9px;
      color: rgba(255,255,255,.2);
      letter-spacing: .05em;
      font-family: sans-serif;
      flex: 1;
      text-align: right;
    }

    .quest-card-btns {
      display: flex;
      gap: 0;
      flex-shrink: 0;
    }

    .quest-expand-btn, .quest-delete-btn {
      width: 26px !important; height: 26px !important;
      padding: 0 !important; line-height: 1 !important;
      display: inline-flex !important;
      align-items: center !important; justify-content: center !important;
      border-radius: 2px !important;
      transition: color .15s, background .15s !important;

      mat-icon, .mat-icon {
        font-size: 16px !important; width: 16px !important;
        height: 16px !important; line-height: 16px !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
      }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
    }

    .quest-expand-btn {
      color: rgba(200,160,60,.4) !important;
      &:hover { color: rgba(200,160,60,.85) !important; background: rgba(200,160,60,.08) !important; }
    }

    .quest-delete-btn {
      color: rgba(180,60,60,.35) !important;
      &:hover { color: rgba(220,80,70,.85) !important; background: rgba(180,40,30,.1) !important; }
    }

    /* ── Quest title ───────────────────────────── */
    .quest-title-row {
      padding: 0 12px 10px;
    }

    .quest-title-input {
      width: 100%;
      box-sizing: border-box;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(200,160,60,.2);
      color: #e8c96a;
      font-family: sans-serif;
      font-size: 14px;
      letter-spacing: .07em;
      padding: 3px 2px 5px;
      outline: none;
      transition: border-color .18s;
      &::placeholder { color: rgba(200,160,60,.22); }
      &:focus { border-bottom-color: rgba(200,160,60,.6); }
    }

    /* ── Expanded section ──────────────────────── */
    .quest-expanded-body {
      padding: 0 12px 14px;
    }

    /* ── Meta row ──────────────────────────────── */
    .quest-meta-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 10px;
    }

    .quest-meta-field {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .quest-meta-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
      flex-shrink: 0;
      color: rgba(200,160,60,.4);
    }

    .quest-meta-input {
      flex: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255,255,255,.06);
      color: #c8b896;
      font-family: sans-serif;
      font-size: 12px;
      padding: 2px 2px 3px;
      outline: none;
      transition: border-color .15s;
      &::placeholder { color: rgba(255,255,255,.14); font-style: italic; }
      &:focus { border-bottom-color: rgba(200,160,60,.4); }

      &--gold { color: rgba(200,160,60,.85); }
    }

    /* ── Section label ─────────────────────────── */
    .quest-section-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 9px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(200,160,60,.35);
      margin-top: 12px;
      margin-bottom: 4px;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }

    /* ── Rich textarea wrapper ─────────────────── */
    .quest-desc-wrap {
      position: relative;
      height: 160px;
      border: 1px solid rgba(200,160,60,.1);
      border-radius: 2px;
      background: rgba(0,0,0,.2);
      overflow: visible;
    }

    /* Dark theme styles for rich-textarea inside quest cards */
    :host ::ng-deep .quest-desc-wrap {
      rich-textarea {
        .rt-toolbar {
          background: rgba(20,14,4,.92) !important;
          border-color: rgba(200,160,60,.2) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,.5) !important;
          button {
            color: rgba(200,160,60,.6);
            &:hover { color: #e8c96a !important; background: rgba(200,160,60,.12) !important; border-color: rgba(200,160,60,.3) !important; }
          }
          /* Preserve inline [style.color] on color buttons (A) */
          button[style*="color"] {
            filter: brightness(1.3) saturate(1.2);
          }
        }
        .rt-editor {
          color: #d4c9a0 !important;
          background: transparent !important;
          &::placeholder { color: rgba(200,160,60,.25) !important; }
        }
        .rt-preview {
          color: #d4c9a0 !important;
        }
        .rt-preview--empty {
          color: rgba(200,160,60,.25) !important;
        }
      }
    }

    /* ── Confirm delete dialog ─────────────────── */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,.75);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn .14s ease;
    }

    .confirm-dialog {
      position: relative;
      background: linear-gradient(160deg, rgba(50,34,12,.99) 0%, rgba(30,20,7,1) 100%);
      border: 1px solid rgba(200,160,60,.35);
      border-top: 2px solid rgba(200,160,60,.7);
      box-shadow: 0 12px 50px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,220,80,.07);
      border-radius: 3px;
      padding: 28px 32px 24px;
      min-width: 300px;
      max-width: 400px;
      animation: scaleIn .14s ease;
    }

    .confirm-icon { display: flex; justify-content: center; margin-bottom: 12px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: rgba(200,80,60,.7); }
    }
    .confirm-title { font-family: sans-serif; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; color: #e8c96a; text-align: center; margin-bottom: 10px; }
    .confirm-message { font-size: 12px; color: #a09070; text-align: center; line-height: 1.6; margin-bottom: 22px;
      strong { color: #d4a84b; font-style: italic; }
    }
    .confirm-rule { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,160,60,.3) 50%, transparent); margin-bottom: 18px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn {
      font-family: sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 3px; padding: 7px 20px; cursor: pointer; transition: background .18s, border-color .18s, color .18s;
    }
    .confirm-btn-cancel { background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.25); color: rgba(200,160,60,.65);
      &:hover { background: rgba(200,160,60,.14); border-color: rgba(200,160,60,.5); color: #e8c96a; }
    }
    .confirm-btn-delete { background: rgba(160,40,30,.25); border: 1px solid rgba(200,60,50,.4); color: rgba(220,100,80,.85);
      &:hover { background: rgba(180,40,30,.45); border-color: rgba(220,80,60,.7); color: #ff9980; }
    }

    /* ── Auto-save indicator ─────────────────── */
    .autosave-msg {
      font-family: sans-serif;
      font-size: 10px;
      letter-spacing: .1em;
      color: rgba(100,180,110,.6);
      transition: opacity .4s;
      &--hidden { opacity: 0; pointer-events: none; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <spinner-overlay [showSpinner]="showSpinner()" [diameter]="50">

      <div class="quests-filter-bar">
        <div class="filter-tabs">
          @for (tab of filterTabs; track tab.value) {
            <button
              type="button"
              class="pt-filter-btn"
              [class.active]="filterStatus() === tab.value"
              (click)="filterStatus.set(tab.value)"
            >
              {{ tab.label }}
              <span class="filter-count">{{ statusCounts()[tab.value] }}</span>
            </button>
          }
        </div>
        <div class="sort-tabs"></div>
        <div class="quests-bar-actions">
          <span class="autosave-msg" [class.autosave-msg--hidden]="autoSaveStatus() !== 'saved'">✓ Uloženo</span>
          <button class="btn-dnd btn-dnd-icon" type="button" (click)="toggleAllExpanded()"
            [matTooltip]="allExpanded() ? 'Sbalit vše' : 'Rozvinout vše'">
            <mat-icon>{{ allExpanded() ? 'unfold_less' : 'unfold_more' }}</mat-icon>
          </button>
          <button class="btn-dnd" type="button" (click)="addQuest()" matTooltip="Přidat nový quest">
            <mat-icon>add</mat-icon>
            Přidat quest
          </button>
          <button class="btn-dnd btn-dnd-save" type="button" (click)="save(true)" matTooltip="Uložit questy do databáze">
            <mat-icon>save</mat-icon>
            Uložit
          </button>
        </div>
      </div>

      <!-- ── Quest grid ──────────────────────────────── -->
      <div class="quests-grid">
        @if (filteredAndSorted().length === 0) {
          <div class="empty-state">
            <mat-icon>explore_off</mat-icon>
            Žádné questy. Začni nové dobrodružství!
          </div>
        }

        @for (item of filteredAndSorted(); track item.quest.id) {
          <div
            class="quest-card"
            [class.quest-card--completed]="item.quest.status === 'completed'"
            [class.quest-card--failed]="item.quest.status === 'failed'"
          >
            <!-- Header row -->
            <div class="quest-card-header" (click)="toggleExpand(item.quest.id)">
              <button
                class="status-badge status-badge--{{ item.quest.status }}"
                type="button"
                (click)="cycleStatus(item.idx); $event.stopPropagation()"
                matTooltip="Klikni pro změnu stavu"
              >{{ statusLabel(item.quest.status) }}</button>
              <span class="quest-date">{{ item.quest.dateAdded }}</span>
              <div class="quest-card-btns">
                <button
                  mat-icon-button
                  class="quest-expand-btn"
                  type="button"
                  (click)="toggleExpand(item.quest.id); $event.stopPropagation()"
                  [matTooltip]="expandedIds().has(item.quest.id) ? 'Sbalit' : 'Rozbalit'"
                >
                  <mat-icon>{{ expandedIds().has(item.quest.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
                <button mat-icon-button class="quest-delete-btn" type="button" (click)="askDelete(item.idx); $event.stopPropagation()" matTooltip="Smazat quest">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>

            <!-- Title row (always visible) -->
            <div class="quest-title-row">
              <input
                class="quest-title-input"
                [(ngModel)]="quests()[item.idx].title"
                (ngModelChange)="scheduleAutoSave()"
                placeholder="Název questu..."
              />
            </div>

            <!-- Expanded body -->
            @if (expandedIds().has(item.quest.id)) {
              <div class="quest-expanded-body">
                <!-- Meta fields -->
                <div class="quest-meta-row">
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon">person</mat-icon>
                    <input class="quest-meta-input" [(ngModel)]="quests()[item.idx].npcName" (ngModelChange)="scheduleAutoSave()" placeholder="Kdo quest zadal..." />
                  </div>
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon">place</mat-icon>
                    <input class="quest-meta-input" [(ngModel)]="quests()[item.idx].location" (ngModelChange)="scheduleAutoSave()" placeholder="Lokalita / Oblast..." />
                  </div>
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon" style="color:rgba(200,160,60,.55)">payments</mat-icon>
                    <input class="quest-meta-input quest-meta-input--gold" [(ngModel)]="quests()[item.idx].rewards" (ngModelChange)="scheduleAutoSave()" placeholder="Odměna..." />
                  </div>
                </div>

                <!-- Rich notes -->
                <div class="quest-section-label">
                  Zápisky
                </div>
                <div class="quest-desc-wrap">
                  <rich-textarea
                    [(ngModel)]="quests()[item.idx].description"
                    (ngModelChange)="scheduleAutoSave()"
                    style="top:0; left:0; width:100%; height:100%;"
                  ></rich-textarea>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </spinner-overlay>

    <!-- Confirm delete dialog -->
    @if (confirmDeleteIndex() !== null) {
      <div class="confirm-backdrop" (click)="cancelDelete()">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon"><mat-icon>delete_forever</mat-icon></div>
          <div class="confirm-title">Smazat quest?</div>
          <div class="confirm-message">
            Opravdu chceš smazat quest
            @if (quests()[confirmDeleteIndex()!]?.title) {
              <strong>„{{ quests()[confirmDeleteIndex()!].title }}"</strong>
            } @else {
              <strong>bez názvu</strong>
            }? Tato akce je nevratná.
          </div>
          <div class="confirm-rule"></div>
          <div class="confirm-actions">
            <button type="button" class="confirm-btn confirm-btn-cancel" (click)="cancelDelete()">Zrušit</button>
            <button type="button" class="confirm-btn confirm-btn-delete" (click)="confirmDelete()">Smazat</button>
          </div>
        </div>
      </div>
    }

  `,
})
export class QuestsTabComponent {
  readonly store = inject(CharacterSheetStore);
  private readonly authService = inject(AuthService);
  private readonly _doc = inject(DOCUMENT);

  quests = signal<QuestEntry[]>([]);
  filterStatus = signal<FilterStatus>(this._loadFilterStatus());
  expandedIds = signal<Set<string>>(new Set(this._loadExpandedIds()));
  confirmDeleteIndex = signal<number | null>(null);

  readonly filterTabs: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'active', label: 'Aktivní' },
    { value: 'completed', label: 'Splněné' },
    { value: 'failed', label: 'Neúspěšné' },
    { value: 'inactive', label: 'Neaktivní' },
  ];

  readonly statusCounts = computed((): Record<FilterStatus, number> => {
    const all = this.quests();
    return {
      all: all.length,
      active: all.filter(q => q.status === 'active').length,
      completed: all.filter(q => q.status === 'completed').length,
      failed: all.filter(q => q.status === 'failed').length,
      inactive: all.filter(q => q.status === 'inactive').length,
    };
  });

  readonly filteredAndSorted = computed(() => {
    const fs = this.filterStatus();
    let filtered = this.quests().map((quest, idx) => ({ quest, idx }));
    if (fs !== 'all') {
      filtered = filtered.filter(({ quest }) => quest.status === fs);
    }
    filtered.sort((a, b) => b.quest.dateAdded.localeCompare(a.quest.dateAdded));
    return filtered;
  });

  constructor() {
    // ── Restore local draft first (fast, no network) ─────────────────────
    const localDraft = this._loadLocalDraft();
    if (localDraft.length > 0) {
      this.quests.set(localDraft);
    }

    // ── When DB data arrives, merge: DB is source-of-truth for content,
    //    but keep any local status/priority changes that are newer ─────────
    effect(() => {
      const data = this.store.quests();
      untracked(() => {
        if (data?.quests) {
          this.quests.set(data.quests.map(q => ({ ...q })));
          this._dbLoaded.set(true);
          this._manualSaving.set(false);
        }
      });
    });

    effect(() => {
      const username = this.authService.currentUser()?.username;
      untracked(() => {
        if (username) {
          this.store.getQuests(username);
        }
      });
    });

    // ── Auto-persist quests to localStorage on every change ───────────────
    effect(() => {
      const list = this.quests();
      untracked(() => {
        try {
          this._doc.defaultView?.localStorage.setItem(LS_QUESTS_KEY, JSON.stringify(list));
        } catch { /* quota exceeded — ignore */ }
      });
    });

    // ── Auto-persist expanded IDs to localStorage on every change ─────────
    effect(() => {
      const ids = this.expandedIds();
      untracked(() => {
        try {
          this._doc.defaultView?.localStorage.setItem(LS_EXPANDED_KEY, JSON.stringify([...ids]));
        } catch { /* quota exceeded — ignore */ }
      });
    });

    // ── Auto-persist selected filter to localStorage ───────────────────────
    effect(() => {
      const fs = this.filterStatus();
      try { this._doc.defaultView?.localStorage.setItem(LS_FILTER_KEY, fs); } catch { /* ignore */ }
    });

    // ── Auto-save quests with debounce (2.5 s after last user change) ────
    this._autoSave$
      .pipe(debounceTime(2500), takeUntilDestroyed())
      .subscribe(() => {
        if (!this._dbLoaded()) return;
        this.save();
        this.autoSaveStatus.set('saved');
        this._hideBanner$.next();
      });

    this._hideBanner$
      .pipe(debounceTime(3000), takeUntilDestroyed())
      .subscribe(() => this.autoSaveStatus.set('idle'));
  }

  readonly autoSaveStatus = signal<'idle' | 'saved'>('idle');
  /** True once the DB response has arrived at least once. Prevents auto-save on initial population. */
  private readonly _dbLoaded = signal(false);
  private readonly _manualSaving = signal(false);
  readonly showSpinner = computed(() => this.store.loading() && this._manualSaving());
  private readonly _autoSave$ = new Subject<void>();
  private readonly _hideBanner$ = new Subject<void>();

  /** Call from user-driven actions to schedule a debounced auto-save. */
  scheduleAutoSave(): void {
    this._autoSave$.next();
  }

  // ── Quest management ─────────────────────────────────────────────────────

  addQuest(): void {
    const id = crypto.randomUUID();
    const newQuest: QuestEntry = {
      id,
      title: '',
      description: '',
      imageBase64: null,
      status: 'active',
      rewards: '',
      npcName: '',
      location: '',
      dateAdded: new Date().toISOString().split('T')[0],
    };
    this.quests.update(list => [...list, newQuest]);
    this.expandedIds.update(s => new Set([...s, id]));
    this.scheduleAutoSave();
  }

  toggleExpand(id: string): void {
    this.expandedIds.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  readonly allExpanded = computed(() =>
    this.quests().length > 0 && this.quests().every(q => this.expandedIds().has(q.id))
  );

  toggleAllExpanded(): void {
    if (this.allExpanded()) {
      this.collapseAll();
    } else {
      this.expandAll();
    }
  }

  expandAll(): void {
    this.expandedIds.set(new Set(this.quests().map(q => q.id)));
  }

  collapseAll(): void {
    this.expandedIds.set(new Set());
  }

  cycleStatus(idx: number): void {
    const order: QuestStatus[] = ['active', 'completed', 'failed', 'inactive'];
    this.quests.update(list =>
      list.map((q, i) => {
        if (i !== idx) return q;
        const next = order[(order.indexOf(q.status) + 1) % order.length];
        return { ...q, status: next };
      }),
    );
    this.scheduleAutoSave();
  }

  askDelete(idx: number): void {
    this.confirmDeleteIndex.set(idx);
  }

  cancelDelete(): void {
    this.confirmDeleteIndex.set(null);
  }

  confirmDelete(): void {
    const idx = this.confirmDeleteIndex();
    if (idx === null) return;
    const id = this.quests()[idx]?.id;
    if (id) {
      this.expandedIds.update(s => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
    this.quests.update(list => list.filter((_, i) => i !== idx));
    this.confirmDeleteIndex.set(null);
    this.scheduleAutoSave();
  }

  save(manual = false): void {
    const username = this.authService.currentUser()?.username;
    if (!username) return;
    if (manual) this._manualSaving.set(true);
    this.store.saveQuests({ username, quests: this.quests() });
  }

  onEscape(): void {
    if (this.confirmDeleteIndex() !== null) {
      this.cancelDelete();
    }
  }
  ctrlSave(e: Event): void { e.preventDefault(); this.save(true); }

  // ── Display helpers ───────────────────────────────────────────────────────

  statusLabel(status: QuestStatus): string {
    const map: Record<QuestStatus, string> = {
      active: 'Aktivní',
      completed: 'Splněno',
      failed: 'Neúspěch',
      inactive: 'Neaktivní',
    };
    return map[status];
  }


  // ── LocalStorage helpers ──────────────────────────────────────────────────

  private _loadLocalDraft(): QuestEntry[] {
    try {
      const raw = this._doc.defaultView?.localStorage.getItem(LS_QUESTS_KEY);
      return raw ? (JSON.parse(raw) as QuestEntry[]) : [];
    } catch {
      return [];
    }
  }

  private _loadExpandedIds(): string[] {
    try {
      const raw = this._doc.defaultView?.localStorage.getItem(LS_EXPANDED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  private _loadFilterStatus(): FilterStatus {
    const valid: FilterStatus[] = ['all', 'active', 'completed', 'failed', 'inactive'];
    try {
      const raw = this._doc.defaultView?.localStorage.getItem(LS_FILTER_KEY) as FilterStatus;
      return valid.includes(raw) ? raw : 'all';
    } catch {
      return 'all';
    }
  }
}
