import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { InitiativeTrackerComponent } from '@dn-d-servant/character-sheet-feature';
import { LocalStorageService, DM_TAB_KEY, TabNavigatorService } from '@dn-d-servant/util';
import { DmQuestsComponent } from './dm-quests/dm-quests.component';
import { DmNotesComponent } from './dm-notes/dm-notes.component';
import { DmGeneratorComponent } from './dm-generator/dm-generator.component';
import { DmStoryTimelineComponent } from './dm-story-timeline/dm-story-timeline.component';
import { DmPageStore } from '../dm-page.store';
import { MonstersTabComponent } from './monsters-tab/monsters-tab.component';

/** Total number of tabs in the DM page tab group. Keep in sync with the template. */
const DM_TAB_COUNT = 6;


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
      <mat-tab label="Monstra">
        <monsters-tab [active]="selectedTab() === 1" />
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
      <mat-tab label="Příběhové události">
        <dm-story-timeline />
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
      background: rgba(10, 6, 2, 0.99) !important;
      border-bottom: 1px solid rgba(200, 160, 60, 0.18) !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    /* ── Tab label strip ────────────────────────────────── */
    ::ng-deep .mat-mdc-tab-labels {
      gap: 0;
      padding: 0 8px;
      align-items: stretch;
    }

    /* ── Individual tab ─────────────────────────────────── */
    ::ng-deep .mat-mdc-tab {
      height: 40px !important;
      min-width: 0 !important;
      padding: 0 !important;
      opacity: 1 !important;
      border-radius: 0 !important;
      background: transparent !important;
      border: none !important;
      overflow: visible !important;
      flex-shrink: 0;

      .mdc-tab__content {
        height: 40px;
        padding: 0 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border-bottom: 2px solid transparent;
        transition: border-color 0.15s, background 0.15s;
      }

      .mdc-tab__text-label {
        font-family: sans-serif !important;
        font-size: 11px !important;
        letter-spacing: .12em !important;
        text-transform: uppercase !important;
        color: rgba(200, 160, 60, 0.35) !important;
        transition: color .15s !important;
        white-space: nowrap;
      }

      .mat-mdc-tab-ripple,
      .mat-ripple { display: none !important; }

      &:hover:not(.mdc-tab--active) {
        .mdc-tab__content {
          background: rgba(200, 160, 60, 0.04);
        }
        .mdc-tab__text-label { color: rgba(200, 160, 60, 0.65) !important; }
      }
    }

    /* ── Active tab ─────────────────────────────────────── */
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      height: 40px !important;

      .mdc-tab__content {
        height: 40px;
        background: transparent !important;
        border-bottom: 2px solid rgba(200, 160, 60, 0.65) !important;
      }

      .mdc-tab__text-label {
        color: rgba(200, 160, 60, 0.95) !important;
        text-shadow: none !important;
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
  imports: [MatTabGroup, MatTab, InitiativeTrackerComponent, DmQuestsComponent, DmNotesComponent, DmGeneratorComponent, DmStoryTimelineComponent, MonstersTabComponent],
})
export class DmPageComponent implements OnInit, OnDestroy {
  private readonly ls = inject(LocalStorageService);
  private readonly tabNavigator = inject(TabNavigatorService);

  selectedTab = signal<number>(this.ls.getDataSync<number>(DM_TAB_KEY) ?? 0);

  private readonly _registration = {
    tabCount: DM_TAB_COUNT,
    selectedTab: this.selectedTab,
    persistTab: (i: number) => this.ls.setDataSync(DM_TAB_KEY, i),
  };

  ngOnInit(): void {
    this.tabNavigator.register(this._registration);
  }

  ngOnDestroy(): void {
    this.tabNavigator.unregister(this._registration);
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.ls.setDataSync(DM_TAB_KEY, index);
  }
}
