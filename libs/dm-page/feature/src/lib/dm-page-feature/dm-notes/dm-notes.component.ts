import {
  ChangeDetectionStrategy,
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
  imports: [FormsModule, MatIcon, SpinnerOverlayComponent, RichTextareaComponent],
  styles: `
    :host { display: block; padding: 24px 32px 40px; font-family: 'Mikadan', sans-serif; overflow: visible; }

    /* ── Header ─────────────────────────────────── */
    .header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 24px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(80,130,200,.5) 20%, rgba(100,150,220,.7) 50%, rgba(80,130,200,.5) 80%, transparent) 1;
    }
    .header-title { font-size: 22px; letter-spacing: .12em; text-transform: uppercase; color: #a0b8e8;
      text-shadow: 0 0 18px rgba(80,120,200,.35); display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #6080c0; }
    }
    .header-subtitle { font-size: 11px; color: rgba(80,120,200,.4); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }
    .header-actions { display: flex; gap: 8px; align-items: center; }

    .autosave-indicator {
      font-family: sans-serif; font-size: 10px; letter-spacing: .05em; color: rgba(100,200,120,.5);
      display: flex; align-items: center; gap: 5px; transition: opacity .3s;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &--hidden { opacity: 0; }
    }

    .btn-save {
      font-family: 'Mikadan', sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(80,160,80,.35); border-radius: 3px; background: rgba(60,120,60,.08);
      color: rgba(100,200,100,.8); padding: 6px 14px; cursor: pointer;
      display: flex; align-items: center; gap: 5px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── Notes grid — 2 × 2 ─────────────────────── */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 18px;
    }

    /* ── Single note panel ───────────────────────── */
    .note-panel {
      border-radius: 3px; overflow: hidden;
      background: linear-gradient(160deg, rgba(28,22,14,.97) 0%, rgba(18,14,8,.99) 100%);
      border: 1px solid rgba(255,255,255,.06);
      box-shadow: 0 4px 20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.02);
      transition: border-color .2s;
      &:hover { border-color: rgba(255,255,255,.1); }
    }

    .panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px 9px; border-bottom: 1px solid rgba(255,255,255,.05);
    }
    .panel-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; flex-shrink: 0; }
    .panel-title { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
    .panel-desc { font-family: sans-serif; font-size: 10px; margin-left: auto; color: rgba(255,255,255,.2); font-style: italic; letter-spacing: .03em; }

    /* colour variants */
    .panel--world   { border-color: rgba(80,130,200,.2);  .panel-header { background: rgba(80,130,200,.06); } .panel-icon { color: rgba(80,150,220,.6); } .panel-title { color: rgba(100,160,230,.8); } }
    .panel--secrets { border-color: rgba(180,30,30,.3);   .panel-header { background: rgba(180,30,30,.1);  } .panel-icon { color: rgba(200,60,50,.7);  } .panel-title { color: rgba(220,80,70,.85); } }
    .panel--npcs    { border-color: rgba(130,100,200,.2); .panel-header { background: rgba(130,100,200,.06);} .panel-icon { color: rgba(150,120,210,.6);} .panel-title { color: rgba(170,140,230,.8);} }
    .panel--rewards { border-color: rgba(200,160,60,.2);  .panel-header { background: rgba(200,160,60,.06);} .panel-icon { color: rgba(200,160,60,.6); } .panel-title { color: rgba(220,180,80,.85);} }

    /* ── Rich-textarea inside panel ─────────────── */
    .rt-wrap {
      position: relative;
      height: 380px;
      background: rgba(0,0,0,.15);
    }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">
      <div class="header">
        <div>
          <div class="header-title"><mat-icon>import_contacts</mat-icon>Zápisník Pána Hry</div>
          <div class="header-subtitle">Soukromé poznámky PH — obsah není sdílen s hráči</div>
        </div>
        <div class="header-actions">
          <span class="autosave-indicator" [class.autosave-indicator--hidden]="!autoSaved()">
            <mat-icon>check_circle</mat-icon> Automaticky uloženo
          </span>
          <button class="btn-save" (click)="save()"><mat-icon>save</mat-icon>Uložit</button>
        </div>
      </div>

      <div class="notes-grid">
        <!-- World notes -->
        <div class="note-panel panel--world">
          <div class="panel-header">
            <mat-icon class="panel-icon">public</mat-icon>
            <span class="panel-title">Světové Poznámky</span>
            <span class="panel-desc">Lore, lokace, pravidla světa</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [(ngModel)]="worldNotes" (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>

        <!-- Secrets -->
        <div class="note-panel panel--secrets">
          <div class="panel-header">
            <mat-icon class="panel-icon">lock</mat-icon>
            <span class="panel-title">Tajemství &amp; Plány</span>
            <span class="panel-desc">Co hráči nevědí, plot twists</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [(ngModel)]="secrets" (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>

        <!-- NPCs & Factions -->
        <div class="note-panel panel--npcs">
          <div class="panel-header">
            <mat-icon class="panel-icon">groups</mat-icon>
            <span class="panel-title">NPC &amp; Frakce</span>
            <span class="panel-desc">Postavy, vztahy, frakce</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [(ngModel)]="npcsAndFactions" (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>

        <!-- Rewards & Treasure -->
        <div class="note-panel panel--rewards">
          <div class="panel-header">
            <mat-icon class="panel-icon">auto_awesome</mat-icon>
            <span class="panel-title">Odměny &amp; Poklady</span>
            <span class="panel-desc">Magické předměty, zlato, XP</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [(ngModel)]="rewards" (ngModelChange)="onAnyChange()"
              style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
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

  worldNotes = '';
  secrets = '';
  npcsAndFactions = '';
  rewards = '';
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
          this.npcsAndFactions = data.npcsAndFactions ?? '';
          this.rewards = data.rewards ?? '';
        }
      });
    });

    effect(() => {
      const username = this.auth.currentUser()?.username;
      untracked(() => { if (username) this.store.loadDmNotes(username); });
    });

    // Auto-save to DB 2.5s after last change
    this.change$
      .pipe(debounceTime(2500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.save();
        this.autoSaved.set(true);
        setTimeout(() => this.autoSaved.set(false), 3000);
      });
  }

  onAnyChange(): void { this.change$.next(); }

  save(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    const model: DmNotesApiModel = {
      username,
      worldNotes: this.worldNotes,
      secrets: this.secrets,
      npcsAndFactions: this.npcsAndFactions,
      rewards: this.rewards,
    };
    this.store.saveDmNotes(model);
  }
}

