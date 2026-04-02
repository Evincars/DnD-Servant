import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { InitiativeTrackerComponent } from '@dn-d-servant/character-sheet-feature';
import { LocalStorageService } from '@dn-d-servant/util';
import { DmQuestsComponent } from './dm-quests/dm-quests.component';
import { DmNotesComponent } from './dm-notes/dm-notes.component';
import { DmGeneratorComponent } from './dm-generator/dm-generator.component';
import { DmPageStore } from '../dm-page.store';

const DM_TAB_KEY = 'dm-page-tab-index';

@Component({
  selector: 'dm-page',
  template: `
    <mat-tab-group
      mat-stretch-tabs="false"
      mat-align-tabs="start"
      [selectedIndex]="selectedTab()"
      (selectedIndexChange)="onTabChange($any($event))"
    >
      <mat-tab label="Iniciativa">
        <initiative-tracker />
      </mat-tab>
      <mat-tab label="DM Questy">
        <dm-quests />
      </mat-tab>
      <mat-tab label="Poznámky PH">
        <dm-notes />
      </mat-tab>
      <mat-tab label="Generátor">
        <dm-generator />
      </mat-tab>
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
      background:
        linear-gradient(180deg,
          rgba(20,14,6,.98) 0%,
          rgba(14,10,4,.99) 100%) !important;
      border-bottom: none !important;
      box-shadow: none !important;
      overflow: visible !important;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg,
          transparent, rgba(200,160,60,.5) 30%,
          rgba(200,160,60,.8) 50%,
          rgba(200,160,60,.5) 70%, transparent);
        pointer-events: none;
        z-index: 5;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(200,160,60,.15) 5%,
          rgba(200,160,60,.6) 50%,
          rgba(200,160,60,.15) 95%,
          transparent 100%);
        box-shadow: 0 1px 8px rgba(200,160,60,.3), 0 3px 16px rgba(0,0,0,.7);
        pointer-events: none;
        z-index: 5;
      }
    }

    /* ── Tab label strip ────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-labels {
      gap: 6px;
      padding: 10px 20px 0;
      align-items: flex-end;
    }

    /* ── Individual tab — ribbon bookmark shape ─────────── */
    ::ng-deep .mat-mdc-tab {
      height: 36px !important;
      min-width: 0 !important;
      padding: 0 !important;
      opacity: 1 !important;
      border-radius: 0 !important;
      background: transparent !important;
      border: none !important;
      overflow: visible !important;
      flex-shrink: 0;

      .mdc-tab__content {
        position: relative;
        height: 36px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        clip-path: polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%);
        background: linear-gradient(180deg,
          rgba(40,18,8,.97) 0%,
          rgba(28,12,4,.99) 100%);
        border-top: 1px solid rgba(180,100,40,.25);
        transition: background .18s, filter .18s;
      }

      .mdc-tab__text-label {
        font-family: 'Mikadan', sans-serif !important;
        font-size: 11px !important;
        letter-spacing: .14em !important;
        text-transform: uppercase !important;
        color: #7a6a58 !important;
        transition: color .18s, text-shadow .18s !important;
        white-space: nowrap;
        padding-bottom: 4px;
      }

      .mat-mdc-tab-ripple,
      .mat-ripple { display: none !important; }

      &:hover:not(.mdc-tab--active) {
        .mdc-tab__content {
          background: linear-gradient(180deg,
            rgba(80,40,12,.97) 0%,
            rgba(55,25,6,.99) 100%);
          border-top-color: rgba(200,130,40,.5);
          filter: drop-shadow(0 -2px 6px rgba(200,140,40,.2));
        }
        .mdc-tab__text-label { color: #c0986a !important; }
      }
    }

    /* ── Active tab — blood red ribbon ──────────────────── */
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      height: 42px !important;

      .mdc-tab__content {
        height: 42px;
        background: linear-gradient(180deg,
          rgba(120,25,15,1) 0%,
          rgba(90,15,8,1)   55%,
          rgba(70,10,5,1)   100%) !important;
        border-top: 2px solid rgba(210,90,60,.9) !important;
        filter:
          drop-shadow(0 -4px 10px rgba(180,50,20,.4))
          drop-shadow(0 0 2px rgba(210,90,60,.2)) !important;
      }

      .mdc-tab__text-label {
        color: #f0c090 !important;
        text-shadow:
          0 0 12px rgba(220,120,60,.7),
          0 0  4px rgba(220,100,40,.4) !important;
      }
    }

    /* ── Hide default indicator ─────────────────────────── */
    ::ng-deep .mdc-tab-indicator { display: none !important; }

    /* ── Scroll arrows ──────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-header-pagination {
      background: rgba(14,10,4,.99) !important;
      border-bottom: 3px solid rgba(200,160,60,.4) !important;
      color: #c8a03c !important;
      box-shadow: none !important;
      min-width: 24px !important;
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
  providers: [DmPageStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, InitiativeTrackerComponent, DmQuestsComponent, DmNotesComponent, DmGeneratorComponent],
})
export class DmPageComponent {
  private readonly ls = inject(LocalStorageService);

  selectedTab = signal<number>(this.ls.getDataSync<number>(DM_TAB_KEY) ?? 0);

  onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.ls.setDataSync(DM_TAB_KEY, index);
  }
}
