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
import { SpinnerOverlayComponent, RichTextareaComponent } from '@dn-d-servant/ui';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DmPageStore } from '../../dm-page.store';
import { StoryEvent, StoryEventType } from '../../dm-page-models';

// ── Fuzzy-search helpers ──────────────────────────────────────────────────────
function posNorm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function fuzzySubsequence(query: string, text: string): number[] | null {
  const indices: number[] = [];
  let ti = 0;
  for (let qi = 0; qi < query.length; qi++) {
    const ch = query[qi];
    while (ti < text.length && text[ti] !== ch) ti++;
    if (ti >= text.length) return null;
    indices.push(ti);
    ti++;
  }
  return indices;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHighlightHtml(original: string, indices: number[]): string {
  const matchSet = new Set(indices);
  const parts: string[] = [];
  let inSpan = false;
  for (let i = 0; i < original.length; i++) {
    const ch = escHtml(original[i]);
    if (matchSet.has(i)) {
      if (!inSpan) { parts.push('<span class="hl">'); inSpan = true; }
      parts.push(ch);
    } else {
      if (inSpan) { parts.push('</span>'); inSpan = false; }
      parts.push(ch);
    }
  }
  if (inSpan) parts.push('</span>');
  return parts.join('');
}

const TYPE_META: Record<StoryEventType, { label: string; icon: string; color: string; bg: string }> = {
  world:     { label: 'Světová událost',  icon: 'public',       color: 'rgba(100,140,210,.9)', bg: 'rgba(70,110,190,.10)' },
  campaign:  { label: 'Událost kampaně',  icon: 'auto_stories', color: 'rgba(210,175,55,.9)',  bg: 'rgba(190,155,40,.10)' },
  character: { label: 'Událost postav',   icon: 'person',       color: 'rgba(60,185,150,.9)',  bg: 'rgba(40,160,120,.10)' },
  other:     { label: 'Jiné',             icon: 'bookmark',     color: 'rgba(130,130,130,.8)', bg: 'rgba(100,100,100,.08)'},
};

const TYPE_ORDER: StoryEventType[] = ['world', 'campaign', 'character', 'other'];

type FilterType = 'all' | StoryEventType;
type SortOrder  = 'newest' | 'oldest';

// Accent colour used for UI chrome (timeline line, buttons, borders)
const AC  = '80,160,130'; // teal accent – RGB triplet
const ACL = '110,190,160'; // lighter teal

@Component({
  selector: 'dm-story-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent, RichTextareaComponent],
  host: { '(document:keydown.escape)': 'onEscape()' },
  styles: `
    :host { display: block; padding: 13px 0 20px; font-family: sans-serif; overflow: visible; }

    /* ── Header ───────────────────────────────────── */
    .header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 20px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(155,140,115,.5) 20%, rgba(175,160,130,.7) 50%, rgba(155,140,115,.5) 80%, transparent) 1;
    }
    .header-title { font-size: 22px; letter-spacing: .12em; text-transform: uppercase; color: #d8cdb8;
      text-shadow: 0 0 18px rgba(155,140,115,.3); display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #9e8f78; }
    }
    .header-subtitle { font-size: 11px; color: rgba(155,140,115,.45); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }
    .header-actions { display: flex; gap: 8px; align-items: end; justify-content: end; flex-wrap: wrap; margin-bottom: var(--spacing-4) }

    /* ── Buttons ─────────────────────────────────── */
    .btn { font-family: sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(155,140,115,.35); border-radius: 3px; background: rgba(140,125,100,.08); color: rgba(175,160,135,.85);
      padding: 6px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(140,125,100,.16); border-color: rgba(155,140,115,.6); color: #d8cdb8; }
    }
    .btn-icon { padding: 6px 10px; }
    .btn-save { border-color: rgba(80,160,80,.35); color: rgba(100,200,100,.8); background: rgba(60,120,60,.08);
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── pt-filter-btn icon support ─────────────── */
    .pt-filter-btn { display: inline-flex; align-items: center; gap: 5px;
      mat-icon, .mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    /* ── Filter / sort bar ───────────────────────── */
    .filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .filter-bar-spacer { flex: 1; }
    .filter-count { background: rgba(255,255,255,.08); border-radius: 10px; padding: 0 6px; font-size: 9px; min-width: 18px; text-align: center; line-height: 16px; }
    .sort-select {
      font-family: sans-serif; font-size: 10px; letter-spacing: .08em;
      background: rgba(140,125,100,.08); border: 1px solid rgba(155,140,115,.25); border-radius: 3px;
      color: rgba(175,160,135,.85); padding: 4px 10px; cursor: pointer;
      option { background: #141008; }
    }

    /* ── Tag filter row ──────────────────────────── */
    .tag-filter-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; padding: 6px 0; }
    .tag-filter-label { font-family: sans-serif; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: rgba(155,140,115,.4); flex-shrink: 0; }
    .tag-filter-chip {
      font-family: sans-serif; font-size: 12px; padding: 3px 10px; border-radius: 10px; cursor: pointer; border: 1px solid; transition: background .12s, color .12s;
      background: transparent; color: rgba(155,140,115,.65); border-color: rgba(155,140,115,.2);
      &:hover { background: rgba(140,125,100,.1); color: rgba(175,160,135,.85); border-color: rgba(155,140,115,.4); }
      &--active { background: rgba(140,125,100,.2); color: #d8cdb8; border-color: rgba(155,140,115,.6); }
    }

    /* ── Timeline container ──────────────────────── */
    .timeline { position: relative; padding-left: 48px; }
    .timeline-line {
      position: absolute; left: 16px; top: 0; bottom: 0; width: 2px;
      background: linear-gradient(180deg, transparent, rgba(155,140,115,.28) 5%, rgba(155,140,115,.28) 95%, transparent);
    }

    /* ── Timeline node ─────────────────────────── */
    .tl-node {
      position: absolute; left: -40px; top: 18px;
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid; background: rgba(14,12,8,.96);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    /* ── Event card ──────────────────────────────── */
    .event-card {
      position: relative; border-radius: 3px; margin-bottom: 20px;
      background: rgba(22,20,18,.97);
      border: 1px solid rgba(200,160,60,.15);
      box-shadow: 0 4px 20px rgba(0,0,0,.55);
      transition: border-color .2s, box-shadow .2s; overflow: hidden;
      &:hover { border-color: rgba(200,160,60,.28); box-shadow: 0 6px 28px rgba(0,0,0,.65); }
    }

    /* ── Card header ────────────────────────────── */
    .card-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px 7px; flex-wrap: wrap; cursor: pointer; user-select: none; }
    .type-badge {
      font-family: sans-serif; font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
      border-radius: 6px; padding: 4px 12px; cursor: pointer; border: 1px solid currentColor;
      transition: filter .15s; white-space: nowrap; flex-shrink: 0;
      &:hover { filter: brightness(1.18); }
    }
    .card-title-wrap { flex: 1; min-width: 0; overflow: hidden; }
    .card-title {
      font-family: sans-serif; font-size: 16px; font-weight: 500; color: #ddd5c5;
      display: flex; align-items: center; gap: 10px; overflow: hidden;
      &--placeholder { color: rgba(200,185,160,.2); font-style: italic; }
    }
    .card-title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 1; min-width: 0; }
    .card-date     { font-family: sans-serif; font-size: 9px; color: rgba(175,160,135,.42); letter-spacing: .04em; white-space: nowrap; flex-shrink: 0; }
    .card-location { font-family: sans-serif; font-size: 10px; color: rgba(175,160,135,.35); letter-spacing: .03em;
      display: flex; align-items: center; gap: 3px; white-space: nowrap; flex-shrink: 0;
      mat-icon { font-size: 11px; width: 11px; height: 11px; }
    }
    .card-actions { display: flex; gap: 2px; align-items: center; flex-shrink: 0; }
    .card-action-btn {
      background: none; border: none; cursor: pointer; color: rgba(155,140,115,.38); padding: 4px; border-radius: 3px;
      transition: color .15s, background .15s; display: flex; align-items: center;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: rgba(185,170,140,.8); background: rgba(140,125,100,.1); }
      &--danger:hover { color: rgba(220,80,70,.8); background: rgba(200,60,50,.1); }
    }
    .expand-chevron { transition: transform .2s; mat-icon { font-size: 16px; width: 16px; height: 16px; color: rgba(155,140,115,.38); } }
    .expand-chevron--open { transform: rotate(180deg); }

    /* ── Tag chips (collapsed view) ─────────────── */
    .tag-list { display: flex; gap: 5px; flex-wrap: wrap; padding: 0 12px 8px; }
    .tag-chip {
      font-family: sans-serif; font-size: 11px; padding: 3px 9px; border-radius: 10px;
      background: rgba(140,125,100,.1); border: 1px solid rgba(155,140,115,.2); color: rgba(185,170,140,.7);
      letter-spacing: .03em; display: inline-flex; align-items: center; gap: 4px;
    }

    /* ── Expanded body ───────────────────────────── */
    .card-body { padding: 0 12px 14px; display: flex; flex-direction: column; gap: 10px; }
    .field-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .field-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
    .field-label { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(155,140,115,.38); }
    .field-input {
      background: rgba(140,125,100,.06); border: 1px solid rgba(155,140,115,.16); border-radius: 3px;
      color: rgba(220,210,190,.85); font-family: sans-serif; font-size: 13px; padding: 6px 10px; width: 100%; box-sizing: border-box;
      &:focus { outline: none; border-color: rgba(155,140,115,.38); background: rgba(140,125,100,.1); }
      &::placeholder { color: rgba(155,140,115,.22); }
    }
    .rt-label { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(155,140,115,.38); margin-bottom: 3px; }
    .rt-wrap { position: relative; height: 160px; background: rgba(140,125,100,.05); border: 1px solid rgba(155,140,115,.13); border-radius: 3px; overflow: visible; margin-top: 44px; }

    /* ── Tag input (edit mode) ───────────────────── */
    .tag-input-wrap {
      display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
      background: rgba(140,125,100,.06); border: 1px solid rgba(155,140,115,.16); border-radius: 3px;
      padding: 5px 8px; min-height: 36px; cursor: text;
      &:focus-within { border-color: rgba(155,140,115,.38); background: rgba(140,125,100,.1); }
    }
    .tag-chip--removable {
      background: rgba(140,125,100,.14); border-color: rgba(155,140,115,.3); color: #d8cdb8;
      padding-right: 4px;
    }
    .tag-chip--preview {
      background: rgba(140,125,100,.08); border: 1px dashed rgba(155,140,115,.32);
      color: rgba(185,170,140,.52); font-style: italic;
    }
    .tag-chip-remove {
      background: none; border: none; cursor: pointer; color: rgba(185,170,140,.55); font-size: 14px; line-height: 1;
      padding: 2px 4px; display: flex; align-items: center; transition: color .12s, background .12s; border-radius: 3px;
      &:hover { color: rgba(220,80,70,.9); background: rgba(200,50,40,.15); }
    }

    /* ── Tag suggestion dropdown ─────────────────── */
    .tag-field-wrap { position: relative; }
    .tag-suggestions {
      position: absolute; top: calc(100% + 2px); left: 0; right: 0; z-index: 200;
      background: rgba(18,14,8,.98);
      border: 1px solid rgba(155,140,115,.35);
      border-radius: 4px;
      max-height: 180px; overflow-y: auto;
      box-shadow: 0 6px 20px rgba(0,0,0,.7);
    }
    .tag-suggestion-item {
      display: block; width: 100%; text-align: left; padding: 7px 12px;
      background: none; border: none; border-bottom: 1px solid rgba(155,140,115,.08);
      color: rgba(220,210,190,.75); font-size: 11px; font-family: sans-serif; cursor: pointer;
      transition: background .1s, color .1s;
      &:last-child { border-bottom: none; }
      &:hover, &--active { background: rgba(155,140,115,.12); color: #d8cdb8; }
    }
    ::ng-deep .tag-suggestions .hl { color: rgba(210,175,55,.95); font-weight: 700; }
    .tag-text-input {
      background: transparent; border: none; outline: none; color: rgba(220,210,190,.85);
      font-family: sans-serif; font-size: 12px; min-width: 100px; flex: 1;
      &::placeholder { color: rgba(155,140,115,.22); }
    }

    /* ── DM notes ────────────────────────────────── */
    .dm-section-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; padding: 4px 0; border: none; background: none; color: rgba(200,60,60,.5); font-family: sans-serif; font-size: 9px; letter-spacing: .12em; text-transform: uppercase;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover { color: rgba(220,80,80,.8); }
    }
    .dm-rt-wrap { position: relative; height: 90px; background: rgba(200,60,60,.05); border: 1px solid rgba(200,60,60,.12); border-radius: 3px; overflow: hidden; margin-top: 4px; }

    /* ── Image zone ──────────────────────────────── */
    .img-zone {
      border: 1px dashed rgba(155,140,115,.18); border-radius: 3px; background: rgba(140,125,100,.03);
      min-height: 56px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color .15s, background .15s; position: relative; overflow: hidden;
      &:hover, &--dragover { border-color: rgba(155,140,115,.42); background: rgba(140,125,100,.08); }
    }
    .img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: rgba(155,140,115,.28); font-size: 10px; letter-spacing: .06em;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .img-preview { width: 100%; max-height: 200px; object-fit: contain; display: block; cursor: zoom-in; }
    .img-remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,.6); border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; color: rgba(255,100,80,.8); display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: rgba(200,40,30,.4); }
    }
    .img-file-input { display: none; }

    /* ── Empty state ─────────────────────────────── */
    .empty-state { text-align: center; padding: 70px 20px; color: rgba(255,255,255,.1); font-size: 13px; letter-spacing: .1em;
      mat-icon { font-size: 54px; width: 54px; height: 54px; display: block; margin: 0 auto 16px; color: rgba(155,140,115,.1); }
    }

    /* ── Confirm dialog ──────────────────────────── */
    .confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.72); display: flex; align-items: center; justify-content: center; z-index: 1100; backdrop-filter: blur(3px); }
    .confirm-dialog { background: linear-gradient(160deg,rgba(22,18,12,.99),rgba(14,11,7,.99)); border: 1px solid rgba(200,80,60,.4); border-radius: 6px; padding: 28px 32px; max-width: 360px; width: 90vw; text-align: center; }
    .confirm-icon { color: rgba(220,60,50,.7); mat-icon { font-size: 36px; width: 36px; height: 36px; } }
    .confirm-title { font-size: 16px; letter-spacing: .1em; color: #f0b0b0; margin: 10px 0 6px; text-transform: uppercase; }
    .confirm-msg { font-size: 12px; color: rgba(220,180,180,.6); font-family: sans-serif; }
    .confirm-rule { height: 1px; background: linear-gradient(90deg,transparent,rgba(200,80,60,.3),transparent); margin: 16px 0; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn { font-family: sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; padding: 7px 20px; border-radius: 3px; cursor: pointer; border: 1px solid; }
    .confirm-cancel { color: rgba(180,160,140,.7); border-color: rgba(180,160,140,.25); background: transparent; &:hover { background: rgba(180,160,140,.08); } }
    .confirm-delete { color: rgba(220,80,70,.85); border-color: rgba(200,60,50,.4); background: rgba(200,50,40,.1); &:hover { background: rgba(200,50,40,.2); } }

    /* ── Image preview modal ─────────────────────── */
    .preview-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.88); display: flex; align-items: center; justify-content: center; z-index: 1200; backdrop-filter: blur(6px); }
    .preview-container { position: relative; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .preview-close { position: absolute; top: -14px; right: -14px; color: rgba(185,170,140,.6) !important; }
    .preview-title { font-family: sans-serif; font-size: 14px; color: #ddd5c5; text-align: center; }
    .preview-frame { border: 1px solid rgba(155,140,115,.28); border-radius: 4px; overflow: hidden; img { max-width: 85vw; max-height: 80vh; display: block; } }
    .preview-hint { font-size: 10px; color: rgba(155,140,115,.28); letter-spacing: .06em; }
  `,
  template: `
    <spinner-overlay [diameter]="60" [showSpinner]="store.loading()">

      <!-- Filter + actions row -->
      <div class="filter-bar">
        <button class="pt-filter-btn" [class.active]="filterType() === 'all'" (click)="filterType.set('all')">
          Vše <span class="filter-count">{{ events().length }}</span>
        </button>
        @for (t of typeKeys; track t) {
          <button class="pt-filter-btn" [class.active]="filterType() === t" (click)="filterType.set(t)">
            {{ typeMeta(t).label }}<span class="filter-count">{{ countByType()[t] ?? 0 }}</span>
          </button>
        }
        <select class="sort-select" [ngModel]="sortOrder()" (ngModelChange)="sortOrder.set($event)">
          <option value="newest">Nejnovější první</option>
          <option value="oldest">Nejstarší první</option>
        </select>
        <span class="filter-bar-spacer"></span>
        <button class="pt-filter-btn" (click)="toggleAllExpanded()" [matTooltip]="allExpanded() ? 'Sbalit vše' : 'Rozbalit vše'">
          <mat-icon>{{ allExpanded() ? 'unfold_less' : 'unfold_more' }}</mat-icon>
        </button>
        <button class="pt-filter-btn" (click)="addEvent()"><mat-icon>add</mat-icon> Přidat událost</button>
        <button class="btn btn-save" (click)="save()"><mat-icon>save</mat-icon> Uložit</button>
      </div>

      <!-- Tag filter row -->
      @if (allTags().length > 0) {
        <div class="tag-filter-row">
          <span class="tag-filter-label">Štítek:</span>
          <button class="tag-filter-chip" [class.tag-filter-chip--active]="filterTag() === null" (click)="filterTag.set(null)">vše</button>
          @for (tag of allTags(); track tag) {
            <button class="tag-filter-chip" [class.tag-filter-chip--active]="filterTag() === tag" (click)="filterTag.set(filterTag() === tag ? null : tag)">{{ tag }}</button>
          }
        </div>
      }

      <!-- Timeline -->
      <div class="timeline">
        <div class="timeline-line"></div>

        @if (filtered().length === 0) {
          <div class="empty-state">
            <mat-icon>auto_stories</mat-icon>
            @if (events().length === 0) { Ještě žádné události — přidejte první kapitolu příběhu }
            @else { Žádné události neodpovídají filtru }
          </div>
        }

        @for (item of filtered(); track item.event.id) {
          <div class="event-card">

            <div class="tl-node"
              [style.border-color]="typeMeta(item.event.type).color"
              [style.color]="typeMeta(item.event.type).color">
              <mat-icon>{{ typeMeta(item.event.type).icon }}</mat-icon>
            </div>

            <!-- Card header -->
            <div class="card-header" (click)="toggleExpand(item.event.id)">
              <span class="type-badge" [style.color]="typeMeta(item.event.type).color" [style.background]="typeMeta(item.event.type).bg"
                (click)="$event.stopPropagation(); cycleType(item.idx)" matTooltip="Kliknutím změnit typ">{{ typeMeta(item.event.type).label }}</span>

              <div class="card-title-wrap">
                <div class="card-title" [class.card-title--placeholder]="!item.event.title">
                  <span class="card-title-text">{{ item.event.title || 'Bez názvu…' }}</span>
                  @if (item.event.location) {
                    <span class="card-location"><mat-icon>location_on</mat-icon>{{ item.event.location }}</span>
                  }
                </div>
              </div>

              @if (item.event.realDate) {
                <span class="card-date">{{ item.event.realDate }}</span>
              }

              <div class="card-actions" (click)="$event.stopPropagation()">
                <button class="card-action-btn card-action-btn--danger" (click)="askDelete(item.idx)" matTooltip="Smazat událost">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
              <div class="expand-chevron" [class.expand-chevron--open]="expandedIds().has(item.event.id)">
                <mat-icon>expand_more</mat-icon>
              </div>
            </div>

            <!-- Tags (collapsed view) -->
            @if (parseTags(item.event.tags).length > 0 && !expandedIds().has(item.event.id)) {
              <div class="tag-list">
                @for (tag of parseTags(item.event.tags); track tag) {
                  <span class="tag-chip">{{ tag }}</span>
                }
              </div>
            }

            <!-- Expanded body -->
            @if (expandedIds().has(item.event.id)) {
              <div class="card-body">

                <!-- Row 1: title -->
                <div class="field-row">
                  <div class="field-group" style="flex:1;min-width:200px">
                    <div class="field-label">Název události</div>
                    <input class="field-input" [(ngModel)]="events()[item.idx].title" placeholder="Název…" />
                  </div>
                </div>

                <!-- Row 2: location + tag chip input -->
                <div class="field-row">
                  <div class="field-group">
                    <div class="field-label">Místo</div>
                    <input class="field-input" [(ngModel)]="events()[item.idx].location" placeholder="Město, dungeon, les…" />
                  </div>
                  <div class="field-group" style="flex:2">
                    <div class="field-label">Štítky</div>
                    <div class="tag-field-wrap">
                      <div class="tag-input-wrap" (click)="focusTagInput(item.event.id)">
                        @for (tag of parseTags(events()[item.idx].tags); track tag) {
                          <span class="tag-chip tag-chip--removable">
                            {{ tag }}
                            <button class="tag-chip-remove" type="button" (click)="$event.stopPropagation(); removeTag(item.idx, tag)">×</button>
                          </span>
                        }
                        <input
                          class="tag-text-input"
                          [id]="'tag-input-' + item.event.id"
                          [ngModel]="getTagInput(item.event.id)"
                          (ngModelChange)="setTagInput(item.event.id, $event)"
                          (keydown.enter)="$event.preventDefault(); onTagEnter(item.idx, item.event.id)"
                          (keydown.space)="$event.preventDefault(); addTagFromInput(item.idx)"
                          (keydown.arrowdown)="$event.preventDefault(); navigateSuggestions(item.event.id, 1)"
                          (keydown.arrowup)="$event.preventDefault(); navigateSuggestions(item.event.id, -1)"
                          (keydown.escape)="setActiveSuggIdx(item.event.id, -1)"
                          (blur)="onTagBlur(item.idx)"
                          placeholder="{{ parseTags(events()[item.idx].tags).length ? '' : 'Přidat štítek…' }}"
                        />
                      </div>
                      @if (getTagSuggestions(item.event.id).length > 0) {
                        <div class="tag-suggestions">
                          @for (sugg of getTagSuggestions(item.event.id); track sugg.tag; let si = $index) {
                            <button
                              class="tag-suggestion-item"
                              [class.tag-suggestion-item--active]="getActiveSuggIdx(item.event.id) === si"
                              type="button"
                              (mousedown)="$event.preventDefault()"
                              (click)="selectSuggestion(item.idx, sugg.tag)"
                            ><span [innerHTML]="sugg.html"></span></button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Summary -->
                <div>
                  <div class="rt-label">Shrnutí události</div>
                  <div class="rt-wrap" style="margin-top: 5px;">
                    <rich-textarea [(ngModel)]="events()[item.idx].summary" style="position:absolute;top:0;left:0;width:100%;height:100%;"></rich-textarea>
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
          <div class="confirm-title">Smazat událost?</div>
          <div class="confirm-msg">
            Opravdu smazat
            @if (events()[confirmIdx()!]?.title) { <strong>„{{ events()[confirmIdx()!].title }}"</strong> } @else { <strong>tuto událost</strong> }?
          </div>
          <div class="confirm-rule"></div>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-cancel" (click)="cancelDelete()">Zrušit</button>
            <button class="confirm-btn confirm-delete" (click)="confirmDelete()">Smazat</button>
          </div>
        </div>
      </div>
    }

    @if (previewEvent()) {
      <div class="preview-backdrop" (click)="closePreview()">
        <div class="preview-container" (click)="$event.stopPropagation()">
          <button mat-icon-button class="preview-close" (click)="closePreview()"><mat-icon>close</mat-icon></button>
          @if (previewEvent()!.title) { <div class="preview-title">{{ previewEvent()!.title }}</div> }
          <div class="preview-frame"><img [src]="'data:image/png;base64,' + previewEvent()!.imageBase64" [alt]="previewEvent()!.title" /></div>
          <div class="preview-hint">Klikni mimo nebo Esc pro zavření</div>
        </div>
      </div>
    }
  `,
})
export class DmStoryTimelineComponent {
  readonly store   = inject(DmPageStore);
  private readonly auth  = inject(AuthService);
  private readonly snack = inject(MatSnackBar);

  events      = signal<StoryEvent[]>([]);
  filterType  = signal<FilterType>('all');
  filterTag   = signal<string | null>(null);
  sortOrder   = signal<SortOrder>('newest');
  expandedIds = signal<Set<string>>(new Set());
  dmNotesOpen = signal<Set<string>>(new Set());
  confirmIdx  = signal<number | null>(null);
  dragOver    = signal<number | null>(null);
  previewEvent = signal<StoryEvent | null>(null);

  /** Per-event current tag text being typed */
  private tagInputMap = signal<Record<string, string>>({});

  private pendingFileIdx = signal<number | null>(null);
  private readonly globalFile = viewChild<ElementRef<HTMLInputElement>>('globalFile');

  readonly typeKeys = TYPE_ORDER;

  readonly countByType = computed((): Record<StoryEventType, number> => {
    const all = this.events();
    const r = {} as Record<StoryEventType, number>;
    for (const t of TYPE_ORDER) r[t] = all.filter(e => e.type === t).length;
    return r;
  });

  readonly allTags = computed((): string[] => {
    const set = new Set<string>();
    for (const e of this.events()) for (const t of this.parseTags(e.tags)) set.add(t);
    return [...set].sort();
  });

  readonly filtered = computed(() => {
    const ft  = this.filterType();
    const tag = this.filterTag();
    const asc = this.sortOrder() === 'oldest';
    return this.events()
      .map((event, idx) => ({ event, idx }))
      .filter(({ event }) => {
        if (ft !== 'all' && event.type !== ft) return false;
        if (tag && !this.parseTags(event.tags).includes(tag)) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.event.realDate || '0';
        const db = b.event.realDate || '0';
        return asc ? da.localeCompare(db) : db.localeCompare(da);
      });
  });

  constructor() {
    effect(() => {
      const data = this.store.dmStoryTimeline();
      untracked(() => { if (data?.events) this.events.set(data.events.map(e => ({ ...e }))); });
    });
    effect(() => {
      const username = this.auth.currentUser()?.username;
      untracked(() => { if (username) this.store.loadDmStoryTimeline(username); });
    });
  }

  addEvent(): void {
    const id = crypto.randomUUID();
    this.events.update(list => [{ id, title: '', inGameDate: '', realDate: new Date().toISOString().split('T')[0], type: 'other', summary: '', dmNotes: '', imageBase64: null, location: '', tags: '' } as StoryEvent, ...list]);
    this.expandedIds.update(s => new Set([...s, id]));
  }

  readonly allExpanded = computed(() =>
    this.events().length > 0 && this.events().every(e => this.expandedIds().has(e.id))
  );

  toggleExpand(id: string): void  { this.expandedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  expandAll():  void               { this.expandedIds.set(new Set(this.events().map(e => e.id))); }
  collapseAll(): void              { this.expandedIds.set(new Set()); }
  toggleAllExpanded(): void        { this.allExpanded() ? this.collapseAll() : this.expandAll(); }
  toggleDmNotes(id: string): void  { this.dmNotesOpen.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  cycleType(idx: number): void {
    this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, type: TYPE_ORDER[(TYPE_ORDER.indexOf(e.type) + 1) % TYPE_ORDER.length] }));
  }
  // ── Tags ──────────────────────────────────────────────────────────────────
  private readonly activeSuggIdxMap = signal<Record<string, number>>({});

  getTagInput(id: string): string            { return this.tagInputMap()[id] ?? ''; }
  setTagInput(id: string, val: string): void { this.tagInputMap.update(m => ({ ...m, [id]: val })); this.setActiveSuggIdx(id, -1); }
  focusTagInput(id: string): void            { document.getElementById('tag-input-' + id)?.focus(); }

  getActiveSuggIdx(id: string): number            { return this.activeSuggIdxMap()[id] ?? -1; }
  setActiveSuggIdx(id: string, n: number): void   { this.activeSuggIdxMap.update(m => ({ ...m, [id]: n })); }

  getTagSuggestions(eventId: string): Array<{ tag: string; html: string }> {
    const rawQuery = this.getTagInput(eventId).trim();
    if (!rawQuery) return [];
    const query = posNorm(rawQuery);
    const existingSet = new Set(this.parseTags(this.events().find(e => e.id === eventId)?.tags ?? ''));
    return this.allTags()
      .filter(tag => !existingSet.has(tag))
      .map(tag => {
        const indices = fuzzySubsequence(query, posNorm(tag));
        if (!indices) return null;
        return { tag, html: buildHighlightHtml(tag, indices) };
      })
      .filter((x): x is { tag: string; html: string } => x !== null);
  }

  selectSuggestion(idx: number, tag: string): void {
    const id = this.events()[idx]?.id; if (!id) return;
    const existing = this.parseTags(this.events()[idx].tags);
    if (!existing.includes(tag)) {
      this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...this.parseTags(e.tags), tag].join(' ') }));
    }
    this.setTagInput(id, '');
    this.setActiveSuggIdx(id, -1);
    document.getElementById('tag-input-' + id)?.focus();
  }

  navigateSuggestions(id: string, dir: 1 | -1): void {
    const len = this.getTagSuggestions(id).length;
    if (!len) return;
    const next = Math.max(-1, Math.min(len - 1, this.getActiveSuggIdx(id) + dir));
    this.setActiveSuggIdx(id, next);
  }

  onTagEnter(idx: number, id: string): void {
    const activeIdx = this.getActiveSuggIdx(id);
    const suggestions = this.getTagSuggestions(id);
    if (activeIdx >= 0 && activeIdx < suggestions.length) {
      this.selectSuggestion(idx, suggestions[activeIdx].tag);
    } else {
      this.addTagFromInput(idx);
    }
  }

  onTagBlur(idx: number): void {
    const id = this.events()[idx]?.id; if (!id) return;
    this.setActiveSuggIdx(id, -1);
    const val = this.getTagInput(id).trim(); if (!val) return;
    const existing = this.parseTags(this.events()[idx].tags);
    if (!existing.includes(val)) {
      this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...existing, val].join(' ') }));
    }
    this.setTagInput(id, '');
  }

  addTagFromInput(idx: number): void {
    const id  = this.events()[idx]?.id; if (!id) return;
    const val = this.getTagInput(id).trim(); if (!val) return;
    const existing = this.parseTags(this.events()[idx].tags);
    if (!existing.includes(val)) {
      this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...existing, val].join(' ') }));
    }
    this.setTagInput(id, '');
  }
  removeTag(idx: number, tag: string): void {
    this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: this.parseTags(e.tags).filter(t => t !== tag).join(' ') }));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  askDelete(idx: number): void  { this.confirmIdx.set(idx); }
  cancelDelete(): void          { this.confirmIdx.set(null); }
  confirmDelete(): void {
    const idx = this.confirmIdx(); if (idx === null) return;
    const id  = this.events()[idx]?.id;
    if (id) { this.expandedIds.update(s => { const n = new Set(s); n.delete(id); return n; }); this.dmNotesOpen.update(s => { const n = new Set(s); n.delete(id); return n; }); }
    this.events.update(list => list.filter((_, i) => i !== idx)); this.confirmIdx.set(null);
  }

  save(): void {
    const username = this.auth.currentUser()?.username;
    if (!username) { this.snack.open('Nejsi přihlášen.', 'Zavřít', { verticalPosition: 'top', duration: 3000 }); return; }
    this.store.saveDmStoryTimeline({ username, events: this.events() });
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  selectImage(idx: number): void { this.pendingFileIdx.set(idx); this.globalFile()?.nativeElement.click(); }
  removeImage(idx: number): void { this.events.update(list => list.map((e, i) => i !== idx ? e : { ...e, imageBase64: null })); }
  onDragOver(e: DragEvent, idx: number): void { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; this.dragOver.set(idx); }
  onDrop(e: DragEvent, idx: number): void     { e.preventDefault(); e.stopPropagation(); this.dragOver.set(null); const f = e.dataTransfer?.files?.[0]; if (f) this.processFile(f, idx); }
  onImageSelected(e: Event): void {
    const idx = this.pendingFileIdx(); if (idx === null) return;
    const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    this.processFile(file, idx); input.value = ''; this.pendingFileIdx.set(null);
  }
  private processFile(file: File, idx: number): void {
    if (!file.type.startsWith('image/')) { this.snack.open('Soubor není obrázek.', 'Zavřít', { verticalPosition: 'top', duration: 3000 }); return; }
    if (file.size > 200 * 1024) { this.snack.open(`Obrázek příliš velký (${(file.size / 1024).toFixed(0)} KB). Max 200 KB.`, 'Zavřít', { verticalPosition: 'top', duration: 5000 }); return; }
    const reader = new FileReader();
    reader.onload = () => { const b64 = (reader.result as string).split(',')[1]; this.events.update(l => { const c = l.map(e => ({ ...e })); c[idx] = { ...c[idx], imageBase64: b64 }; return c; }); };
    reader.readAsDataURL(file);
  }
  openPreview(e: MouseEvent, ev: StoryEvent): void { e.stopPropagation(); this.previewEvent.set(ev); }
  closePreview(): void                              { this.previewEvent.set(null); }

  onEscape(): void {
    if (this.previewEvent()) { this.closePreview(); return; }
    if (this.confirmIdx() !== null) this.cancelDelete();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  typeMeta(t: string) { return TYPE_META[t as StoryEventType] ?? TYPE_META['other']; }
  parseTags(tags: string): string[]      { return tags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean); }
}

