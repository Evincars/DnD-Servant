import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DmPageStore } from '../../dm-page.store';
import { DmQuestDifficulty, DmQuestEntry, DmQuestStatus } from '../../dm-page-models';

type FilterStatus = 'all' | DmQuestStatus;

const STAGE_LABELS = ['Zahájení', 'Rozvoj', 'Konflikt', 'Vyvrcholení', 'Rozuzlení'];

@Component({
  selector: 'dm-quests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent, RichTextareaComponent],
  styles: `
    :host { display: block; padding: 24px 32px 40px; font-family: 'Mikadan', sans-serif; overflow: visible; }

    /* ── Header ─────────────────────────────────── */
    .header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 20px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(180,30,30,.6) 20%, rgba(220,60,50,.8) 50%, rgba(180,30,30,.6) 80%, transparent) 1;
    }
    .header-title { font-size: 22px; letter-spacing: .12em; text-transform: uppercase; color: #e8a0a0;
      text-shadow: 0 0 18px rgba(200,60,50,.4); display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #c05040; }
    }
    .header-subtitle { font-size: 11px; color: rgba(200,80,70,.4); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }
    .header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

    /* ── Buttons ─────────────────────────────────── */
    .btn { font-family: 'Mikadan', sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(200,80,60,.35); border-radius: 3px; background: rgba(200,80,60,.08); color: rgba(200,100,80,.8);
      padding: 6px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(200,80,60,.16); border-color: rgba(200,80,60,.6); color: #e8a090; }
    }
    .btn-icon { padding: 6px 10px; }
    .btn-save { border-color: rgba(80,160,80,.35); color: rgba(100,200,100,.8); background: rgba(60,120,60,.08);
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── Filter + sort bar ───────────────────────── */
    .filter-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
    .filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
    .filter-tab {
      font-family: 'Mikadan', sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(255,255,255,.07); border-radius: 2px; background: transparent;
      color: rgba(255,255,255,.3); padding: 4px 12px; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: background .15s, border-color .15s, color .15s;
      &:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.55); }
      &--active { background: rgba(200,80,60,.12); border-color: rgba(200,80,60,.45); color: #e8a090; }
    }
    .filter-count { background: rgba(255,255,255,.08); border-radius: 10px; padding: 0 6px; font-size: 9px; min-width: 18px; text-align: center; line-height: 16px; }
    .filter-tab--active .filter-count { background: rgba(200,80,60,.2); }

    /* ── Grid ────────────────────────────────────── */
    .quest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; align-items: start; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,.12); font-size: 13px; letter-spacing: .1em;
      mat-icon { font-size: 44px; width: 44px; height: 44px; display: block; margin: 0 auto 14px; color: rgba(200,80,60,.15); }
    }

    /* ── Card ────────────────────────────────────── */
    .quest-card {
      position: relative; border-radius: 3px;
      background: linear-gradient(160deg, rgba(38,22,18,.97) 0%, rgba(24,12,10,.99) 100%);
      border: 1px solid rgba(200,80,60,.15);
      border-left: 3px solid transparent;
      box-shadow: 0 4px 20px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,120,100,.03);
      transition: border-color .2s, box-shadow .2s; overflow: hidden;
      &::before { content: '◆'; position: absolute; top: 5px; left: 8px; font-size: 6px; color: rgba(200,80,60,.2); pointer-events: none; }
      &:hover { border-color: rgba(200,80,60,.28); box-shadow: 0 6px 28px rgba(0,0,0,.65), 0 0 10px rgba(200,80,60,.05); }
    }
    .quest-card-rule { height: 2px; background: linear-gradient(90deg, rgba(200,80,60,.0) 0%, rgba(200,80,60,.4) 30%, rgba(240,100,80,.6) 50%, rgba(200,80,60,.4) 70%, rgba(200,80,60,.0) 100%); }

    /* ── Card header ─────────────────────────────── */
    .card-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px 5px; flex-wrap: wrap; }
    .status-badge {
      font-family: 'Mikadan', sans-serif; font-size: 8px; letter-spacing: .12em; text-transform: uppercase;
      border-radius: 10px; padding: 2px 9px; cursor: pointer; border: 1px solid currentColor;
      transition: filter .15s; white-space: nowrap; flex-shrink: 0;
      &:hover { filter: brightness(1.2); }
      &--planned   { color: rgba(100,130,200,.9); background: rgba(80,100,180,.1); }
      &--active    { color: rgba(80,190,100,.9);  background: rgba(60,160,80,.1); }
      &--climax    { color: rgba(220,120,40,.9);  background: rgba(200,100,30,.12); }
      &--completed { color: rgba(200,160,60,.9);  background: rgba(200,160,60,.1); }
      &--abandoned { color: rgba(120,120,120,.7); background: rgba(100,100,100,.07); }
    }
    .diff-badge {
      font-family: 'Mikadan', sans-serif; font-size: 7px; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 2px; padding: 2px 7px; cursor: pointer; transition: filter .15s; white-space: nowrap; flex-shrink: 0;
      &:hover { filter: brightness(1.2); }
      &--trivial  { color: rgba(120,200,120,.8); background: rgba(80,160,80,.1); border: 1px solid rgba(80,160,80,.3); }
      &--easy     { color: rgba(80,180,100,.8);  background: rgba(60,140,80,.1); border: 1px solid rgba(60,160,80,.3); }
      &--medium   { color: rgba(200,160,60,.8);  background: rgba(200,160,60,.08); border: 1px solid rgba(200,160,60,.3); }
      &--hard     { color: rgba(210,110,40,.8);  background: rgba(200,90,30,.1); border: 1px solid rgba(200,90,30,.3); }
      &--deadly   { color: rgba(220,60,50,.85);  background: rgba(200,40,30,.1); border: 1px solid rgba(200,40,30,.4); }
    }
    .stage-pips { display: flex; gap: 3px; align-items: center; flex-shrink: 0; }
    .stage-pip {
      width: 8px; height: 8px; border-radius: 50%; cursor: pointer;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.06);
      transition: background .15s, transform .1s, box-shadow .15s;
      &:hover { transform: scale(1.3); }
      &--filled { background: rgba(200,80,60,.8); box-shadow: 0 0 5px rgba(200,80,60,.5); border-color: rgba(200,80,60,.6); }
    }
    .card-date { font-size: 9px; color: rgba(255,255,255,.2); letter-spacing: .05em; font-family: sans-serif; flex: 1; text-align: right; }
    .card-btns { display: flex; flex-shrink: 0; }
    .expand-btn, .delete-btn {
      width: 26px !important; height: 26px !important; padding: 0 !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      border-radius: 2px !important; transition: color .15s, background .15s !important;
      mat-icon, .mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
    }
    .expand-btn { color: rgba(200,80,60,.4) !important; &:hover { color: rgba(200,80,60,.85) !important; background: rgba(200,80,60,.08) !important; } }
    .delete-btn { color: rgba(180,60,60,.35) !important; &:hover { color: rgba(220,80,70,.85) !important; background: rgba(180,40,30,.1) !important; } }

    /* ── Title ───────────────────────────────────── */
    .title-row { padding: 0 12px 10px; }
    .title-input {
      width: 100%; box-sizing: border-box; background: transparent; border: none;
      border-bottom: 1px solid rgba(200,80,60,.2); color: #e8a0a0;
      font-family: 'Mikadan', sans-serif; font-size: 14px; letter-spacing: .07em;
      padding: 3px 2px 5px; outline: none; transition: border-color .18s;
      &::placeholder { color: rgba(200,80,60,.22); }
      &:focus { border-bottom-color: rgba(200,80,60,.55); }
    }

    /* ── Expanded body ───────────────────────────── */
    .expanded-body { padding: 0 12px 14px; }

    /* ── Image area ──────────────────────────────── */
    .image-wrap {
      position: relative; height: 120px;
      background: repeating-linear-gradient(45deg, rgba(200,80,60,.02) 0px, rgba(200,80,60,.02) 1px, transparent 1px, transparent 8px), rgba(14,8,6,.5);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      cursor: pointer; border-bottom: 1px solid rgba(200,80,60,.08); transition: background .18s;
      img { width: 100%; height: 100%; object-fit: cover; }
      .img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: rgba(200,80,60,.22); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; pointer-events: none;
        mat-icon { font-size: 26px; width: 26px; height: 26px; }
      }
      .img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .18s; pointer-events: none;
        mat-icon { color: #e8a090; font-size: 22px; width: 22px; height: 22px; }
      }
      &:hover .img-overlay { opacity: 1; }
      &.drag-over { box-shadow: inset 0 0 0 2px rgba(200,80,60,.5); .img-overlay { opacity: 1; background: rgba(200,80,60,.1); } }
    }
    .img-view-btn {
      position: absolute; top: 5px; right: 5px; z-index: 2;
      width: 22px !important; height: 22px !important; padding: 0 !important;
      background: rgba(0,0,0,.6) !important; color: rgba(200,80,60,.8) !important; border-radius: 2px !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      mat-icon, .mat-icon { font-size: 12px !important; width: 12px !important; height: 12px !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
      &:hover { background: rgba(0,0,0,.85) !important; color: #e8a090 !important; }
    }
    .img-file-input { display: none; }

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

    /* ── Player-visible section ──────────────────── */
    .section-player {
      margin-top: 12px; border: 1px solid rgba(200,160,60,.18); border-radius: 3px; overflow: hidden;
      .section-label { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(200,160,60,.06); font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(200,160,60,.7); border-bottom: 1px solid rgba(200,160,60,.12);
        mat-icon { font-size: 13px; width: 13px; height: 13px; color: rgba(200,160,60,.6); }
      }
      .section-body { padding: 8px 10px; }
    }

    /* ── DM-only secret section ──────────────────── */
    .section-dm {
      margin-top: 10px; border: 1px solid rgba(180,30,30,.3); border-radius: 3px; overflow: hidden;
      background: rgba(60,10,10,.3);
      .section-label { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(180,30,30,.15); font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(220,80,70,.75); border-bottom: 1px solid rgba(180,30,30,.2);
        mat-icon { font-size: 13px; width: 13px; height: 13px; color: rgba(220,80,70,.7); }
      }
      .section-body { padding: 8px 10px; }
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
    .rt-wrap { position: relative; height: 130px; border-radius: 2px; background: rgba(0,0,0,.2); overflow: hidden;
      border: 1px solid rgba(200,80,60,.1);
      & + .rt-wrap { margin-top: 6px; }
    }
    .rt-wrap--player { border-color: rgba(200,160,60,.12); }
    .rt-label { font-size: 8px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.2); margin-bottom: 3px; }

    /* ── Stage bar ───────────────────────────────── */
    .stage-bar { display: flex; gap: 1px; margin-top: 10px; margin-bottom: 2px; }
    .stage-seg {
      flex: 1; height: 18px; cursor: pointer; border: 1px solid rgba(255,255,255,.06);
      background: rgba(255,255,255,.04); border-radius: 2px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Mikadan', sans-serif; font-size: 7px; letter-spacing: .06em; color: rgba(255,255,255,.2);
      text-transform: uppercase; transition: background .15s, color .15s, border-color .15s;
      &:hover { background: rgba(200,80,60,.12); color: rgba(200,80,60,.8); border-color: rgba(200,80,60,.25); }
      &--active { background: rgba(200,80,60,.22); border-color: rgba(200,80,60,.5); color: rgba(220,100,80,.9); }
    }

    /* ── Confirm dialog ──────────────────────────── */
    .confirm-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,.75); display: flex; align-items: center; justify-content: center; animation: fadeIn .14s ease; }
    .confirm-dialog { position: relative; background: linear-gradient(160deg, rgba(50,20,14,.99) 0%, rgba(30,10,8,1) 100%); border: 1px solid rgba(200,80,60,.35); border-top: 2px solid rgba(200,80,60,.7); box-shadow: 0 12px 50px rgba(0,0,0,.9); border-radius: 3px; padding: 26px 30px 22px; min-width: 300px; max-width: 400px; animation: scaleIn .14s ease;
      &::before { content: '◆'; position: absolute; top: 7px; left: 9px; font-size: 7px; color: rgba(200,80,60,.35); pointer-events: none; }
    }
    .confirm-icon { display: flex; justify-content: center; margin-bottom: 12px; mat-icon { font-size: 34px; width: 34px; height: 34px; color: rgba(200,80,60,.7); } }
    .confirm-title { font-family: 'Mikadan', sans-serif; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: #e8a090; text-align: center; margin-bottom: 10px; }
    .confirm-msg { font-size: 12px; color: #a08878; text-align: center; line-height: 1.6; margin-bottom: 20px; strong { color: #d4a090; font-style: italic; } }
    .confirm-rule { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,80,60,.3) 50%, transparent); margin-bottom: 16px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn { font-family: 'Mikadan', sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; border-radius: 3px; padding: 7px 20px; cursor: pointer; transition: background .18s, border-color .18s, color .18s; }
    .confirm-cancel { background: rgba(200,80,60,.06); border: 1px solid rgba(200,80,60,.25); color: rgba(200,80,60,.65); &:hover { background: rgba(200,80,60,.14); border-color: rgba(200,80,60,.5); color: #e8a090; } }
    .confirm-delete { background: rgba(160,40,30,.25); border: 1px solid rgba(200,60,50,.4); color: rgba(220,100,80,.85); &:hover { background: rgba(180,40,30,.45); border-color: rgba(220,80,60,.7); color: #ff9980; } }

    /* ── Image preview ───────────────────────────── */
    .preview-backdrop { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,.88); display: flex; align-items: center; justify-content: center; cursor: zoom-out; animation: fadeIn .18s ease; }
    .preview-container { position: relative; max-width: 90vw; max-height: 88vh; cursor: default; display: flex; flex-direction: column; align-items: center; animation: scaleIn .18s ease; }
    .preview-title { font-family: 'Mikadan', sans-serif; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: #e8a090; margin-bottom: 12px; }
    .preview-frame { border: 1px solid rgba(200,80,60,.35); box-shadow: 0 0 0 1px rgba(0,0,0,.8), 0 8px 40px rgba(0,0,0,.9); background: rgba(14,6,4,.95); padding: 6px; img { display: block; max-width: 88vw; max-height: 78vh; object-fit: contain; } }
    .preview-close {
      position: absolute; top: -14px; right: -14px; width: 28px !important; height: 28px !important; padding: 0 !important;
      background: rgba(40,14,10,.98) !important; border: 1px solid rgba(200,80,60,.4) !important; color: #c05040 !important; border-radius: 3px !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      mat-icon, .mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
      &:hover { background: rgba(200,80,60,.15) !important; color: #e8a090 !important; }
    }
    .preview-hint { margin-top: 10px; font-size: 10px; color: rgba(200,80,60,.3); letter-spacing: .1em; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">
      <!-- Header -->
      <div class="header">
        <div>
          <div class="header-title"><mat-icon>gavel</mat-icon>DM Questy &amp; Příběhy</div>
          <div class="header-subtitle">Pouze pro Pána Hry — hráči tuto stránku nevidí</div>
        </div>
        <div class="header-actions">
          <button class="btn btn-icon" (click)="expandAll()" matTooltip="Rozbalit vše"><mat-icon>unfold_more</mat-icon></button>
          <button class="btn btn-icon" (click)="collapseAll()" matTooltip="Sbalit vše"><mat-icon>unfold_less</mat-icon></button>
          <button class="btn" (click)="addQuest()"><mat-icon>add</mat-icon>Přidat quest</button>
          <button class="btn btn-save" (click)="save()"><mat-icon>save</mat-icon>Uložit</button>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (t of filterTabs; track t.value) {
            <button class="filter-tab" [class.filter-tab--active]="filterStatus() === t.value" (click)="filterStatus.set(t.value)">
              {{ t.label }}<span class="filter-count">{{ counts()[t.value] }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Grid -->
      <div class="quest-grid">
        @if (filtered().length === 0) {
          <div class="empty-state"><mat-icon>auto_stories</mat-icon>Žádné questy. Začni psát příběh!</div>
        }

        @for (item of filtered(); track item.quest.id) {
          <div class="quest-card" [style.border-left-color]="statusColor(item.quest.status)">
            <div class="quest-card-rule"></div>

            <!-- Card header -->
            <div class="card-header">
              <button class="status-badge status-badge--{{ item.quest.status }}" type="button"
                (click)="cycleStatus(item.idx)" matTooltip="Klikni pro změnu stavu">{{ statusLabel(item.quest.status) }}</button>
              <button class="diff-badge diff-badge--{{ item.quest.difficulty }}" type="button"
                (click)="cycleDiff(item.idx)" matTooltip="Obtížnost — klikni pro změnu">{{ diffLabel(item.quest.difficulty) }}</button>
              <!-- Stage pips -->
              <div class="stage-pips">
                @for (n of [1,2,3,4,5]; track n) {
                  <span class="stage-pip" [class.stage-pip--filled]="n <= item.quest.stage"
                    (click)="setStage(item.idx, n)" [matTooltip]="stageName(n)"></span>
                }
              </div>
              <span class="card-date">{{ item.quest.dateAdded }}</span>
              <div class="card-btns">
                <button mat-icon-button class="expand-btn" type="button" (click)="toggleExpand(item.quest.id)"
                  [matTooltip]="expandedIds().has(item.quest.id) ? 'Sbalit' : 'Rozbalit'">
                  <mat-icon>{{ expandedIds().has(item.quest.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
                <button mat-icon-button class="delete-btn" type="button" (click)="askDelete(item.idx)" matTooltip="Smazat">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>

            <!-- Stage progress bar -->
            @if (expandedIds().has(item.quest.id)) {
              <div class="expanded-body" style="padding-top:4px">
                <div class="stage-bar">
                  @for (n of [1,2,3,4,5]; track n) {
                    <div class="stage-seg" [class.stage-seg--active]="n <= item.quest.stage" (click)="setStage(item.idx, n)">
                      {{ stageName(n) }}
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Title -->
            <div class="title-row">
              <input class="title-input" [(ngModel)]="quests()[item.idx].title" placeholder="Název questu / příběhu..." />
            </div>

            @if (expandedIds().has(item.quest.id)) {
              <div class="expanded-body">
                <!-- Image -->
                <div class="image-wrap" [class.drag-over]="dragOver() === item.idx"
                  (click)="selectImage(item.idx)" (dragover)="onDragOver($event, item.idx)"
                  (dragleave)="dragOver.set(null)" (drop)="onDrop($event, item.idx)"
                  matTooltip="Klikni nebo přetáhni obrázek (max 200 KB)">
                  @if (quests()[item.idx].imageBase64) {
                    <img [src]="'data:image/png;base64,' + quests()[item.idx].imageBase64" [alt]="quests()[item.idx].title" />
                    <button mat-icon-button class="img-view-btn" type="button" (click)="openPreview($event, quests()[item.idx])" matTooltip="Plná velikost">
                      <mat-icon>open_in_full</mat-icon>
                    </button>
                  } @else {
                    <div class="img-placeholder"><mat-icon>image_search</mat-icon>Obrázek questu</div>
                  }
                  <div class="img-overlay"><mat-icon>upload</mat-icon></div>
                </div>

                <!-- Meta -->
                <div class="meta-row">
                  <div class="meta-field"><mat-icon class="meta-icon">place</mat-icon>
                    <input class="meta-input" [(ngModel)]="quests()[item.idx].location" placeholder="Lokalita / Oblast" /></div>
                  <div class="meta-field"><mat-icon class="meta-icon">group</mat-icon>
                    <input class="meta-input" [(ngModel)]="quests()[item.idx].partyMembers" placeholder="Členové skupiny (čárkami)" /></div>
                  <div class="meta-field"><mat-icon class="meta-icon" style="color:rgba(200,60,50,.45)">whatshot</mat-icon>
                    <input class="meta-input" [(ngModel)]="quests()[item.idx].antagonist" placeholder="Antagonista / Padouch" /></div>
                </div>

                <!-- ⚔ Player-visible section -->
                <div class="section-player">
                  <div class="section-label"><mat-icon>groups</mat-icon>CO VĚDÍ HRÁČI</div>
                  <div class="section-body">
                    <div class="rt-label">Popis pro hráče</div>
                    <div class="rt-wrap rt-wrap--player">
                      <rich-textarea [(ngModel)]="quests()[item.idx].playerDescription" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
                    </div>
                    <div class="reward-row">
                      <mat-icon class="reward-icon" style="color:rgba(200,160,60,.55)">payments</mat-icon>
                      <input class="reward-input" [(ngModel)]="quests()[item.idx].publicRewards" placeholder="Veřejná odměna (hráči to ví)..." />
                    </div>
                  </div>
                </div>

                <!-- 🔒 DM-only section -->
                <div class="section-dm">
                  <div class="section-label"><mat-icon>lock</mat-icon>POUZE PH — TAJNÉ POZNÁMKY</div>
                  <div class="section-body">
                    <div class="rt-label">DM poznámky &amp; plány</div>
                    <div class="rt-wrap">
                      <rich-textarea [(ngModel)]="quests()[item.idx].dmNotes" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
                    </div>
                    <div class="rt-label" style="margin-top:8px">Story hooks &amp; vodítka</div>
                    <div class="rt-wrap">
                      <rich-textarea [(ngModel)]="quests()[item.idx].storyHooks" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
                    </div>
                    <div class="reward-row">
                      <mat-icon class="reward-icon" style="color:rgba(200,60,50,.5)">lock</mat-icon>
                      <input class="reward-input reward-input--secret" [(ngModel)]="quests()[item.idx].secretRewards" placeholder="Tajná odměna / DM plán..." />
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </spinner-overlay>

    <input #globalFile type="file" accept="image/*" class="img-file-input" (change)="onImageSelected($event)" />

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

    @if (previewQuest()) {
      <div class="preview-backdrop" (click)="closePreview()">
        <div class="preview-container" (click)="$event.stopPropagation()">
          <button mat-icon-button class="preview-close" (click)="closePreview()"><mat-icon>close</mat-icon></button>
          @if (previewQuest()!.title) { <div class="preview-title">{{ previewQuest()!.title }}</div> }
          <div class="preview-frame"><img [src]="'data:image/png;base64,' + previewQuest()!.imageBase64" [alt]="previewQuest()!.title" /></div>
          <div class="preview-hint">Klikni mimo nebo Esc pro zavření</div>
        </div>
      </div>
    }
  `,
})
export class DmQuestsComponent {
  readonly store = inject(DmPageStore);
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);

  quests = signal<DmQuestEntry[]>([]);
  filterStatus = signal<FilterStatus>('all');
  expandedIds = signal<Set<string>>(new Set());
  confirmIdx = signal<number | null>(null);
  dragOver = signal<number | null>(null);
  previewQuest = signal<DmQuestEntry | null>(null);
  private pendingFileIdx = signal<number | null>(null);
  private readonly globalFile = viewChild<ElementRef<HTMLInputElement>>('globalFile');

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

  toggleExpand(id: string): void {
    this.expandedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  expandAll(): void { this.expandedIds.set(new Set(this.quests().map(q => q.id))); }
  collapseAll(): void { this.expandedIds.set(new Set()); }

  cycleStatus(idx: number): void {
    const order: DmQuestStatus[] = ['planned', 'active', 'climax', 'completed', 'abandoned'];
    this.quests.update(list => list.map((q, i) => i !== idx ? q : { ...q, status: order[(order.indexOf(q.status) + 1) % order.length] }));
  }
  cycleDiff(idx: number): void {
    const order: DmQuestDifficulty[] = ['trivial', 'easy', 'medium', 'hard', 'deadly'];
    this.quests.update(list => list.map((q, i) => i !== idx ? q : { ...q, difficulty: order[(order.indexOf(q.difficulty) + 1) % order.length] }));
  }
  setStage(idx: number, stage: number): void {
    this.quests.update(list => list.map((q, i) => i !== idx ? q : { ...q, stage }));
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

  // ── Image ────────────────────────────────────────────────────────────────
  selectImage(idx: number): void { this.pendingFileIdx.set(idx); this.globalFile()?.nativeElement.click(); }
  onDragOver(e: DragEvent, idx: number): void { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; this.dragOver.set(idx); }
  onDrop(e: DragEvent, idx: number): void { e.preventDefault(); e.stopPropagation(); this.dragOver.set(null); const f = e.dataTransfer?.files?.[0]; if (f) this.processFile(f, idx); }
  onImageSelected(e: Event): void {
    const idx = this.pendingFileIdx(); if (idx === null) return;
    const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    this.processFile(file, idx); input.value = ''; this.pendingFileIdx.set(null);
  }
  private processFile(file: File, idx: number): void {
    if (!file.type.startsWith('image/')) { this.snack.open('Soubor není obrázek.', 'Zavřít', { verticalPosition: 'top', duration: 3000 }); return; }
    if (file.size > 200 * 1024) { this.snack.open(`Obrázek příliš velký (${(file.size/1024).toFixed(0)} KB). Max 200 KB.`, 'Zavřít', { verticalPosition: 'top', duration: 5000 }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.quests.update(list => { const c = list.map(q => ({ ...q })); c[idx] = { ...c[idx], imageBase64: base64 }; return c; });
    };
    reader.readAsDataURL(file);
  }
  openPreview(e: MouseEvent, q: DmQuestEntry): void { e.stopPropagation(); this.previewQuest.set(q); }
  closePreview(): void { this.previewQuest.set(null); }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.previewQuest()) { this.closePreview(); return; } if (this.confirmIdx() !== null) this.cancelDelete(); }

  // ── Labels / colours ─────────────────────────────────────────────────────
  statusLabel(s: DmQuestStatus): string {
    return { planned: 'Naplánováno', active: 'Aktivní', climax: 'Vyvrcholení', completed: 'Dokončeno', abandoned: 'Opuštěno' }[s];
  }
  diffLabel(d: DmQuestDifficulty): string {
    return { trivial: 'Trivální', easy: 'Lehké', medium: 'Střední', hard: 'Těžké', deadly: 'Smrtelné' }[d];
  }
  statusColor(s: DmQuestStatus): string {
    return { planned: 'rgba(100,130,200,.8)', active: 'rgba(80,190,100,.8)', climax: 'rgba(220,120,40,.9)', completed: 'rgba(200,160,60,.85)', abandoned: 'rgba(80,80,80,.5)' }[s];
  }
  stageName(n: number): string { return STAGE_LABELS[n - 1] ?? ''; }
}

