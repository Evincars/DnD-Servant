import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef,
  inject, input, signal, untracked, viewChild, WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RichTextareaComponent } from '@dn-d-servant/ui';
import { StoryEvent } from '../../dm-page-models';
import {
  TYPE_META, TYPE_ORDER, FilterType, SortOrder,
  parseTags, posNorm, fuzzySubsequence, buildHighlightHtml,
} from './dm-story-timeline.types';

@Component({
  selector: 'story-events-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  imports: [FormsModule, MatIcon, MatTooltip, RichTextareaComponent],
  styles: `
    /* ── Timeline container ──────────────────────── */
    .timeline { position: relative; padding-left: 48px; }
    .timeline-line {
      position: absolute; left: 16px; top: 0; bottom: 0; width: 2px;
      background: linear-gradient(180deg, transparent, rgba(155,140,115,.28) 5%, rgba(155,140,115,.28) 95%, transparent);
    }

    /* ── Timeline node — 12 px solid circle centered on line ── */
    .tl-node {
      position: absolute;
      left: -37px; top: 20px;
      width: 12px; height: 12px; border-radius: 50%;
      border: 2px solid rgba(14,12,8,.96);
    }

    /* ── Event card ──────────────────────────────── */
    .event-card {
      position: relative; border-radius: 3px; margin-bottom: 20px;
      background: rgba(22,20,18,.97); border: 1px solid rgba(200,160,60,.15);
      box-shadow: 0 4px 20px rgba(0,0,0,.55); transition: border-color .2s, box-shadow .2s; overflow: hidden;
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
    .card-date { font-family: sans-serif; font-size: 9px; color: rgba(175,160,135,.42); letter-spacing: .04em; white-space: nowrap; flex-shrink: 0; }
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
      &:disabled { opacity: .6; cursor: not-allowed; }
    }
    .rt-label { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(155,140,115,.38); }
    .rt-wrap { position: relative; height: 272px; background: rgba(140,125,100,.05); border: 1px solid rgba(155,140,115,.13); border-radius: 3px; overflow: visible; margin-top: 5px; }

    /* ── Summary row: 65 % textarea + 35 % image ─────── */
    .summary-row { display: flex; gap: 14px; align-items: flex-end; }
    .summary-row .rt-wrap { flex: 8; min-width: 0; }
    /* img-col total height = rt-wrap margin-top(44) + height(160) so bottoms align */
    .img-col { flex: 3.5; min-width: 0; display: flex; flex-direction: column; gap: 6px; height: calc(44px + 230px); }
    .img-url-input { font-size: 11px !important; padding: 5px 8px !important; }

    .img-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .img-clear-btn {
      width: 22px; height: 22px; border-radius: 2px; border: none; background: transparent; padding: 0;
      cursor: pointer; color: rgba(200,60,50,.45); display: inline-flex; align-items: center; justify-content: center;
      transition: color .12s, background .12s; flex-shrink: 0;
      mat-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }
      &:hover { color: rgba(220,80,70,.9); background: rgba(200,50,40,.12); }
    }
    .event-img {
      flex: 1; width: 100%; min-height: 0; object-fit: contain;
      border: 1px solid rgba(200,160,60,.25); background: rgba(14,10,4,.95);
      cursor: zoom-in; transition: opacity .15s; display: block;
      &:hover { opacity: .88; }
    }
    .img-error { font-size: 10px; color: rgba(220,80,70,.75); letter-spacing: .03em; }
    .img-file-input { display: none; }

    /* ── Lightbox (matches character-sheet image dialog) ── */
    .lightbox-backdrop {
      position: fixed; inset: 0; z-index: 3000;
      background: rgba(0,0,0,.88); display: flex; align-items: center; justify-content: center;
      cursor: zoom-out; animation: lbFadeIn .18s ease;
    }
    .lightbox-container {
      position: relative; max-width: 90vw; max-height: 88vh;
      cursor: default; display: flex; flex-direction: column; align-items: center;
      animation: lbScaleIn .18s ease;
    }
    .lightbox-frame {
      border: 1px solid rgba(200,160,60,.35);
      box-shadow: 0 0 0 1px rgba(0,0,0,.8), 0 8px 40px rgba(0,0,0,.9), 0 0 60px rgba(200,160,60,.08);
      background: rgba(14,10,4,.95);
      padding: 6px;
      img { display: block; max-width: 88vw; max-height: 78vh; object-fit: contain; }
    }
    .lightbox-close {
      position: absolute; top: -14px; right: -14px;
      width: 30px !important; height: 30px !important; padding: 0 !important; line-height: 1 !important;
      background: rgba(40,28,10,.98) !important; border: 1px solid rgba(200,160,60,.4) !important;
      color: #c8a03c !important; border-radius: 3px !important;
      display: inline-flex !important; align-items: center !important; justify-content: center !important;
      cursor: pointer;
      mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
      &:hover { background: rgba(200,160,60,.15) !important; color: #e8c96a !important; }
    }
    .lightbox-hint { margin-top: 10px; font-size: 10px; color: rgba(155,140,115,.35); letter-spacing: .06em; }
    @keyframes lbFadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes lbScaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* ── Rich-textarea text color (match Questy) ─────── */
    ::ng-deep .rt-wrap rich-textarea {
      .rt-editor { color: #d4c9a0 !important; background: transparent !important;
        &::placeholder { color: rgba(155,140,115,.28) !important; } }
      .rt-preview { color: #d4c9a0 !important; }
      .rt-preview--empty { color: rgba(155,140,115,.28) !important; }
    }

    /* ── Tag input (edit mode) ───────────────────── */
    .tag-field-wrap { position: relative; }
    .tag-input-wrap {
      display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
      background: rgba(140,125,100,.06); border: 1px solid rgba(155,140,115,.16); border-radius: 3px;
      padding: 5px 8px; min-height: 36px; cursor: text;
      &:focus-within { border-color: rgba(155,140,115,.38); background: rgba(140,125,100,.1); }
    }
    .tag-chip--removable { background: rgba(140,125,100,.14); border-color: rgba(155,140,115,.3); color: #d8cdb8; padding-right: 4px; }
    .tag-chip-remove {
      background: none; border: none; cursor: pointer; color: rgba(185,170,140,.55); font-size: 14px; line-height: 1;
      padding: 2px 4px; display: flex; align-items: center; transition: color .12s, background .12s; border-radius: 3px;
      &:hover { color: rgba(220,80,70,.9); background: rgba(200,50,40,.15); }
    }
    .tag-text-input {
      background: transparent; border: none; outline: none; color: rgba(220,210,190,.85);
      font-family: sans-serif; font-size: 12px; min-width: 100px; flex: 1;
      &::placeholder { color: rgba(155,140,115,.22); }
    }
    .tag-suggestions {
      position: absolute; top: calc(100% + 2px); left: 0; right: 0; z-index: 200;
      background: rgba(18,14,8,.98); border: 1px solid rgba(155,140,115,.35); border-radius: 4px;
      max-height: 180px; overflow-y: auto; box-shadow: 0 6px 20px rgba(0,0,0,.7);
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

    /* ── Empty state ─────────────────────────────── */
    .empty-state { text-align: center; padding: 70px 20px; color: rgba(255,255,255,.1); font-size: 13px; letter-spacing: .1em;
      mat-icon { font-size: 54px; width: 54px; height: 54px; display: block; margin: 0 auto 16px; color: rgba(155,140,115,.1); }
    }

    /* ── Confirm dialog ──────────────────────────── */
    .confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.72); display: flex; align-items: center; justify-content: center; z-index: 1100; }
    .confirm-dialog { background: linear-gradient(160deg,rgba(22,18,12,.99),rgba(14,11,7,.99)); border: 1px solid rgba(200,80,60,.4); border-radius: 6px; padding: 28px 32px; max-width: 360px; width: 90vw; text-align: center; animation: scaleIn .14s ease; }
    .confirm-icon { color: rgba(220,60,50,.7); mat-icon { font-size: 36px; width: 36px; height: 36px; } }
    .confirm-title { font-size: 16px; letter-spacing: .1em; color: #f0b0b0; margin: 10px 0 6px; text-transform: uppercase; }
    .confirm-msg { font-size: 12px; color: rgba(220,180,180,.6); font-family: sans-serif; }
    .confirm-rule { height: 1px; background: linear-gradient(90deg,transparent,rgba(200,80,60,.3),transparent); margin: 16px 0; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-btn { font-family: sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; padding: 7px 20px; border-radius: 3px; cursor: pointer; border: 1px solid; }
    .confirm-cancel { color: rgba(180,160,140,.7); border-color: rgba(180,160,140,.25); background: transparent; &:hover { background: rgba(180,160,140,.08); } }
    .confirm-delete { color: rgba(220,80,70,.85); border-color: rgba(200,60,50,.4); background: rgba(200,50,40,.1); &:hover { background: rgba(200,50,40,.2); } }

    /* ── Btn (save, etc.) ────────────────────────── */
    .btn { font-family: sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(155,140,115,.35); border-radius: 3px; background: rgba(140,125,100,.08); color: rgba(175,160,135,.85);
      padding: 6px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(140,125,100,.16); border-color: rgba(155,140,115,.6); color: #d8cdb8; }
    }

    @keyframes scaleIn { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `,
  template: `
    @if (filtered().length === 0) {
      <div class="empty-state">
        <mat-icon>auto_stories</mat-icon>
        @if (events().length === 0) { Žádné události — přidej první kapitolu příběhu. }
        @else { Žádné události neodpovídají filtru. }
      </div>
    }

    @if (filtered().length > 0) {
    <div class="timeline">
      <div class="timeline-line"></div>

      @for (item of filtered(); track item.event.id) {
        <div class="event-card">

          <div class="tl-node"
            [style.background]="typeMeta(item.event.type).color">
          </div>

          <!-- Card header -->
          <div class="card-header" (click)="toggleExpand(item.event.id)">
            <span class="type-badge"
              [style.color]="typeMeta(item.event.type).color"
              [style.background]="typeMeta(item.event.type).bg"
              (click)="$event.stopPropagation(); !isReadOnly() && cycleType(item.idx)"
              [matTooltip]="isReadOnly() ? '' : 'Kliknutím změnit typ'">{{ typeMeta(item.event.type).label }}</span>

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

            @if (!isReadOnly()) {
              <div class="card-actions" (click)="$event.stopPropagation()">
                <button class="card-action-btn card-action-btn--danger" (click)="askDelete(item.idx)" matTooltip="Smazat událost">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            }

            <div class="expand-chevron" [class.expand-chevron--open]="expandedIds().has(item.event.id)">
              <mat-icon>expand_more</mat-icon>
            </div>
          </div>

          <!-- Tags (collapsed) -->
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

              <div class="field-row">
                <div class="field-group" style="flex:1;min-width:200px">
                  <div class="field-label" style="margin-top: 11px;">Název události</div>
                  <input class="field-input" [(ngModel)]="events()[item.idx].title" placeholder="Název…" [disabled]="isReadOnly()" />
                </div>
              </div>

              <div class="field-row">
                <div class="field-group">
                  <div class="field-label">Místo</div>
                  <input class="field-input" [(ngModel)]="events()[item.idx].location" placeholder="Město, dungeon, les…" [disabled]="isReadOnly()" />
                </div>
                <div class="field-group" style="flex:2">
                  <div class="field-label">Štítky</div>
                  @if (isReadOnly()) {
                    <div class="tag-input-wrap" style="pointer-events:none;opacity:.7;">
                      @for (tag of parseTags(events()[item.idx].tags); track tag) {
                        <span class="tag-chip tag-chip--removable">{{ tag }}</span>
                      }
                    </div>
                  }
                  @if (!isReadOnly()) {
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
                            <button class="tag-suggestion-item"
                              [class.tag-suggestion-item--active]="getActiveSuggIdx(item.event.id) === si"
                              type="button"
                              (mousedown)="$event.preventDefault()"
                              (click)="selectSuggestion(item.idx, sugg.tag)"
                            ><span [innerHTML]="sugg.html"></span></button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <div>
                    <div class="rt-label">Shrnutí události</div>
                <div class="summary-row">
                  <div class="rt-wrap">
                    <rich-textarea [(ngModel)]="events()[item.idx].summary" style="position:absolute;top:0;left:0;width:100%;height:100%;"></rich-textarea>
                  </div>
                  @if (!isReadOnly() || imageSource(item.event)) {
                    <div class="img-col">
                      @if (!isReadOnly()) {
                        <div class="img-actions">
                          <button class="pt-filter-btn" type="button"
                            (click)="selectFile(item.idx)"
                            matTooltip="Max 500 KB. Pro zmenšení obrázku použij záložku 'Konvertor obrázků'.">
                            <mat-icon>upload</mat-icon> Nahrát
                          </button>
                          @if (imageSource(item.event)) {
                            <button class="img-clear-btn" type="button" (click)="clearImage(item.idx)" matTooltip="Odebrat obrázek">
                              <mat-icon>close</mat-icon>
                            </button>
                          }
                        </div>
                        <input class="field-input img-url-input"
                          [(ngModel)]="events()[item.idx].imageUrl"
                          [disabled]="!!events()[item.idx].imageBase64"
                          placeholder="nebo vlož URL obrázku…" />
                      }
                      @if (imageSource(item.event)) {
                        <img class="event-img"
                          [src]="imageSource(item.event)!"
                          [alt]="item.event.title"
                          (click)="openLightbox(imageSource(item.event)!)"
                          (error)="clearImage(item.idx)" />
                      }
                    </div>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      }
    </div>
    }

    <input #fileInput type="file" accept="image/*" class="img-file-input" (change)="onFileSelected($event)" />

    @if (previewSrc()) {
      <div class="lightbox-backdrop" (click)="closeLightbox()">
        <div class="lightbox-container" (click)="$event.stopPropagation()">
          <button mat-icon-button class="lightbox-close" type="button" (click)="closeLightbox()">
            <mat-icon>close</mat-icon>
          </button>
          <div class="lightbox-frame">
            <img [src]="previewSrc()!" />
          </div>
          <span class="lightbox-hint">Klikni mimo pro zavření • Esc</span>
        </div>
      </div>
    }

    @if (confirmIdx() !== null) {
      <div class="confirm-backdrop" (click)="cancelDelete()">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon"><mat-icon>delete_forever</mat-icon></div>
          <div class="confirm-title">Smazat událost?</div>
          <div class="confirm-msg">
            Opravdu smazat
            @if (events()[confirmIdx()!]?.title) { <strong>„{{ events()[confirmIdx()!].title }}"</strong> }
            @else { <strong>tuto událost</strong> }?
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
export class StoryEventsListComponent {
  private readonly snack = inject(MatSnackBar);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  /** Reference to parent's WritableSignal — child reads and mutates it directly */
  eventsRef  = input.required<WritableSignal<StoryEvent[]>>();
  isReadOnly = input(false);
  filterType = input<FilterType>('all');
  filterTag  = input<string | null>(null);
  sortOrder  = input<SortOrder>('newest');
  /** When set to an event id, that event is auto-expanded */
  autoExpandId = input<string | null>(null);
  /** localStorage key for persisting expand state */
  storageKey = input<string>();

  /** Flat read-only view of the signal's current array */
  readonly events = computed(() => this.eventsRef()());

  readonly filtered = computed(() => {
    const ft  = this.filterType();
    const tag = this.filterTag();
    const asc = this.sortOrder() === 'oldest';
    return this.events()
      .map((event, idx) => ({ event, idx }))
      .filter(({ event }) => {
        if (ft !== 'all' && event.type !== ft) return false;
        if (tag && !parseTags(event.tags).includes(tag)) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.event.realDate || '0';
        const db = b.event.realDate || '0';
        return asc ? da.localeCompare(db) : db.localeCompare(da);
      });
  });

  readonly allTags = computed((): string[] => {
    const set = new Set<string>();
    for (const e of this.events()) for (const t of parseTags(e.tags)) set.add(t);
    return [...set].sort();
  });

  expandedIds      = signal<Set<string>>(new Set());
  confirmIdx       = signal<number | null>(null);
  previewSrc       = signal<string | null>(null);
  private _pendingUploadIdx = signal<number | null>(null);

  private tagInputMap     = signal<Record<string, string>>({});
  private activeSuggIdxMap = signal<Record<string, number>>({});

  readonly allExpanded = computed(() =>
    this.events().length > 0 && this.events().every(e => this.expandedIds().has(e.id))
  );

  private _storageLoaded = false;

  constructor() {
    // Load expandedIds from localStorage when storageKey becomes available
    effect(() => {
      const key = this.storageKey();
      untracked(() => {
        if (!key || this._storageLoaded) return;
        this._storageLoaded = true;
        try {
          const raw = localStorage.getItem(key);
          if (raw) this.expandedIds.set(new Set(JSON.parse(raw) as string[]));
        } catch { /* ignore */ }
      });
    });

    // Persist expandedIds to localStorage on every change
    effect(() => {
      const ids = this.expandedIds();
      const key = this.storageKey();
      if (key && this._storageLoaded) {
        localStorage.setItem(key, JSON.stringify([...ids]));
      }
    });

    // Auto-expand newly added event
    effect(() => {
      const id = this.autoExpandId();
      if (id) untracked(() => this.expandedIds.update(s => { const n = new Set(s); n.add(id); return n; }));
    });
  }

  toggleExpand(id: string):  void { this.expandedIds.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  expandAll():               void { this.expandedIds.set(new Set(this.events().map(e => e.id))); }
  collapseAll():             void { this.expandedIds.set(new Set()); }
  toggleAllExpanded():       void { this.allExpanded() ? this.collapseAll() : this.expandAll(); }

  cycleType(idx: number): void {
    this.eventsRef().update(list => list.map((e, i) =>
      i !== idx ? e : { ...e, type: TYPE_ORDER[(TYPE_ORDER.indexOf(e.type) + 1) % TYPE_ORDER.length] }
    ));
  }

  askDelete(idx: number):  void { this.confirmIdx.set(idx); }
  cancelDelete():          void { this.confirmIdx.set(null); }
  confirmDelete():         void {
    const idx = this.confirmIdx(); if (idx === null) return;
    const id  = this.events()[idx]?.id;
    if (id) this.expandedIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    this.eventsRef().update(list => list.filter((_, i) => i !== idx));
    this.confirmIdx.set(null);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  getTagInput(id: string): string            { return this.tagInputMap()[id] ?? ''; }
  setTagInput(id: string, val: string): void { this.tagInputMap.update(m => ({ ...m, [id]: val })); this.setActiveSuggIdx(id, -1); }
  focusTagInput(id: string): void            { document.getElementById('tag-input-' + id)?.focus(); }

  getActiveSuggIdx(id: string): number           { return this.activeSuggIdxMap()[id] ?? -1; }
  setActiveSuggIdx(id: string, n: number): void  { this.activeSuggIdxMap.update(m => ({ ...m, [id]: n })); }

  getTagSuggestions(eventId: string): Array<{ tag: string; html: string }> {
    const rawQuery = this.getTagInput(eventId).trim();
    if (!rawQuery) return [];
    const query = posNorm(rawQuery);
    const existingSet = new Set(parseTags(this.events().find(e => e.id === eventId)?.tags ?? ''));
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
    const existing = parseTags(this.events()[idx].tags);
    if (!existing.includes(tag)) {
      this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...parseTags(e.tags), tag].join(' ') }));
    }
    this.setTagInput(id, ''); this.setActiveSuggIdx(id, -1);
    document.getElementById('tag-input-' + id)?.focus();
  }

  navigateSuggestions(id: string, dir: 1 | -1): void {
    const len = this.getTagSuggestions(id).length; if (!len) return;
    this.setActiveSuggIdx(id, Math.max(-1, Math.min(len - 1, this.getActiveSuggIdx(id) + dir)));
  }

  onTagEnter(idx: number, id: string): void {
    const ai = this.getActiveSuggIdx(id);
    const suggestions = this.getTagSuggestions(id);
    if (ai >= 0 && ai < suggestions.length) this.selectSuggestion(idx, suggestions[ai].tag);
    else this.addTagFromInput(idx);
  }

  onTagBlur(idx: number): void {
    const id = this.events()[idx]?.id; if (!id) return;
    this.setActiveSuggIdx(id, -1);
    const val = this.getTagInput(id).trim(); if (!val) return;
    const existing = parseTags(this.events()[idx].tags);
    if (!existing.includes(val)) {
      this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...existing, val].join(' ') }));
    }
    this.setTagInput(id, '');
  }

  addTagFromInput(idx: number): void {
    const id = this.events()[idx]?.id; if (!id) return;
    const val = this.getTagInput(id).trim(); if (!val) return;
    const existing = parseTags(this.events()[idx].tags);
    if (!existing.includes(val)) {
      this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: [...existing, val].join(' ') }));
    }
    this.setTagInput(id, ''); this.setActiveSuggIdx(id, -1);
  }

  removeTag(idx: number, tag: string): void {
    this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, tags: parseTags(e.tags).filter(t => t !== tag).join(' ') }));
  }

  typeMeta(t: string) { return TYPE_META[t as keyof typeof TYPE_META] ?? TYPE_META['other']; }
  parseTags = parseTags;

  // ── Image helpers ─────────────────────────────────────────────────────────
  imageSource(event: StoryEvent): string | null {
    if (event.imageBase64) return 'data:image/png;base64,' + event.imageBase64;
    if (event.imageUrl)    return event.imageUrl;
    return null;
  }

  clearImage(idx: number): void {
    this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, imageBase64: null, imageUrl: '' }));
  }

  selectFile(idx: number): void {
    this._pendingUploadIdx.set(idx);
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(e: Event): void {
    const idx = this._pendingUploadIdx(); if (idx === null) return;
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0]; if (!file) return;
    this._processFile(file, idx);
    input.value = '';
    this._pendingUploadIdx.set(null);
  }

  private _processFile(file: File, idx: number): void {
    if (!file.type.startsWith('image/')) {
      this.snack.open('Soubor není obrázek.', '✕', { verticalPosition: 'top', duration: 3000 });
      return;
    }
    if (file.size > 500 * 1024) {
      this.snack.open(`Obrázek je příliš velký (${Math.round(file.size / 1024)} KB). Max 500 KB — použij záložku 'Konvertor obrázků'.`, '✕', { verticalPosition: 'top', duration: 5000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      this.eventsRef().update(list => list.map((e, i) => i !== idx ? e : { ...e, imageBase64: b64, imageUrl: '' }));
    };
    reader.readAsDataURL(file);
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────
  openLightbox(src: string): void { this.previewSrc.set(src); }
  closeLightbox(): void           { this.previewSrc.set(null); }

  onEscape(): void {
    if (this.previewSrc())            { this.closeLightbox(); return; }
    if (this.confirmIdx() !== null)   { this.cancelDelete(); }
  }
}
