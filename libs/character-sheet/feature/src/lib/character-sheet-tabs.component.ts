import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CharacterSheetComponent } from './character-sheet.component';
import { GroupSheetComponent } from './group-sheet.component';
import { NotesSheetComponent } from './notes-sheet.component';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { InitiativeTrackerComponent } from './initiative-tracker/initiative-tracker.component';
import { QuestsTabComponent } from './quests/quests.component';
import { LocalStorageService, ACTIVE_TAB_INDEX_KEY, AUTOFILL_DIALOG_HIDDEN_KEY, TabNavigatorService } from '@dn-d-servant/util';
import { MatDialog } from '@angular/material/dialog';
import { openAutofillAbilitiesDialog } from './help-dialogs/autofill-abilities-dialog.component';
import { ImageConverterComponent } from './image-converter/image-converter.component';
import { WikiTabComponent } from './wiki/wiki-tab.component';
import { SpellsTabComponent } from './spells-tab/spells-tab.component';
import { PotionsTabComponent } from './potions-tab/potions-tab.component';
import { Subscription, timer } from 'rxjs';

const TAB_INDEX_KEY = ACTIVE_TAB_INDEX_KEY;
/** Total number of tabs in the character-sheet tab group. Keep in sync with the template. */
const TAB_COUNT = 9;

@Component({
  selector: 'character-sheet-tabs',
  template: `
    <mat-tab-group
      mat-stretch-tabs="false"
      mat-align-tabs="start"
      [selectedIndex]="selectedTab()"
      (selectedIndexChange)="onTabChange($any($event))"
    >
      <mat-tab label="Karta postavy"><character-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Karta družiny"><group-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Poznámky"><notes-sheet /></mat-tab>
      <mat-tab label="J&D wiki"><wiki-tab /></mat-tab>
      <mat-tab label="Iniciativa"><initiative-tracker [disableMonsterSearch]="true" /></mat-tab>
      <mat-tab label="Kouzla"><spells-tab [active]="selectedTab() === 3" /></mat-tab>
      <mat-tab label="Lektvary"><potions-tab /></mat-tab>
      <mat-tab label="Questy"><quests-tab /></mat-tab>
      <mat-tab label="Konvertor obrázků"><image-converter /></mat-tab>
    </mat-tab-group>
  `,
  styles: `
    :host {
      display: block;
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
        box-shadow: inset 0 -3px 0 transparent;
        transition: box-shadow 0.15s, background 0.15s;
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
        box-shadow: inset 0 -3px 0 rgba(200, 160, 60, 1) !important;
      }

      .mdc-tab__text-label {
        color: rgba(200, 160, 60, 1) !important;
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
      display: block;
    }
    ::ng-deep .mat-mdc-tab-body-wrapper {
      overflow: visible;
    }
    ::ng-deep .mat-mdc-tab-body-content {
      /* Let content grow naturally — page scroll is the only scrollbar */
      height: auto !important;
      overflow: visible !important;
    }

    /* Initiative tracker needs a viewport-constrained height with its own scroll */
    ::ng-deep initiative-tracker {
      display: block;
      height: calc(100svh - 165px);
      min-height: 400px;
    }

    /* Wiki tab needs full viewport height with internal scrolling */
    ::ng-deep wiki-tab {
      display: flex;
      height: calc(100svh - 165px);
      min-height: 400px;
    }

    /* Kouzla tab needs full viewport height with internal scrolling */
    ::ng-deep spells-tab {
      display: flex;
      flex-direction: column;
      height: calc(100svh - 165px);
      min-height: 400px;
    }
  `,
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabGroup,
    MatTab,
    CharacterSheetComponent,
    GroupSheetComponent,
    NotesSheetComponent,
    InitiativeTrackerComponent,
    QuestsTabComponent,
    ImageConverterComponent,
    WikiTabComponent,
    SpellsTabComponent,
    PotionsTabComponent,
  ],
})
export class CharacterSheetTabsComponent implements OnInit, OnDestroy {
  private readonly ls = inject(LocalStorageService);
  private readonly dialog = inject(MatDialog);
  private readonly tabNavigator = inject(TabNavigatorService);

  selectedTab = signal<number>(this.ls.getDataSync<number>(TAB_INDEX_KEY) ?? 0);

  private readonly _registration = {
    tabCount: TAB_COUNT,
    selectedTab: this.selectedTab,
    persistTab: (i: number) => this.ls.setDataSync(TAB_INDEX_KEY, i),
  };

  private _autofillTimerSub: Subscription | undefined;

  ngOnInit(): void {
    this.tabNavigator.register(this._registration);

    const hidden = this.ls.getDataSync<boolean>(AUTOFILL_DIALOG_HIDDEN_KEY);
    if (!hidden) {
      // Delay so the app renders first before opening the dialog
      this._autofillTimerSub = timer(600).subscribe(() =>
        openAutofillAbilitiesDialog(this.dialog).subscribe(),
      );
    }
  }

  ngOnDestroy(): void {
    this.tabNavigator.unregister(this._registration);
    this._autofillTimerSub?.unsubscribe();
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.ls.setDataSync(TAB_INDEX_KEY, index);
  }
}
