import {
  ChangeDetectionStrategy, Component, computed, effect, inject, QueryList,
  signal, untracked, ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { SpinnerOverlayComponent } from '@dn-d-servant/ui';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { DmPageStore } from '../../dm-page.store';
import { DmPageApiService } from '../../dm-page-api.service';
import { StoryEvent } from '../../dm-page-models';
import { TYPE_ORDER, FilterType, SortOrder, parseTags } from './dm-story-timeline.types';
import { StoryEventsListComponent } from './story-events-list.component';

@Component({
  selector: 'dm-story-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatTooltip, SpinnerOverlayComponent, StoryEventsListComponent],
  host: { '(document:keydown.escape)': 'onEscape()', '(document:keydown.control.s)': 'ctrlSave($event)' },
  styles: `
    :host { display: block; padding: 13px 0 20px; font-family: sans-serif; overflow: visible; }


    /* ── pt-filter-btn icon support ─────────────── */
    .pt-filter-btn { display: inline-flex; align-items: center; gap: 5px;
      mat-icon, .mat-icon { font-size: 14px; width: 14px; height: 14px; } }

    /* ── Filter / sort bar ───────────────────────── */
    .filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .filter-bar-spacer { flex: 1; }
    .filter-count { background: rgba(255,255,255,.08); border-radius: 10px; padding: 0 6px; font-size: 9px; min-width: 18px; text-align: center; line-height: 16px; }
    .sort-select {
      font-family: sans-serif; font-size: 10px; letter-spacing: .08em;
      background: rgba(140,125,100,.08); border: 1px solid rgba(155,140,115,.25); border-radius: 3px;
      color: rgba(175,160,135,.85); padding: 4px 10px; cursor: pointer;
      option { background: #141008; }
    }

    /* ── Tag filter row ──────────────────────────── */
    .tag-filter-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; padding: 6px 0; }
    .tag-filter-label { font-family: sans-serif; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: rgba(155,140,115,.4); flex-shrink: 0; }
    .tag-filter-chip {
      font-family: sans-serif; font-size: 12px; padding: 3px 10px; border-radius: 10px; cursor: pointer; border: 1px solid; transition: background .12s, color .12s;
      background: transparent; color: rgba(155,140,115,.65); border-color: rgba(155,140,115,.2);
      &:hover { background: rgba(140,125,100,.1); color: rgba(175,160,135,.85); border-color: rgba(155,140,115,.4); }
      &--active { background: rgba(140,125,100,.2); color: #d8cdb8; border-color: rgba(155,140,115,.6); }
    }

    /* ── Tabs (same style as Lektvary & Jedy) ────── */
    .st-tabs { display: flex; align-items: center; gap: 0; margin-bottom: 20px; border-bottom: 1px solid rgba(200,160,60,.2); }
    .st-tab {
      padding: 10px 18px; font-size: 13px; font-weight: 600; color: #9a8a6a; cursor: pointer;
      background: none; border: none; border-bottom: 2px solid transparent;
      font-family: sans-serif; transition: all .15s; position: relative; top: 1px;
      &:hover { color: #d4c9a0; }
      &.active { color: #e8c96a; border-bottom-color: #e8c96a; }
    }

    /* ── No-shared placeholder ───────────────────── */
    .no-shared {
      text-align: center; padding: 60px 20px;
      color: rgba(155,140,115,.35); font-family: sans-serif; font-size: 13px; letter-spacing: .06em;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 14px; color: rgba(155,140,115,.15); }
    }

    /* ── Share dialog ───────────────────────────── */
    .share-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,.75); display: flex; align-items: center; justify-content: center; animation: fadeIn .14s ease; }
    .share-dialog {
      background: linear-gradient(160deg, rgba(14,10,4,.99) 0%, rgba(8,6,2,1) 100%);
      border: 1px solid rgba(200,160,60,.35); border-top: 2px solid rgba(200,160,60,.7);
      box-shadow: 0 12px 50px rgba(0,0,0,.9); border-radius: 3px;
      padding: 26px 30px 22px; min-width: 340px; max-width: 460px; width: 90vw;
      animation: scaleIn .14s ease;
    }
    .share-dialog__title { font-family: sans-serif; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: #e8c96a; margin: 0 0 6px; }
    .share-dialog__desc { font-size: 11px; color: rgba(255,255,255,.35); font-family: sans-serif; margin: 0 0 18px; font-style: italic; }
    .share-dialog__section-label { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(200,160,60,.4); margin-bottom: 8px; }
    .share-dialog__input-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .share-dialog__input {
      flex: 1; background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.22); border-radius: 4px;
      color: rgba(220,210,190,.85); font-family: sans-serif; font-size: 13px; padding: 7px 12px; outline: none;
      &:focus { border-color: rgba(200,160,60,.5); background: rgba(200,160,60,.1); }
      &::placeholder { color: rgba(200,160,60,.25); }
    }
    .share-dialog__list { display: flex; flex-direction: column; gap: 5px; min-height: 40px; margin-bottom: 20px; }
    .share-dialog__empty { font-size: 11px; color: rgba(255,255,255,.2); font-style: italic; font-family: sans-serif; padding: 6px 0; }
    .share-dialog__player {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px; background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.15); border-radius: 4px;
    }
    .share-dialog__player-name { font-family: sans-serif; font-size: 12px; color: rgba(220,200,150,.85); }
    .share-check-icon {
      font-size: 16px !important; width: 16px !important; height: 16px !important; flex-shrink: 0;
      &--ok       { color: rgba(80,190,90,.85); }
      &--warn     { color: rgba(155,155,155,.5); }
      &--checking { color: rgba(200,160,60,.5); animation: spin .8s linear infinite; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .share-dialog__remove {
      background: none; border: none; cursor: pointer; color: rgba(200,80,70,.5); font-size: 16px; line-height: 1;
      padding: 2px 4px; border-radius: 2px; transition: color .12s, background .12s;
      &:hover { color: rgba(220,80,70,.9); background: rgba(200,50,40,.12); }
    }
    .share-dialog__actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 4px; margin-top: 4px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <spinner-overlay [diameter]="60" [showSpinner]="store.loading()">

      <!-- Filter + actions bar -->
      <div class="filter-bar">
        <button class="pt-filter-btn" [class.active]="filterType() === 'all'" (click)="filterType.set('all')">
          Vše <span class="filter-count">{{ activeEvents().length }}</span>
        </button>
        @for (t of typeKeys; track t) {
          <button class="pt-filter-btn" [class.active]="filterType() === t" (click)="filterType.set(t)">
            {{ typeLabel(t) }}<span class="filter-count">{{ countByType()[t] ?? 0 }}</span>
          </button>
        }
        <select class="sort-select" [ngModel]="sortOrder()" (ngModelChange)="sortOrder.set($event)">
          <option value="newest">Nejnovější první</option>
          <option value="oldest">Nejstarší první</option>
        </select>
        <span class="filter-bar-spacer"></span>
        @if (activeEvents().length > 0) {
          <button class="pt-filter-btn" type="button" (click)="activeList?.toggleAllExpanded()"
            [matTooltip]="activeList?.allExpanded() ? 'Sbalit vše' : 'Rozbalit vše'">
            <mat-icon>{{ activeList?.allExpanded() ? 'unfold_less' : 'unfold_more' }}</mat-icon>
          </button>
        }
        @if (activeTab() === 'own') {
          <button class="pt-filter-btn" (click)="addEvent()"><mat-icon>add</mat-icon> Přidat událost</button>
          <button class="pt-filter-btn" (click)="openShareDialog()" matTooltip="Sdílet moje události s hráči">
            <mat-icon>share</mat-icon> Sdílet
          </button>
          <button class="pt-filter-btn" (click)="save()"><mat-icon>save</mat-icon> Uložit</button>
        }
      </div>

      <!-- Tag filter row -->
      @if (allTags().length > 0) {
        <div class="tag-filter-row">
          <span class="tag-filter-label">Štítky:</span>
          <button class="tag-filter-chip" [class.tag-filter-chip--active]="filterTag() === null" (click)="filterTag.set(null)">vše</button>
          @for (tag of allTags(); track tag) {
            <button class="tag-filter-chip" [class.tag-filter-chip--active]="filterTag() === tag" (click)="filterTag.set(filterTag() === tag ? null : tag)">{{ tag }}</button>
          }
        </div>
      }

      <!-- Tabs -->
      <div class="st-tabs">
        <button class="st-tab" [class.active]="activeTab() === 'shared'" (click)="activeTab.set('shared')">
          Sdílené události
        </button>
        <button class="st-tab" [class.active]="activeTab() === 'own'" (click)="activeTab.set('own')">
          Moje události
        </button>
      </div>

      <!-- Shared tab content -->
      @if (activeTab() === 'shared') {
        @if (ownerUsername()) {
          <story-events-list
            [eventsRef]="sharedEvents"
            [isReadOnly]="true"
            [filterType]="filterType()"
            [filterTag]="filterTag()"
            [sortOrder]="sortOrder()"
            storageKey="dnd_story_expanded_shared"
          />
        } @else {
          <div class="no-shared">
            <mat-icon>group</mat-icon>
            Nikdo s tebou zatím nesdílí příběhové události.<br>Přepni na záložku <strong>Moje události</strong> a začni psát.
          </div>
        }
      }

      <!-- Own tab content -->
      @if (activeTab() === 'own') {
        <story-events-list
          [eventsRef]="ownEvents"
          [isReadOnly]="false"
          [filterType]="filterType()"
          [filterTag]="filterTag()"
          [sortOrder]="sortOrder()"
          [autoExpandId]="newEventId()"
          storageKey="dnd_story_expanded_own"
        />
      }

    </spinner-overlay>

    <!-- Share dialog -->
    @if (shareDialogOpen()) {
      <div class="share-backdrop" (click)="shareDialogOpen.set(false)">
        <div class="share-dialog" (click)="$event.stopPropagation()">
          <div class="share-dialog__title">Sdílet příběhové události</div>
          <div class="share-dialog__desc">Pozvaní hráči uvidí tvoje události. Editování je pro ně vypnuté.</div>

          <div class="share-dialog__section-label">Přidat hráče</div>
          <div class="share-dialog__input-row">
            <input class="share-dialog__input" [(ngModel)]="shareInput" placeholder="Uživatelské jméno hráče…" (keydown.enter)="addSharePlayer()" />
            <button class="pt-filter-btn" type="button" (click)="addSharePlayer()">
              <mat-icon>add</mat-icon> Přidat
            </button>
          </div>

          <div class="share-dialog__section-label">Sdíleno s ({{ pendingSharedWith().length }})</div>
          <div class="share-dialog__list">
            @if (pendingSharedWith().length === 0) {
              <span class="share-dialog__empty">Zatím nesdíleno s nikým.</span>
            }
            @for (player of pendingSharedWith(); track player) {
              <div class="share-dialog__player">
                @if (userCheckStatus()[player] === 'checking') {
                  <mat-icon class="share-check-icon share-check-icon--checking">hourglass_empty</mat-icon>
                } @else if (userCheckStatus()[player] === 'exists') {
                  <mat-icon class="share-check-icon share-check-icon--ok" matTooltip="Uživatel nalezen">check_circle</mat-icon>
                } @else if (userCheckStatus()[player] === 'not-found') {
                  <mat-icon class="share-check-icon share-check-icon--warn" matTooltip="Uživatel dosud neuložil žádná data — sdílení proběhne správně, pokud je jméno napsáno přesně">help_outline</mat-icon>
                }
                <span class="share-dialog__player-name">{{ player }}</span>
                <button class="share-dialog__remove" type="button" (click)="removeSharePlayer(player)">✕</button>
              </div>
            }
          </div>

          <div class="share-dialog__actions">
            <button class="pt-filter-btn" type="button" (click)="shareDialogOpen.set(false)">Zrušit</button>
            <button class="pt-filter-btn" type="button" (click)="saveSharing()">
              <mat-icon>save</mat-icon> Uložit sdílení
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DmStoryTimelineComponent {
  readonly store = inject(DmPageStore);
  private readonly auth  = inject(AuthService);
  private readonly api   = inject(DmPageApiService);
  private readonly snack = inject(MatSnackBar);

  @ViewChildren(StoryEventsListComponent) private lists!: QueryList<StoryEventsListComponent>;
  get activeList(): StoryEventsListComponent | undefined { return this.lists?.first; }

  // ── Events state ──────────────────────────────────────────────────────────
  ownEvents    = signal<StoryEvent[]>([]);
  sharedEvents = signal<StoryEvent[]>([]);
  newEventId   = signal<string | null>(null);

  // ── Sharing ────────────────────────────────────────────────────────────────
  ownerUsername     = signal<string | null>(null);
  sharedWith        = signal<string[]>([]);
  shareDialogOpen   = signal(false);
  shareInput        = '';
  pendingSharedWith = signal<string[]>([]);
  userCheckStatus   = signal<Record<string, 'checking' | 'exists' | 'not-found'>>({});

  // ── Tabs ───────────────────────────────────────────────────────────────────
  activeTab = signal<'shared' | 'own'>('own');

  // ── Filters (shared across both tabs) ─────────────────────────────────────
  filterType = signal<FilterType>('all');
  filterTag  = signal<string | null>(null);
  sortOrder  = signal<SortOrder>('newest');

  readonly typeKeys = TYPE_ORDER;

  readonly activeEvents = computed(() =>
    this.activeTab() === 'shared' ? this.sharedEvents() : this.ownEvents()
  );

  readonly allTags = computed((): string[] => {
    const set = new Set<string>();
    for (const e of this.activeEvents()) for (const t of parseTags(e.tags)) set.add(t);
    return [...set].sort();
  });

  readonly countByType = computed(() => {
    const events = this.activeEvents();
    const r: Record<string, number> = {};
    for (const t of TYPE_ORDER) r[t] = events.filter(e => e.type === t).length;
    return r;
  });

  constructor() {
    // Own data from store → ownEvents
    effect(() => {
      const data = this.store.dmStoryTimeline();
      untracked(() => {
        if (data?.events) {
          this.ownEvents.set(data.events.map(e => ({ ...e })));
          this.sharedWith.set(data.sharedWith ?? []);
        }
      });
    });

    // On auth: check invitation, load own data, load shared data if invited
    effect(() => {
      const username = this.auth.currentUser()?.username;
      untracked(() => {
        if (!username) return;
        // Always load own data via store
        this.store.loadDmStoryTimeline(username);
        // Check for invitation
        this.api.getTimelineInvitation(username).subscribe(inv => {
          if (inv?.ownerUsername && inv.ownerUsername !== username) {
            this.ownerUsername.set(inv.ownerUsername);
            this.activeTab.set('shared');
            // Load shared data directly (bypasses store to avoid collision)
            this.api.getDmStoryTimeline(inv.ownerUsername).subscribe(sharedData => {
              if (sharedData?.events) {
                this.sharedEvents.set(sharedData.events.map(e => ({ ...e })));
              }
            });
          } else {
            this.ownerUsername.set(null);
            this.activeTab.set('own');
          }
        });
      });
    });
  }

  addEvent(): void {
    const id = crypto.randomUUID();
    this.ownEvents.update(list => [{
      id, title: '', inGameDate: '', realDate: new Date().toISOString().split('T')[0],
      type: 'other', summary: '', dmNotes: '', imageBase64: null, location: '', tags: '',
    } as StoryEvent, ...list]);
    this.newEventId.set(id);
  }

  save(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) { this.snack.open('Nejsi přihlášen.', 'Zavřít', { verticalPosition: 'top', duration: 3000 }); return; }
    this.store.saveDmStoryTimeline({ username, events: this.ownEvents(), sharedWith: this.sharedWith() });
  }

  // ── Share dialog ──────────────────────────────────────────────────────────
  openShareDialog(): void {
    this.pendingSharedWith.set([...this.sharedWith()]);
    this.userCheckStatus.set({});
    this.shareInput = '';
    this.shareDialogOpen.set(true);
    // Re-check all existing shared users
    for (const u of this.sharedWith()) this._checkUser(u);
  }

  addSharePlayer(): void {
    const name = this.shareInput.trim();
    if (!name) return;
    const current = this.auth.currentUser()?.username;
    if (name.toLowerCase() === current?.toLowerCase()) {
      this.snack.open('Nemůžeš pozvat sám sebe.', '✕', { verticalPosition: 'top', duration: 2500 });
      return;
    }
    if (this.pendingSharedWith().some(u => u.toLowerCase() === name.toLowerCase())) return;
    this.pendingSharedWith.update(list => [...list, name]);
    this.shareInput = '';
    this._checkUser(name);
  }

  removeSharePlayer(player: string): void {
    this.pendingSharedWith.update(list => list.filter(p => p !== player));
    this.userCheckStatus.update(s => { const n = { ...s }; delete n[player]; return n; });
  }

  private _checkUser(username: string): void {
    this.userCheckStatus.update(s => ({ ...s, [username]: 'checking' }));
    this.api.checkUserExists(username).subscribe(exists => {
      this.userCheckStatus.update(s => ({ ...s, [username]: exists ? 'exists' : 'not-found' }));
    });
  }

  saveSharing(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    const oldList = this.sharedWith();
    const newList = this.pendingSharedWith();
    const toAdd    = newList.filter(u => !oldList.includes(u));
    const toRemove = oldList.filter(u => !newList.includes(u));
    this.sharedWith.set(newList);
    this.shareDialogOpen.set(false);
    this.save();
    const ops = [
      ...toAdd.map(u => this.api.setTimelineInvitation({ viewerUsername: u, ownerUsername: username })),
      ...toRemove.map(u => this.api.removeTimelineInvitation(u)),
    ];
    if (ops.length) forkJoin(ops).subscribe();
  }

  onEscape(): void { if (this.shareDialogOpen()) this.shareDialogOpen.set(false); }
  ctrlSave(e: Event): void { e.preventDefault(); if (this.activeTab() === 'own') this.save(); }

  typeLabel(t: string): string {
    const labels: Record<string, string> = {
      world: 'Světová událost', campaign: 'Událost kampaně',
      character: 'Událost postav', other: 'Jiné',
    };
    return labels[t] ?? t;
  }
}
