import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CharacterSheetComponent } from './character-sheet.component';
import { GroupSheetComponent } from './group-sheet.component';
import { NotesSheetComponent } from './notes-sheet.component';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';

@Component({
  selector: 'character-sheet-tab',
  template: `
    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
      <mat-tab label="Karta postavy"><character-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Karta družiny"><group-sheet class="u-mt-2" /></mat-tab>
      <!--      <mat-tab label="Další parťáci"><horse-sheet class="u-mt-2" /></mat-tab>-->
      <mat-tab label="Poznámky"><notes-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Iniciativa"><initiative-tracker /></mat-tab>
    </mat-tab-group>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    /* ── Tab header bar ─────────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header {
      background:
        linear-gradient(90deg, rgba(6,4,12,.98) 0%, rgba(14,10,20,.98) 50%, rgba(6,4,12,.98) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png') !important;
      background-color: #080510 !important;
      border-bottom: 2px solid rgba(200,160,60,.4) !important;
      box-shadow:
        0 4px 24px rgba(0,0,0,.8),
        inset 0 1px 0 rgba(255,220,100,.06) !important;
      position: relative;

      // fading gold shimmer line along bottom
      &::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(200,160,60,.3) 15%,
          rgba(200,160,60,.7) 50%,
          rgba(200,160,60,.3) 85%,
          transparent 100%);
        pointer-events: none;
      }

      // left gem accent
      &::before {
        content: '⚔';
        position: absolute;
        left: 8px; bottom: -10px;
        font-size: 11px;
        color: rgba(200,160,60,.45);
        pointer-events: none;
        z-index: 2;
      }
    }

    /* ── Tab label strip ────────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-labels {
      user-select: none;
      -webkit-user-select: none;
      gap: 0;
      padding: 6px 12px 0;
      align-items: flex-end;
    }

    /* ── Individual tab label ───────────────────────────────────── */
    ::ng-deep .mat-mdc-tab {
      min-width: 130px !important;
      height: 38px !important;
      padding: 0 22px !important;
      opacity: 1 !important;
      border-radius: 6px 6px 0 0 !important;
      border: 1px solid rgba(200,160,60,.15) !important;
      border-bottom: none !important;
      background: rgba(255,255,255,.02) !important;
      margin-right: 3px !important;
      transition: background .18s, border-color .18s, transform .12s !important;
      position: relative;
      overflow: visible !important;

      // left edge accent bar
      &::before {
        content: '';
        position: absolute;
        left: 0; top: 20%; bottom: 20%;
        width: 2px;
        background: linear-gradient(180deg, transparent, rgba(200,160,60,.3), transparent);
        border-radius: 1px;
        pointer-events: none;
      }

      // label text
      .mdc-tab__text-label {
        font-family: 'Mikadan', sans-serif !important;
        font-size: 13px !important;
        letter-spacing: .08em !important;
        color: #5a5468 !important;
        transition: color .18s, text-shadow .18s !important;
        text-transform: uppercase !important;
      }

      .mat-ripple { border-radius: 6px 6px 0 0; }

      &:hover:not(.mdc-tab--active) {
        background: rgba(200,160,60,.08) !important;
        border-color: rgba(200,160,60,.3) !important;
        transform: translateY(-1px) !important;

        .mdc-tab__text-label {
          color: #c8bfb0 !important;
          text-shadow: 0 0 8px rgba(200,160,60,.2) !important;
        }
      }
    }

    /* ── Active tab — parchment lit look ────────────────────────── */
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      background:
        linear-gradient(180deg, rgba(200,160,60,.1) 0%, rgba(200,140,40,.06) 100%) !important;
      border-color: rgba(200,160,60,.45) !important;
      border-bottom-color: transparent !important;
      transform: translateY(-2px) !important;

      // bright left edge on active
      &::before {
        background: linear-gradient(180deg, transparent, rgba(200,160,60,.7), transparent);
        width: 2px;
      }

      // top inner glow line
      &::after {
        content: '';
        position: absolute;
        top: 0; left: 10%; right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,60,.5), transparent);
        pointer-events: none;
      }

      .mdc-tab__text-label {
        color: #e8c96a !important;
        text-shadow:
          0 0 12px rgba(200,160,60,.5),
          0 0 4px rgba(200,160,60,.25) !important;
      }
    }

    /* ── Active indicator (bottom bar) ─────────────────────────── */
    ::ng-deep .mdc-tab-indicator .mdc-tab-indicator__content--underline {
      border-color: #c8a03c !important;
      border-width: 2px !important;
      box-shadow:
        0 0 8px rgba(200,160,60,.7),
        0 0 2px rgba(255,220,100,.4) !important;
      border-radius: 1px 1px 0 0;
    }

    /* ── Left/right scroll arrows ───────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header-pagination {
      background:
        linear-gradient(90deg, rgba(6,4,12,.98), rgba(14,10,20,.98)) !important;
      color: #c8a03c !important;
      box-shadow: none !important;
      border-bottom: 2px solid rgba(200,160,60,.4) !important;
    }

    ::ng-deep .mat-mdc-tab-header-pagination-chevron {
      border-color: #c8a03c !important;
    }

    /* ── Tab body wrapper + content ─────────────────────────────── */
    ::ng-deep mat-tab-group {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    ::ng-deep initiative-tracker {
      display: block;
      height: 100%;
    }
  `,
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, CharacterSheetComponent, GroupSheetComponent, NotesSheetComponent, InitiativeTrackerComponent],
})
export class CharacterSheetTabComponent {}
