import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { QuestEntry, QuestPriority, QuestStatus } from '@dn-d-servant/character-sheet-util';
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type FilterStatus = 'all' | QuestStatus;
type SortMode = 'priority' | 'date';

const LS_QUESTS_KEY = 'dnd_quests_draft';
const LS_EXPANDED_KEY = 'dnd_quests_expanded';

@Component({
  selector: 'quests-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent, RichTextareaComponent],
  host: { '(document:keydown.escape)': 'onEscape()' },
  styles: `
    :host {
      display: block;
      padding: 24px 32px 40px;
      font-family: 'Mikadan', sans-serif;
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

    .quests-header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    /* ── Buttons ───────────────────────────────── */
    .btn-dnd {
      font-family: 'Mikadan', sans-serif;
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
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .filter-tab {
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 2px;
      background: transparent;
      color: rgba(255,255,255,.3);
      padding: 4px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background .15s, border-color .15s, color .15s;
      &:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.55); }
      &--active {
        background: rgba(200,160,60,.12);
        border-color: rgba(200,160,60,.45);
        color: #e8c96a;
      }
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
      display: flex;
      gap: 4px;
    }

    .sort-btn {
      font-family: 'Mikadan', sans-serif;
      font-size: 9px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 2px;
      background: transparent;
      color: rgba(255,255,255,.25);
      padding: 4px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background .15s, color .15s;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover { background: rgba(255,255,255,.04); color: rgba(255,255,255,.5); }
      &--active { color: rgba(200,160,60,.75); border-color: rgba(200,160,60,.25); }
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
      background: linear-gradient(160deg, rgba(42,32,14,.97) 0%, rgba(28,20,8,.99) 100%);
      border: 1px solid rgba(200,160,60,.15);
      border-left: 3px solid transparent;
      box-shadow: 0 4px 20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.04);
      transition: border-color .2s, box-shadow .2s;
      overflow: visible;

      &::before {
        content: '◆';
        position: absolute;
        top: 5px; left: 8px;
        font-size: 6px;
        color: rgba(200,160,60,.25);
        pointer-events: none;
      }

      &:hover {
        border-color: rgba(200,160,60,.3);
        box-shadow: 0 6px 28px rgba(0,0,0,.65), 0 0 10px rgba(200,160,60,.06), inset 0 1px 0 rgba(255,220,100,.06);
      }

      &--completed {
        background: linear-gradient(160deg, rgba(30,42,20,.97) 0%, rgba(18,28,10,.99) 100%);
        border-color: rgba(80,160,80,.2);
      }

      &--failed {
        background: linear-gradient(160deg, rgba(42,18,14,.97) 0%, rgba(28,10,8,.99) 100%);
        border-color: rgba(160,60,50,.2);
      }
    }

    .quest-card-rule {
      height: 2px;
      background: linear-gradient(90deg,
        rgba(200,160,60,.0) 0%, rgba(200,160,60,.4) 30%,
        rgba(240,200,80,.7) 50%, rgba(200,160,60,.4) 70%,
        rgba(200,160,60,.0) 100%);
    }

    /* ── Card header ───────────────────────────── */
    .quest-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px 6px;
      cursor: pointer;
      transition: background .15s;
      &:hover { background: rgba(200,160,60,.04); }
    }

    .status-badge {
      font-family: 'Mikadan', sans-serif;
      font-size: 8px;
      letter-spacing: .12em;
      text-transform: uppercase;
      border-radius: 10px;
      padding: 2px 9px;
      cursor: pointer;
      border: 1px solid currentColor;
      transition: opacity .15s, filter .15s;
      white-space: nowrap;
      flex-shrink: 0;
      &:hover { filter: brightness(1.2); }

      &--active   { color: rgba(80,190,100,.9); background: rgba(60,160,80,.12); }
      &--completed { color: rgba(200,160,60,.9); background: rgba(200,160,60,.12); }
      &--failed    { color: rgba(210,80,70,.9); background: rgba(180,50,40,.12); }
      &--inactive  { color: rgba(140,140,140,.7); background: rgba(120,120,120,.08); }
    }

    .priority-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
      cursor: pointer;
      transition: transform .15s, filter .15s;
      border: 1px solid rgba(255,255,255,.15);
      &:hover { transform: scale(1.35); filter: brightness(1.3); }

      &--critical { background: rgba(180,30,30,.9); box-shadow: 0 0 6px rgba(180,30,30,.5); }
      &--high     { background: rgba(200,100,30,.9); box-shadow: 0 0 6px rgba(200,100,30,.4); }
      &--medium   { background: rgba(200,160,60,.9); box-shadow: 0 0 6px rgba(200,160,60,.35); }
      &--low      { background: rgba(80,120,180,.85); box-shadow: 0 0 6px rgba(80,120,180,.3); }
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
      font-family: 'Mikadan', sans-serif;
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

    /* ── Image area ────────────────────────────── */
    .quest-image-wrap {
      position: relative;
      height: 130px;
      background:
        repeating-linear-gradient(45deg, rgba(200,160,60,.02) 0px, rgba(200,160,60,.02) 1px, transparent 1px, transparent 8px),
        rgba(14,10,4,.5);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      border-bottom: 1px solid rgba(200,160,60,.08);
      transition: background .18s;

      img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .image-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        color: rgba(200,160,60,.22);
        font-size: 9px;
        letter-spacing: .1em;
        text-transform: uppercase;
        pointer-events: none;
        mat-icon { font-size: 28px; width: 28px; height: 28px; }
      }

      .image-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity .18s;
        pointer-events: none;
        mat-icon { color: #e8c96a; font-size: 24px; width: 24px; height: 24px; }
      }
      &:hover .image-overlay { opacity: 1; }

      &.drag-over {
        background:
          repeating-linear-gradient(45deg, rgba(200,160,60,.06) 0px, rgba(200,160,60,.06) 1px, transparent 1px, transparent 8px),
          rgba(30,22,8,.85);
        box-shadow: inset 0 0 0 2px rgba(200,160,60,.5);
        .image-overlay { opacity: 1; background: rgba(200,160,60,.1); }
      }
    }

    .quest-img-view-btn {
      position: absolute;
      top: 5px; right: 5px;
      z-index: 2;
      width: 24px !important; height: 24px !important;
      padding: 0 !important;
      background: rgba(0,0,0,.6) !important;
      color: rgba(200,160,60,.8) !important;
      border-radius: 2px !important;
      display: inline-flex !important;
      align-items: center !important; justify-content: center !important;
      mat-icon, .mat-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
      &:hover { background: rgba(0,0,0,.85) !important; color: #e8c96a !important; }
    }

    .image-file-input { display: none; }

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

      &::before { content: '◆'; position: absolute; top: 7px; left: 9px; font-size: 7px; color: rgba(200,160,60,.4); pointer-events: none; }
      &::after  { content: '◆'; position: absolute; bottom: 7px; right: 9px; font-size: 7px; color: rgba(200,160,60,.4); pointer-events: none; }
    }

    .confirm-icon { display: flex; justify-content: center; margin-bottom: 12px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: rgba(200,80,60,.7); }
    }
    .confirm-title { font-family: 'Mikadan', sans-serif; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; color: #e8c96a; text-align: center; margin-bottom: 10px; }
    .confirm-message { font-size: 12px; color: #a09070; text-align: center; line-height: 1.6; margin-bottom: 22px;
      strong { color: #d4a84b; font-style: italic; }
    }
    .confirm-rule { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,160,60,.3) 50%, transparent); margin-bottom: 18px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn {
      font-family: 'Mikadan', sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 3px; padding: 7px 20px; cursor: pointer; transition: background .18s, border-color .18s, color .18s;
    }
    .confirm-btn-cancel { background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.25); color: rgba(200,160,60,.65);
      &:hover { background: rgba(200,160,60,.14); border-color: rgba(200,160,60,.5); color: #e8c96a; }
    }
    .confirm-btn-delete { background: rgba(160,40,30,.25); border: 1px solid rgba(200,60,50,.4); color: rgba(220,100,80,.85);
      &:hover { background: rgba(180,40,30,.45); border-color: rgba(220,80,60,.7); color: #ff9980; }
    }

    /* ── Full-scale image preview ──────────────── */
    .img-preview-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,.88);
      display: flex; align-items: center; justify-content: center;
      cursor: zoom-out; animation: fadeIn .18s ease;
    }
    .img-preview-container {
      position: relative; max-width: 90vw; max-height: 88vh;
      cursor: default; display: flex; flex-direction: column; align-items: center;
      animation: scaleIn .18s ease;
    }
    .img-preview-title { font-family: 'Mikadan', sans-serif; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: #e8c96a; text-shadow: 0 0 12px rgba(200,160,60,.4); margin-bottom: 12px; }
    .img-preview-frame {
      border: 1px solid rgba(200,160,60,.35);
      box-shadow: 0 0 0 1px rgba(0,0,0,.8), 0 8px 40px rgba(0,0,0,.9), 0 0 60px rgba(200,160,60,.08);
      background: rgba(14,10,4,.95); padding: 6px;
      img { display: block; max-width: 88vw; max-height: 78vh; object-fit: contain; }
    }
    .img-preview-close {
      position: absolute; top: -14px; right: -14px;
      width: 28px !important; height: 28px !important; padding: 0 !important;
      background: rgba(40,28,10,.98) !important; border: 1px solid rgba(200,160,60,.4) !important;
      color: #c8a03c !important; border-radius: 3px !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      mat-icon, .mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
      .mat-mdc-button-touch-target, .mat-mdc-button-persistent-ripple, .mdc-icon-button__ripple { display: none !important; }
      &:hover { background: rgba(200,160,60,.15) !important; color: #e8c96a !important; }
    }
    .img-preview-hint { margin-top: 10px; font-size: 10px; color: rgba(200,160,60,.3); letter-spacing: .1em; }

    /* ── Auto-save indicator ─────────────────── */
    .autosave-msg {
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: .1em;
      color: rgba(100,180,110,.6);
      animation: fadeIn .2s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">

      <!-- ── Header ──────────────────────────────────── -->
      <div class="quests-header">
        <div>
          <div class="quests-title">
            <mat-icon>menu_book</mat-icon>
            Deník Dobrodružství
          </div>
          <div class="quests-subtitle">
            Zaznamenej si questy, úkoly a dobrodružství, která tě čekají
          </div>
        </div>
        <div class="quests-header-actions">
          @if (autoSaveStatus() === 'saved') {
            <span class="autosave-msg">✓ Uloženo</span>
          }
          <button class="btn-dnd btn-dnd-icon" type="button" (click)="expandAll()" matTooltip="Rozbalit vše">
            <mat-icon>unfold_more</mat-icon>
          </button>
          <button class="btn-dnd btn-dnd-icon" type="button" (click)="collapseAll()" matTooltip="Sbalit vše">
            <mat-icon>unfold_less</mat-icon>
          </button>
          <button class="btn-dnd" type="button" (click)="addQuest()" matTooltip="Přidat nový quest">
            <mat-icon>add</mat-icon>
            Přidat quest
          </button>
          <button class="btn-dnd btn-dnd-save" type="button" (click)="save()" matTooltip="Uložit questy do databáze">
            <mat-icon>save</mat-icon>
            Uložit
          </button>
        </div>
      </div>

      <!-- ── Filter + sort bar ───────────────────────── -->
      <div class="quests-filter-bar">
        <div class="filter-tabs">
          @for (tab of filterTabs; track tab.value) {
            <button
              type="button"
              class="filter-tab"
              [class.filter-tab--active]="filterStatus() === tab.value"
              (click)="filterStatus.set(tab.value)"
            >
              {{ tab.label }}
              <span class="filter-count">{{ statusCounts()[tab.value] }}</span>
            </button>
          }
        </div>
        <div class="sort-tabs">
          <button type="button" class="sort-btn" [class.sort-btn--active]="sortMode() === 'priority'" (click)="sortMode.set('priority')">
            <mat-icon>priority_high</mat-icon> Priorita
          </button>
          <button type="button" class="sort-btn" [class.sort-btn--active]="sortMode() === 'date'" (click)="sortMode.set('date')">
            <mat-icon>calendar_today</mat-icon> Datum
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
            [style.border-left-color]="priorityColor(item.quest.priority)"
          >
            <div class="quest-card-rule"></div>

            <!-- Header row -->
            <div class="quest-card-header" (click)="toggleExpand(item.quest.id)">
              <button
                class="status-badge status-badge--{{ item.quest.status }}"
                type="button"
                (click)="cycleStatus(item.idx); $event.stopPropagation()"
                matTooltip="Klikni pro změnu stavu"
              >{{ statusLabel(item.quest.status) }}</button>
              <span
                class="priority-dot priority-dot--{{ item.quest.priority }}"
                (click)="cyclePriority(item.idx); $event.stopPropagation()"
                [matTooltip]="'Priorita: ' + priorityLabel(item.quest.priority) + ' — klikni pro změnu'"
              ></span>
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
                <!-- Image drop zone -->
                <div
                  class="quest-image-wrap"
                  [class.drag-over]="dragOverIndex() === item.idx"
                  (click)="selectImage(item.idx)"
                  (dragover)="onDragOver($event, item.idx)"
                  (dragleave)="onDragLeave()"
                  (drop)="onDrop($event, item.idx)"
                  matTooltip="Klikni nebo přetáhni obrázek questu (max 200 KB)"
                >
                  @if (quests()[item.idx].imageBase64) {
                    <img
                      [src]="'data:image/png;base64,' + quests()[item.idx].imageBase64"
                      [alt]="quests()[item.idx].title"
                    />
                    <button
                      mat-icon-button
                      class="quest-img-view-btn"
                      type="button"
                      (click)="openPreview($event, quests()[item.idx])"
                      matTooltip="Zobrazit v plné velikosti"
                    >
                      <mat-icon>open_in_full</mat-icon>
                    </button>
                  } @else {
                    <div class="image-placeholder">
                      <mat-icon>image_search</mat-icon>
                      Klikni nebo přetáhni obrázek
                    </div>
                  }
                  <div class="image-overlay"><mat-icon>upload</mat-icon></div>
                </div>

                <!-- Meta fields -->
                <div class="quest-meta-row">
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon">person</mat-icon>
                    <input class="quest-meta-input" [(ngModel)]="quests()[item.idx].npcName" (ngModelChange)="scheduleAutoSave()" placeholder="NPC / Zadavatel" />
                  </div>
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon">place</mat-icon>
                    <input class="quest-meta-input" [(ngModel)]="quests()[item.idx].location" (ngModelChange)="scheduleAutoSave()" placeholder="Lokalita / Oblast" />
                  </div>
                  <div class="quest-meta-field">
                    <mat-icon class="quest-meta-icon" style="color:rgba(200,160,60,.55)">payments</mat-icon>
                    <input class="quest-meta-input quest-meta-input--gold" [(ngModel)]="quests()[item.idx].rewards" (ngModelChange)="scheduleAutoSave()" placeholder="Odměna, zkušenosti, předměty..." />
                  </div>
                </div>

                <!-- Rich notes -->
                <div class="quest-section-label">
                  <mat-icon>notes</mat-icon>
                  Zápisky &amp; Postup
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

    <!-- Single hidden file input for image selection -->
    <input #globalFileInput type="file" accept="image/*" class="image-file-input" (change)="onImageSelected($event)" />

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

    <!-- Full-scale image preview -->
    @if (previewQuest()) {
      <div class="img-preview-backdrop" (click)="closePreview()">
        <div class="img-preview-container" (click)="$event.stopPropagation()">
          <button mat-icon-button type="button" class="img-preview-close" (click)="closePreview()" matTooltip="Zavřít">
            <mat-icon>close</mat-icon>
          </button>
          @if (previewQuest()!.title) {
            <div class="img-preview-title">{{ previewQuest()!.title }}</div>
          }
          <div class="img-preview-frame">
            <img [src]="'data:image/png;base64,' + previewQuest()!.imageBase64" [alt]="previewQuest()!.title" />
          </div>
          <div class="img-preview-hint">Klikni mimo obrázek nebo stiskni Esc pro zavření</div>
        </div>
      </div>
    }
  `,
})
export class QuestsTabComponent {
  readonly store = inject(CharacterSheetStore);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly _doc = inject(DOCUMENT);

  quests = signal<QuestEntry[]>([]);
  filterStatus = signal<FilterStatus>('all');
  sortMode = signal<SortMode>('priority');
  expandedIds = signal<Set<string>>(new Set(this._loadExpandedIds()));
  confirmDeleteIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);
  previewQuest = signal<QuestEntry | null>(null);
  private pendingFileIdx = signal<number | null>(null);

  private readonly globalFileInput = viewChild<ElementRef<HTMLInputElement>>('globalFileInput');

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
    const sm = this.sortMode();
    let filtered = this.quests().map((quest, idx) => ({ quest, idx }));
    if (fs !== 'all') {
      filtered = filtered.filter(({ quest }) => quest.status === fs);
    }
    const priorityOrder: Record<QuestPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    if (sm === 'priority') {
      filtered.sort((a, b) => {
        const pd = priorityOrder[a.quest.priority] - priorityOrder[b.quest.priority];
        return pd !== 0 ? pd : b.quest.dateAdded.localeCompare(a.quest.dateAdded);
      });
    } else {
      filtered.sort((a, b) => b.quest.dateAdded.localeCompare(a.quest.dateAdded));
    }
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
      priority: 'medium',
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

  cyclePriority(idx: number): void {
    const order: QuestPriority[] = ['critical', 'high', 'medium', 'low'];
    this.quests.update(list =>
      list.map((q, i) => {
        if (i !== idx) return q;
        const next = order[(order.indexOf(q.priority) + 1) % order.length];
        return { ...q, priority: next };
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

  save(): void {
    const username = this.authService.currentUser()?.username;
    if (!username) return;
    this.store.saveQuests({ username, quests: this.quests() });
  }

  onEscape(): void {
    if (this.previewQuest()) {
      this.closePreview();
    } else if (this.confirmDeleteIndex() !== null) {
      this.cancelDelete();
    }
  }

  // ── Image handling ────────────────────────────────────────────────────────

  selectImage(idx: number): void {
    this.pendingFileIdx.set(idx);
    this.globalFileInput()?.nativeElement.click();
  }

  onDragOver(event: DragEvent, idx: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverIndex.set(idx);
  }

  onDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, idx: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverIndex.set(null);
    const file = event.dataTransfer?.files[0];
    if (file) this._processImageFile(file, idx);
  }

  onImageSelected(event: Event): void {
    const idx = this.pendingFileIdx();
    if (idx === null) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this._processImageFile(file, idx);
    (event.target as HTMLInputElement).value = '';
    this.pendingFileIdx.set(null);
  }

  private _processImageFile(file: File, idx: number): void {
    if (file.size > 200 * 1024) {
      this.snackBar.open('Obrázek je příliš velký (max 200 KB)', 'Zavřít', {
        verticalPosition: 'top',
        duration: 3000,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1] ?? result;
      this.quests.update(list =>
        list.map((q, i) => (i === idx ? { ...q, imageBase64: base64 } : q)),
      );
      this.scheduleAutoSave();
    };
    reader.readAsDataURL(file);
  }

  openPreview(event: MouseEvent, quest: QuestEntry): void {
    event.stopPropagation();
    this.previewQuest.set(quest);
  }

  closePreview(): void {
    this.previewQuest.set(null);
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  priorityColor(priority: QuestPriority): string {
    const map: Record<QuestPriority, string> = {
      critical: 'rgba(180,30,30,.9)',
      high: 'rgba(200,100,30,.9)',
      medium: 'rgba(200,160,60,.9)',
      low: 'rgba(80,120,180,.85)',
    };
    return map[priority];
  }

  statusLabel(status: QuestStatus): string {
    const map: Record<QuestStatus, string> = {
      active: 'Aktivní',
      completed: 'Splněno',
      failed: 'Neúspěch',
      inactive: 'Neaktivní',
    };
    return map[status];
  }

  priorityLabel(priority: QuestPriority): string {
    const map: Record<QuestPriority, string> = {
      critical: 'Kritická',
      high: 'Vysoká',
      medium: 'Střední',
      low: 'Nízká',
    };
    return map[priority];
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
}
