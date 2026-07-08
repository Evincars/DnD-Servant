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
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { AuthService } from '@dn-d-servant/util';
import { DmPageStore } from '../../dm-page.store';
import { DmQuestDifficulty, DmQuestEntry, DmQuestStatus } from '../../dm-page-models';

type FilterStatus = 'all' | DmQuestStatus;

const STAGE_LABELS = ['Neaktivní', 'Aktivní', 'Rozuzlení', 'Dokončeno'];

@Component({
  selector: 'dm-quests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent, RichTextareaComponent],
  host: { '(document:keydown.escape)': 'onEscape()', 'class': 'theme-dark' },
  styles: `
    :host { display: block; padding: 24px 32px 40px; font-family: sans-serif; overflow: visible; }

    /* ── Buttons ─────────────────────────────────── */
    .btn { font-family: sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(255,255,255,.12); border-radius: 3px; background: rgba(255,255,255,.04); color: rgba(255,255,255,.55);
      padding: 6px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.25); color: rgba(255,255,255,.85); }
    }
    .btn-icon { padding: 6px 10px; }
    .btn-save { border-color: rgba(80,160,80,.35); color: rgba(100,200,100,.8); background: rgba(60,120,60,.08);
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── Filter + sort bar ───────────────────────── */
    .filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .filter-count { background: rgba(255,255,255,.08); border-radius: 10px; padding: 0 6px; font-size: 9px; min-width: 18px; text-align: center; line-height: 16px; }
    .bar-actions { margin-left: auto; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

    /* ── Grid ────────────────────────────────────── */
    .quest-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; align-items: start; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,.12); font-size: 13px; letter-spacing: .1em;
      mat-icon { font-size: 44px; width: 44px; height: 44px; display: block; margin: 0 auto 14px; color: rgba(200,80,60,.15); }
    }
    @media (max-width: 900px) { .quest-grid { grid-template-columns: 1fr; } }

    /* ── Card ────────────────────────────────────── */
    .quest-card {
      position: relative; border-radius: 3px;
      background: rgba(22,20,18,.97);
      border: 1px solid rgba(200,80,60,.15);
      box-shadow: 0 4px 20px rgba(0,0,0,.55);
      transition: border-color .2s, box-shadow .2s;
      &:hover { border-color: rgba(200,80,60,.28); box-shadow: 0 6px 28px rgba(0,0,0,.65); }
    }

    /* ── Card header ─────────────────────────────── */
    .card-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px 6px; flex-wrap: wrap; cursor: pointer; user-select: none;
      &:hover { background: rgba(255,255,255,.02); }
    }
    .quest-done-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; color: rgba(100,200,100,.8); flex-shrink: 0; }
    .diff-badge {
      font-family: sans-serif; font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 2px; padding: 4px 10px; cursor: pointer; transition: opacity .15s; white-space: nowrap; flex-shrink: 0;
      &:hover { opacity: .75; }
      &--easy     { color: rgba(80,180,100,.8);  background: rgba(60,140,80,.1); border: 1px solid rgba(60,160,80,.3); }
      &--medium   { color: rgba(200,160,60,.8);  background: rgba(200,160,60,.08); border: 1px solid rgba(200,160,60,.3); }
      &--hard     { color: rgba(210,110,40,.8);  background: rgba(200,90,30,.1); border: 1px solid rgba(200,90,30,.3); }
      &--deadly   { color: rgba(220,60,50,.85);  background: rgba(200,40,30,.1); border: 1px solid rgba(200,40,30,.4); }
    }
    .stage-pips { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
    .stage-pip {
      width: 16px; height: 16px; border-radius: 50%; cursor: pointer;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.06);
      transition: background .15s, transform .1s, box-shadow .15s;
      &:hover { transform: scale(1.3); }
      &--filled { background: rgba(80,140,210,.8); box-shadow: 0 0 6px rgba(80,140,210,.4); border-color: rgba(100,160,230,.6); }
    }
    .card-header-spacer { flex: 1; min-width: 0; }
    .card-btns { display: flex; flex-shrink: 0; }
    .expand-btn, .delete-btn {
      width: 26px !important; height: 26px !important;
      padding: 0 !important; line-height: 1 !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      border-radius: 2px !important; transition: color .15s, background .15s !important;
      mat-icon, .mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; line-height: 16px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
    }
    .expand-btn { color: rgba(255,255,255,.3) !important; &:hover { color: rgba(255,255,255,.7) !important; background: rgba(255,255,255,.06) !important; } }
    .delete-btn { color: rgba(180,60,60,.35) !important; &:hover { color: rgba(220,80,70,.85) !important; background: rgba(180,40,30,.1) !important; } }

    /* ── Title ───────────────────────────────────── */
    .title-row { padding: 0 12px 6px; }
    .title-input {
      width: 100%; box-sizing: border-box; background: transparent; border: none;
      border-bottom: 1px solid rgba(200,80,60,.2); color: #e8a0a0;
      font-family: sans-serif; font-size: 14px; letter-spacing: .07em;
      padding: 3px 2px 5px; outline: none; transition: border-color .18s;
      &::placeholder { color: rgba(200,80,60,.22); }
      &:focus { border-bottom-color: rgba(200,80,60,.55); }
    }
    .card-date { font-size: 9px; color: rgba(255,255,255,.2); letter-spacing: .05em; font-family: sans-serif; margin-top: 4px; }

    /* ── Expanded body ───────────────────────────── */
    .expanded-body { padding: 0 12px 14px; }

    /* ── Meta fields ─────────────────────────────── */
    .meta-row { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
    .meta-field { display: flex; align-items: center; gap: 6px; }
    .meta-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; flex-shrink: 0; color: rgba(200,80,60,.4); }
    .meta-input {
      flex: 1; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,.06);
      color: #c8b0a8; font-family: sans-serif; font-size: 12px; padding: 2px 2px 3px; outline: none; transition: border-color .15s;
      &::placeholder { color: rgba(255,255,255,.14); font-style: italic; }
      &:focus { border-bottom-color: rgba(200,80,60,.4); }
    }

    /* ── Reward row ──────────────────────────────── */
    .reward-row { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
    .reward-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; flex-shrink: 0; }
    .reward-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,.06); color: rgba(200,160,60,.8); font-family: sans-serif; font-size: 11px; padding: 2px 2px 3px; outline: none;
      &::placeholder { color: rgba(200,160,60,.2); font-style: italic; }
      &:focus { border-bottom-color: rgba(200,160,60,.4); }
    }
    .reward-input--secret { color: rgba(220,80,70,.7); &:focus { border-bottom-color: rgba(200,50,40,.4); } }

    /* ── Rich-textarea wrap ──────────────────────── */
    .rt-wrap {
      position: relative; height: 210px; border-radius: 2px; background: rgba(0,0,0,.2);
      border: 1px solid rgba(200,80,60,.1);
      overflow: visible; z-index: 2;
      margin-top: 44px; /* space for floating toolbar */
    }
    .rt-wrap--player { border-color: rgba(200,160,60,.12); margin-top: 10px; }
    .rt-label { font-size: 8px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.2); margin-bottom: 3px; margin-top: 12px; }

    /* ── Rich-textarea dark-theme overrides ──────── */
    :host ::ng-deep .rt-toolbar {
      background: rgba(22,14,6,.97) !important;
      border-color: rgba(200,160,60,.35) !important;
      box-shadow: 0 2px 12px rgba(0,0,0,.6) !important;
      button { color: rgba(220,195,130,.9) !important;
        &:hover { background: rgba(200,160,60,.14) !important; border-color: rgba(200,160,60,.45) !important; color: #e8c96a !important; }
      }
    }
    :host ::ng-deep .rt-toolbar--inline {
      background: rgba(18,12,5,.98) !important;
      border-color: rgba(200,160,60,.25) !important;
    }
    :host ::ng-deep .rt-separator { background: rgba(200,160,60,.3) !important; }
    :host ::ng-deep .rt-done-btn { color: rgba(100,200,100,.9) !important;
      &:hover { background: rgba(50,160,50,.15) !important; border-color: rgba(80,180,80,.5) !important; }
    }

    /* ── Confirm dialog ──────────────────────────── */
    .confirm-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,.75); display: flex; align-items: center; justify-content: center; animation: fadeIn .14s ease; }
    .confirm-dialog { position: relative; background: linear-gradient(160deg, rgba(50,20,14,.99) 0%, rgba(30,10,8,1) 100%); border: 1px solid rgba(200,80,60,.35); border-top: 2px solid rgba(200,80,60,.7); box-shadow: 0 12px 50px rgba(0,0,0,.9); border-radius: 3px; padding: 26px 30px 22px; min-width: 300px; max-width: 400px; animation: scaleIn .14s ease;
    }
    .confirm-icon { display: flex; justify-content: center; margin-bottom: 12px; mat-icon { font-size: 34px; width: 34px; height: 34px; color: rgba(200,80,60,.7); } }
    .confirm-title { font-family: sans-serif; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: #e8a090; text-align: center; margin-bottom: 10px; }
    .confirm-msg { font-size: 12px; color: #a08878; text-align: center; line-height: 1.6; margin-bottom: 20px; strong { color: #d4a090; font-style: italic; } }
    .confirm-rule { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,80,60,.3) 50%, transparent); margin-bottom: 16px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn { font-family: sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; border-radius: 3px; padding: 7px 20px; cursor: pointer; transition: background .18s, border-color .18s, color .18s; }
    .confirm-cancel { background: rgba(200,80,60,.06); border: 1px solid rgba(200,80,60,.25); color: rgba(200,80,60,.65); &:hover { background: rgba(200,80,60,.14); border-color: rgba(200,80,60,.5); color: #e8a090; } }
    .confirm-delete { background: rgba(160,40,30,.25); border: 1px solid rgba(200,60,50,.4); color: rgba(220,100,80,.85); &:hover { background: rgba(180,40,30,.45); border-color: rgba(220,80,60,.7); color: #ff9980; } }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">
      <!-- Filter bar + actions in one row -->
      <div class="filter-bar">
        @for (t of filterTabs; track t.value) {
          <button type="button" class="pt-filter-btn" [class.active]="filterStatus() === t.value" (click)="filterStatus.set(t.value)">
            {{ t.label }}<span class="filter-count">{{ counts()[t.value] }}</span>
          </button>
        }
        <div class="bar-actions">
          <button class="btn btn-icon" type="button" (click)="toggleAllExpanded()"
            [matTooltip]="allExpanded() ? 'Sbalit vše' : 'Rozvinout vše'">
            <mat-icon>{{ allExpanded() ? 'unfold_less' : 'unfold_more' }}</mat-icon>
          </button>
          <button class="btn" type="button" (click)="addQuest()"><mat-icon>add</mat-icon>Přidat quest</button>
          <button class="btn btn-save" type="button" (click)="save()"><mat-icon>save</mat-icon>Uložit</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="quest-grid">
        @if (filtered().length === 0) {
          <div class="empty-state"><mat-icon>auto_stories</mat-icon>Žádné questy. Začni psát příběh!</div>
        }

        @for (item of filtered(); track item.quest.id) {
          <div class="quest-card">

            <!-- Card header -->
            <div class="card-header" (click)="toggleExpand(item.quest.id)">
              <button class="diff-badge diff-badge--{{ item.quest.difficulty }}" type="button"
                (click)="cycleDiff(item.idx); $event.stopPropagation()" matTooltip="Obtížnost — klikni pro změnu" matTooltipShowDelay="400">{{ diffLabel(item.quest.difficulty) }}</button>
              <!-- Stage pips -->
              <div class="stage-pips">
                @for (n of [1,2,3,4]; track n) {
                  <span class="stage-pip" [class.stage-pip--filled]="n <= item.quest.stage"
                    (click)="setStage(item.idx, n); $event.stopPropagation()" [matTooltip]="stageName(n)"></span>
                }
              </div>
              @if (item.quest.stage >= 4) {
                <mat-icon class="quest-done-icon" matTooltip="Quest dokončen">task_alt</mat-icon>
              }
              <span class="card-header-spacer"></span>
              <div class="card-btns">
                <button mat-icon-button class="expand-btn" type="button"
                  [matTooltip]="expandedIds().has(item.quest.id) ? 'Sbalit' : 'Rozbalit'">
                  <mat-icon>{{ expandedIds().has(item.quest.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
                <button mat-icon-button class="delete-btn" type="button" (click)="askDelete(item.idx); $event.stopPropagation()" matTooltip="Smazat">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>

            <!-- Title -->
            <div class="title-row">
              <input class="title-input" [(ngModel)]="quests()[item.idx].title" placeholder="Název questu / příběhu..." (click)="$event.stopPropagation()" />
              @if (item.quest.dateAdded) {
                <div class="card-date">{{ item.quest.dateAdded }}</div>
              }
            </div>

            @if (expandedIds().has(item.quest.id)) {
              <div class="expanded-body">
                <!-- Meta -->
                <div class="meta-row">
                  <div class="meta-field"><mat-icon class="meta-icon">place</mat-icon>
                    <input class="meta-input" [(ngModel)]="quests()[item.idx].location" placeholder="Lokalita / Oblast" /></div>
                  <div class="meta-field"><mat-icon class="meta-icon" style="color:rgba(200,60,50,.45)">whatshot</mat-icon>
                    <input class="meta-input" [(ngModel)]="quests()[item.idx].antagonist" placeholder="Antagonista / Padouch" /></div>
                </div>

                <!-- ⚔ Player-visible textarea -->
                <div class="rt-wrap rt-wrap--player">
                  <rich-textarea [(ngModel)]="quests()[item.idx].playerDescription" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
                </div>
                <div class="reward-row">
                  <mat-icon class="reward-icon" style="color:rgba(200,160,60,.55)">payments</mat-icon>
                  <input class="reward-input" [(ngModel)]="quests()[item.idx].publicRewards" placeholder="Veřejná odměna (hráči to ví)..." />
                </div>

                <!-- 🔒 DM-only textarea -->
                <div class="rt-wrap">
                  <rich-textarea [(ngModel)]="quests()[item.idx].dmNotes" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
                </div>
                <div class="reward-row">
                  <mat-icon class="reward-icon" style="color:rgba(200,60,50,.5)">lock</mat-icon>
                  <input class="reward-input reward-input--secret" [(ngModel)]="quests()[item.idx].secretRewards" placeholder="Tajná odměna / DM plán..." />
                </div>
              </div>
            }
          </div>
        }
      </div>
    </spinner-overlay>

    @if (confirmIdx() !== null) {
      <div class="confirm-backdrop" (click)="cancelDelete()">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon"><mat-icon>delete_forever</mat-icon></div>
          <div class="confirm-title">Smazat quest?</div>
          <div class="confirm-msg">Opravdu smazat quest
            @if (quests()[confirmIdx()!]?.title) { <strong>„{{ quests()[confirmIdx()!].title }}"</strong> } @else { <strong>bez názvu</strong> }?
          </div>
          <div class="confirm-rule"></div>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-cancel" (click)="cancelDelete()">Zrušit</button>
            <button class="confirm-btn confirm-delete" (click)="confirmDelete()">Smazat</button>
          </div>
        </div>
      </div>
    }

  `,
})
export class DmQuestsComponent {
  readonly store = inject(DmPageStore);
  private readonly auth = inject(AuthService);

  quests = signal<DmQuestEntry[]>([]);
  filterStatus = signal<FilterStatus>('all');
  expandedIds = signal<Set<string>>(new Set());
  confirmIdx = signal<number | null>(null);

  readonly filterTabs: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'planned', label: 'Naplánováno' },
    { value: 'active', label: 'Aktivní' },
    { value: 'climax', label: 'Vyvrcholení' },
    { value: 'completed', label: 'Dokončeno' },
    { value: 'abandoned', label: 'Opuštěno' },
  ];

  readonly counts = computed((): Record<FilterStatus, number> => {
    const all = this.quests();
    return {
      all: all.length,
      planned: all.filter(q => q.status === 'planned').length,
      active: all.filter(q => q.status === 'active').length,
      climax: all.filter(q => q.status === 'climax').length,
      completed: all.filter(q => q.status === 'completed').length,
      abandoned: all.filter(q => q.status === 'abandoned').length,
    };
  });

  readonly filtered = computed(() => {
    const fs = this.filterStatus();
    return this.quests()
      .map((quest, idx) => ({ quest, idx }))
      .filter(({ quest }) => fs === 'all' || quest.status === fs);
  });

  constructor() {
    effect(() => {
      const data = this.store.dmQuests();
      untracked(() => { if (data?.quests) this.quests.set(data.quests.map(q => ({ ...q }))); });
    });
    effect(() => {
      const username = this.auth.currentUser()?.username;
      untracked(() => { if (username) this.store.loadDmQuests(username); });
    });
  }

  addQuest(): void {
    const id = crypto.randomUUID();
    this.quests.update(list => [...list, {
      id, title: '', playerDescription: '', dmNotes: '', storyHooks: '',
      antagonist: '', location: '', partyMembers: '', imageBase64: null,
      status: 'planned', difficulty: 'medium', publicRewards: '', secretRewards: '',
      stage: 1, dateAdded: new Date().toISOString().split('T')[0],
    } as DmQuestEntry]);
    this.expandedIds.update(s => new Set([...s, id]));
  }

  readonly allExpanded = computed(() =>
    this.quests().length > 0 && this.quests().every(q => this.expandedIds().has(q.id))
  );

  toggleAllExpanded(): void {
    if (this.allExpanded()) { this.collapseAll(); } else { this.expandAll(); }
  }

  toggleExpand(id: string): void {
    this.expandedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  expandAll(): void { this.expandedIds.set(new Set(this.quests().map(q => q.id))); }
  collapseAll(): void { this.expandedIds.set(new Set()); }

  cycleDiff(idx: number): void {
    const order: DmQuestDifficulty[] = ['easy', 'medium', 'hard', 'deadly'];
    this.quests.update(list => list.map((q, i) => i !== idx ? q : { ...q, difficulty: order[(Math.max(0, order.indexOf(q.difficulty)) + 1) % order.length] as DmQuestDifficulty }));
  }
  setStage(idx: number, stage: number): void {
    this.quests.update(list => list.map((q, i) => i !== idx ? q : { ...q, stage: q.stage === stage ? stage - 1 : stage }));
  }

  askDelete(idx: number): void { this.confirmIdx.set(idx); }
  cancelDelete(): void { this.confirmIdx.set(null); }
  confirmDelete(): void {
    const idx = this.confirmIdx();
    if (idx === null) return;
    const id = this.quests()[idx]?.id;
    if (id) this.expandedIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    this.quests.update(list => list.filter((_, i) => i !== idx));
    this.confirmIdx.set(null);
  }

  save(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    this.store.saveDmQuests({ username, quests: this.quests() });
  }

  onEscape(): void { if (this.confirmIdx() !== null) this.cancelDelete(); }

  // ── Labels / colours ─────────────────────────────────────────────────────
  diffLabel(d: DmQuestDifficulty): string {
    const map: Record<DmQuestDifficulty, string> = { trivial: 'Trivální', easy: 'Lehké', medium: 'Střední', hard: 'Těžké', deadly: 'Smrtelné' };
    return map[d];
  }
  stageName(n: number): string { return STAGE_LABELS[n - 1] ?? ''; }
}

