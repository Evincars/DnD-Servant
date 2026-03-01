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

    /* ── Tab header ─────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header {
      background: rgba(8,6,14,1) !important;
      border-bottom: none !important;
      box-shadow: none !important;
      position: relative;
      overflow: visible !important;

      // thick carved stone shelf below tabs
      &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg,
          #2a1a08 0%, #c8a03c 20%, #e8c96a 50%, #c8a03c 80%, #2a1a08 100%);
        box-shadow: 0 2px 12px rgba(200,160,60,.5), 0 4px 20px rgba(0,0,0,.8);
        pointer-events: none;
        z-index: 10;
      }
    }

    /* ── Tab label strip ────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-labels {
      gap: 2px;
      padding: 8px 16px 0;
      align-items: flex-end;
    }

    /* ── Individual tab ─────────────────────────────────── */
    ::ng-deep .mat-mdc-tab {
      height: 40px !important;
      min-width: 140px !important;
      padding: 0 !important;
      opacity: 1 !important;
      border-radius: 0 !important;
      background: transparent !important;
      border: none !important;
      overflow: visible !important;
      position: relative;
      flex-shrink: 0;

      // the visible tab shape — angled left side like a torn page
      .mdc-tab__content {
        position: relative;
        z-index: 2;
        height: 100%;
        padding: 0 20px 0 28px;
        clip-path: polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%);
        background: linear-gradient(160deg, rgba(30,22,14,.95) 0%, rgba(18,13,8,.98) 100%);
        border-top: 1px solid rgba(200,160,60,.18);
        border-right: 1px solid rgba(200,160,60,.12);
        display: flex;
        align-items: center;
        transition: background .18s;
      }

      .mdc-tab__text-label {
        font-family: 'Mikadan', sans-serif !important;
        font-size: 12px !important;
        letter-spacing: .1em !important;
        text-transform: uppercase !important;
        color: #4a4460 !important;
        transition: color .18s, text-shadow .18s !important;
        position: relative;
        z-index: 1;
      }

      // hide Material's own ripple
      .mat-mdc-tab-ripple,
      .mat-ripple { display: none !important; }

      &:hover:not(.mdc-tab--active) {
        .mdc-tab__content {
          background: linear-gradient(160deg, rgba(50,35,18,.95) 0%, rgba(30,20,10,.98) 100%);
          border-top-color: rgba(200,160,60,.35);
        }
        .mdc-tab__text-label {
          color: #a09080 !important;
        }
      }
    }

    /* ── Active tab — aged parchment ────────────────────── */
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      height: 44px !important;

      .mdc-tab__content {
        background: linear-gradient(160deg,
          rgba(80,55,22,.98) 0%,
          rgba(55,38,15,.99) 40%,
          rgba(40,28,10,.99) 100%) !important;
        border-top: 2px solid #c8a03c !important;
        border-right: 1px solid rgba(200,160,60,.5) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,220,100,.12),
          0 -4px 20px rgba(200,160,60,.15);
      }

      .mdc-tab__text-label {
        color: #e8c96a !important;
        text-shadow:
          0 0 16px rgba(200,160,60,.6),
          0 0 4px rgba(200,160,60,.3) !important;
      }
    }

    /* ── Active underline indicator — hide, gold shelf does the job */
    ::ng-deep .mdc-tab-indicator {
      display: none !important;
    }

    /* ── Scroll pagination arrows ───────────────────────── */
    ::ng-deep .mat-mdc-tab-header-pagination {
      background: rgba(8,6,14,1) !important;
      border-bottom: 4px solid #c8a03c !important;
      color: #c8a03c !important;
      box-shadow: none !important;
      min-width: 28px !important;
    }

    ::ng-deep .mat-mdc-tab-header-pagination-chevron {
      border-color: #c8a03c !important;
    }

    /* ── Tab body ───────────────────────────────────────── */
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
