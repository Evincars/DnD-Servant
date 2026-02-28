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
      height: 100vh;
    }

    /* ── Tab header bar ─────────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header {
      background:
        linear-gradient(90deg, rgba(6,4,12,.98) 0%, rgba(14,10,20,.98) 50%, rgba(6,4,12,.98) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png') !important;
      background-color: #080510 !important;
      border-bottom: 1px solid rgba(200,160,60,.35) !important;
      box-shadow: 0 3px 20px rgba(0,0,0,.7), inset 0 -1px 0 rgba(200,160,60,.15) !important;
      position: relative;

      // bottom gold shimmer line (same as toolbar)
      &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 3%; right: 3%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,60,.55), transparent);
        pointer-events: none;
      }
    }

    /* ── Tab label strip ────────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-labels {
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      gap: 2px;
      padding: 0 8px;
    }

    /* ── Individual tab label ───────────────────────────────────── */
    ::ng-deep .mat-mdc-tab {
      min-width: 120px !important;
      padding: 0 20px !important;
      opacity: 1 !important;
      border-radius: 6px 6px 0 0 !important;
      transition: background .18s !important;

      // label text
      .mdc-tab__text-label {
        font-family: 'Mikadan', sans-serif !important;
        font-size: 14px !important;
        letter-spacing: .06em !important;
        color: #6b6080 !important;
        transition: color .18s !important;
      }

      // ripple / focus overlay
      .mat-ripple { border-radius: 6px 6px 0 0; }

      &:hover:not(.mdc-tab--active) {
        background: rgba(200,160,60,.07) !important;

        .mdc-tab__text-label { color: #c8bfb0 !important; }
      }
    }

    /* ── Active tab ─────────────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      background: rgba(200,160,60,.1) !important;

      .mdc-tab__text-label {
        color: #e8c96a !important;
        text-shadow: 0 0 10px rgba(200,160,60,.4) !important;
      }
    }

    /* ── Active indicator (bottom bar) ─────────────────────────── */
    ::ng-deep .mdc-tab-indicator .mdc-tab-indicator__content--underline {
      border-color: #c8a03c !important;
      border-width: 3px !important;
      box-shadow: 0 0 10px rgba(200,160,60,.6) !important;
      border-radius: 2px 2px 0 0;
    }

    /* ── Left/right scroll arrows ───────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header-pagination {
      background: rgba(8,5,16,.95) !important;
      color: #c8a03c !important;
      box-shadow: none !important;
      border-bottom: 1px solid rgba(200,160,60,.35) !important;
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
