import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { SheetThemeService } from '../sheet-theme.service';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlchemistChestForm, SpellSlotsForm, SpellsAndAlchemistChestForm } from '@dn-d-servant/character-sheet-util';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { openSpellsDialog } from '../help-dialogs/spells-dialog.component';
import { openAlchemistDialog } from '../help-dialogs/alchemist-dialog.component';

@Component({
  selector: 'cs-spell-slots',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '[class.theme-dark]': 'sheetTheme.darkMode()' },
  imports: [ReactiveFormsModule, MatTooltip, MatIcon],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Pozice kouzel · Alchymistická truhla</h3>
    @if (_tick()) {

      <!-- ═══ Sesílání kouzel (responsive only — on desktop these are in saving-throws section) ═══ -->
      <div class="cs-stp-section cs-responsive-only" [formGroup]="spellsAndAlchForm()">
        <h4 class="cs-section-title cs-sub-title">Sesílání kouzel</h4>
        <button (click)="onOpenSpellsDialog()" type="button" matTooltip="Seznam kouzel" style="top:764px; left:452px;" class="field button small-info-button-icon">
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <button (click)="onOpenAlchemistDialog()" type="button" matTooltip="Alchymistická truhla" style="top:764px; left:772px;" class="field button small-info-button-icon">
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <div class="row g-1">
          <div class="col-lg-4 col-md-4 col-sm-6 col-12">
            <div class="cs-spells-field-wrap" data-label="Sesílací vlastnost">
              <input [formControl]="sa.vlastnost" matTooltip="Tvoje sesílací vlastnost (podle povolání)" class="field" style="top:803px; left:442px; width:144px;" placeholder="Vlastnost" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-6 col-12">
            <div class="cs-spells-field-wrap" data-label="Útočný bonus">
              <input [formControl]="sa.utBonus" matTooltip="zdat. bonus + oprava sesílací vlastnosti" class="field" style="top:803.11px; left:603.91px; width:94.32px;" placeholder="Út bonus" />
            </div>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-6 col-12">
            <div class="cs-spells-field-wrap" data-label="SO záchrany">
              <input [formControl]="sa.soZachrany" matTooltip="8 + zdat. bonus + oprava sesílací vlastnosti" class="field" style="top:803.11px; left:708.71px; width:94.32px;" placeholder="SO záchr." />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Level inputs row (desktop: absolutely positioned; responsive: flex row) ── -->
      <div class="cs-spell-levels-row">
        <ng-container [formGroup]="spellSlotsForm()">
          <div class="cs-spell-level-wrap" data-label="úroveň Sesilatele">
            <p class="label" matTooltip="úroveň Sesilatele" matTooltipPosition="left" style="top:904px; left:629px; width:45px; font-size: 13px">S*</p>
            <input [formControl]="ss.urovenSesilatele" matTooltip="úroveň Sesilatele" matTooltipPosition="left" class="field" type="number" style="top:913px; left:645px; width:45px; font-size: 13px;" placeholder="S*" />
          </div>
          <div class="cs-spell-level-wrap" data-label="úroveň Černokněžníka">
            <p class="label" matTooltip="úroveň Černokněžníka" matTooltipPosition="left" style="top:929px; left:629px; width:45px; font-size: 13px">Č*</p>
            <input [formControl]="ss.urovenCernokneznika" matTooltip="úroveň Černokněžníka" matTooltipPosition="left" class="field" type="number" style="top:938px; left:645px; width:45px; font-size: 13px;" placeholder="Č*" />
          </div>
        </ng-container>
        <ng-container [formGroup]="alchemistChestForm()">
          <div class="cs-spell-level-wrap" data-label="úroveň Alchymisty">
            <p class="label" matTooltip="úroveň Alchymisty" matTooltipPosition="left" style="top:954px; left:629px; width:45px; font-size: 13px">A*</p>
            <input [formControl]="ac.urovenAlchymisty" matTooltip="úroveň Alchymisty" matTooltipPosition="left" class="field" type="number" style="top:963px; left:645px; width:45px; font-size: 13px;" placeholder="A*" />
          </div>
        </ng-container>
      </div>

      <!-- ── Spell slots grid (desktop: absolute; responsive: column-per-level) ── -->
      <div class="cs-spell-slots-grid" [formGroup]="spellSlotsForm()">
        <!-- Level 1 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">1.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level1Slot1.disabled" [attr.data-state]="ss.level1Slot1.value" (click)="cycleSlot(ss.level1Slot1)" style="top:893px; left:439px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level1Slot2.disabled" [attr.data-state]="ss.level1Slot2.value" (click)="cycleSlot(ss.level1Slot2)" style="top:914px; left:439px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level1Slot3.disabled" [attr.data-state]="ss.level1Slot3.value" (click)="cycleSlot(ss.level1Slot3)" style="top:935px; left:439px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level1Slot4.disabled" [attr.data-state]="ss.level1Slot4.value" (click)="cycleSlot(ss.level1Slot4)" style="top:956px; left:439px;"></div>
        </div>
        <!-- Level 2 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">2.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level2Slot1.disabled" [attr.data-state]="ss.level2Slot1.value" (click)="cycleSlot(ss.level2Slot1)" style="top:893px; left:466px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level2Slot2.disabled" [attr.data-state]="ss.level2Slot2.value" (click)="cycleSlot(ss.level2Slot2)" style="top:914px; left:466px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level2Slot3.disabled" [attr.data-state]="ss.level2Slot3.value" (click)="cycleSlot(ss.level2Slot3)" style="top:935px; left:466px;"></div>
          <div class="spell-slot-cb spell-slot-cb--black-priest" [class.disabled]="ss.level2Slot4.disabled" [attr.data-state]="ss.level2Slot4.value" (click)="cycleSlot(ss.level2Slot4)" style="top:956px; left:466px;"></div>
        </div>
        <!-- Level 3 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">3.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level3Slot1.disabled" [attr.data-state]="ss.level3Slot1.value" (click)="cycleSlot(ss.level3Slot1)" style="top:893px; left:494px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level3Slot2.disabled" [attr.data-state]="ss.level3Slot2.value" (click)="cycleSlot(ss.level3Slot2)" style="top:914px; left:494px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level3Slot3.disabled" [attr.data-state]="ss.level3Slot3.value" (click)="cycleSlot(ss.level3Slot3)" style="top:935px; left:494px;"></div>
          <div class="spell-slot-cb spell-slot-cb--black-priest" [class.disabled]="ss.level3Slot4.disabled" [attr.data-state]="ss.level3Slot4.value" (click)="cycleSlot(ss.level3Slot4)" style="top:956px; left:494px;"></div>
        </div>
        <!-- Level 4 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">4.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level4Slot1.disabled" [attr.data-state]="ss.level4Slot1.value" (click)="cycleSlot(ss.level4Slot1)" style="top:893px; left:521px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level4Slot2.disabled" [attr.data-state]="ss.level4Slot2.value" (click)="cycleSlot(ss.level4Slot2)" style="top:914px; left:521px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level4Slot3.disabled" [attr.data-state]="ss.level4Slot3.value" (click)="cycleSlot(ss.level4Slot3)" style="top:935px; left:521px;"></div>
          <div class="spell-slot-cb spell-slot-cb--black-priest" [class.disabled]="ss.level4Slot4.disabled" [attr.data-state]="ss.level4Slot4.value" (click)="cycleSlot(ss.level4Slot4)" style="top:956px; left:521px;"></div>
        </div>
        <!-- Level 5 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">5.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level5Slot1.disabled" [attr.data-state]="ss.level5Slot1.value" (click)="cycleSlot(ss.level5Slot1)" style="top:893px; left:549px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level5Slot2.disabled" [attr.data-state]="ss.level5Slot2.value" (click)="cycleSlot(ss.level5Slot2)" style="top:914px; left:549px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level5Slot3.disabled" [attr.data-state]="ss.level5Slot3.value" (click)="cycleSlot(ss.level5Slot3)" style="top:935px; left:549px;"></div>
          <div class="spell-slot-cb spell-slot-cb--black-priest" [class.disabled]="ss.level5Slot4.disabled" [attr.data-state]="ss.level5Slot4.value" (click)="cycleSlot(ss.level5Slot4)" style="top:956px; left:549px;"></div>
        </div>
        <!-- Level 6 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">6.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level6Slot1.disabled" [attr.data-state]="ss.level6Slot1.value" (click)="cycleSlot(ss.level6Slot1)" style="top:893px; left:577px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level6Slot2.disabled" [attr.data-state]="ss.level6Slot2.value" (click)="cycleSlot(ss.level6Slot2)" style="top:914px; left:577px;"></div>
        </div>
        <!-- Level 7 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">7.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level7Slot1.disabled" [attr.data-state]="ss.level7Slot1.value" (click)="cycleSlot(ss.level7Slot1)" style="top:893px; left:604px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ss.level7Slot2.disabled" [attr.data-state]="ss.level7Slot2.value" (click)="cycleSlot(ss.level7Slot2)" style="top:914px; left:604px;"></div>
        </div>
        <!-- Level 8 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">8.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level8Slot1.disabled" [attr.data-state]="ss.level8Slot1.value" (click)="cycleSlot(ss.level8Slot1)" style="top:893px; left:632px;"></div>
        </div>
        <!-- Level 9 -->
        <div class="cs-spell-level-col">
          <span class="cs-slot-level-label">9.</span>
          <div class="spell-slot-cb" [class.disabled]="ss.level9Slot1.disabled" [attr.data-state]="ss.level9Slot1.value" (click)="cycleSlot(ss.level9Slot1)" style="top:893px; left:659px;"></div>
        </div>
      </div>

      <!-- ── Alchemist chest grid ── -->
      <div class="cs-alch-chest-grid" [formGroup]="alchemistChestForm()">
        <div class="cs-alch-chest-row">
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage1.disabled" [attr.data-state]="ac.chestUsage1.value" (click)="cycleSlot(ac.chestUsage1)" style="top:893px; left:697px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage2.disabled" [attr.data-state]="ac.chestUsage2.value" (click)="cycleSlot(ac.chestUsage2)" style="top:893px; left:721px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage3.disabled" [attr.data-state]="ac.chestUsage3.value" (click)="cycleSlot(ac.chestUsage3)" style="top:893px; left:744px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage4.disabled" [attr.data-state]="ac.chestUsage4.value" (click)="cycleSlot(ac.chestUsage4)" style="top:893px; left:767px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage5.disabled" [attr.data-state]="ac.chestUsage5.value" (click)="cycleSlot(ac.chestUsage5)" style="top:893px; left:790px;"></div>
        </div>
        <div class="cs-alch-chest-row">
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage6.disabled" [attr.data-state]="ac.chestUsage6.value" (click)="cycleSlot(ac.chestUsage6)" style="top:914px; left:697px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage7.disabled" [attr.data-state]="ac.chestUsage7.value" (click)="cycleSlot(ac.chestUsage7)" style="top:914px; left:721px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage8.disabled" [attr.data-state]="ac.chestUsage8.value" (click)="cycleSlot(ac.chestUsage8)" style="top:914px; left:744px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage9.disabled" [attr.data-state]="ac.chestUsage9.value" (click)="cycleSlot(ac.chestUsage9)" style="top:914px; left:767px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage10.disabled" [attr.data-state]="ac.chestUsage10.value" (click)="cycleSlot(ac.chestUsage10)" style="top:914px; left:790px;"></div>
        </div>
        <div class="cs-alch-chest-row">
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage11.disabled" [attr.data-state]="ac.chestUsage11.value" (click)="cycleSlot(ac.chestUsage11)" style="top:935px; left:697px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage12.disabled" [attr.data-state]="ac.chestUsage12.value" (click)="cycleSlot(ac.chestUsage12)" style="top:935px; left:721px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage13.disabled" [attr.data-state]="ac.chestUsage13.value" (click)="cycleSlot(ac.chestUsage13)" style="top:935px; left:744px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage14.disabled" [attr.data-state]="ac.chestUsage14.value" (click)="cycleSlot(ac.chestUsage14)" style="top:935px; left:767px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage15.disabled" [attr.data-state]="ac.chestUsage15.value" (click)="cycleSlot(ac.chestUsage15)" style="top:935px; left:790px;"></div>
        </div>
        <div class="cs-alch-chest-row">
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage16.disabled" [attr.data-state]="ac.chestUsage16.value" (click)="cycleSlot(ac.chestUsage16)" style="top:956px; left:697px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage17.disabled" [attr.data-state]="ac.chestUsage17.value" (click)="cycleSlot(ac.chestUsage17)" style="top:956px; left:721px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage18.disabled" [attr.data-state]="ac.chestUsage18.value" (click)="cycleSlot(ac.chestUsage18)" style="top:956px; left:744px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage19.disabled" [attr.data-state]="ac.chestUsage19.value" (click)="cycleSlot(ac.chestUsage19)" style="top:956px; left:767px;"></div>
          <div class="spell-slot-cb" [class.disabled]="ac.chestUsage20.disabled" [attr.data-state]="ac.chestUsage20.value" (click)="cycleSlot(ac.chestUsage20)" style="top:956px; left:790px;"></div>
        </div>
      </div>
    }
  `,
})
export class CsSpellSlotsComponent {
  readonly sheetTheme = inject(SheetThemeService);
  spellSlotsForm = input.required<FormGroup<SpellSlotsForm>>();
  alchemistChestForm = input.required<FormGroup<AlchemistChestForm>>();
  spellsAndAlchForm = input.required<FormGroup<SpellsAndAlchemistChestForm>>();
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      const ss = this.spellSlotsForm();
      const ac = this.alchemistChestForm();
      // Track value + status (enabled/disabled) changes
      merge(ss.valueChanges, ss.statusChanges, ac.valueChanges, ac.statusChanges)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get ss() {
    return this.spellSlotsForm().controls;
  }
  get ac() {
    return this.alchemistChestForm().controls;
  }
  get sa() {
    return this.spellsAndAlchForm().controls;
  }

  onOpenSpellsDialog() {
    openSpellsDialog(this.dialog);
  }
  onOpenAlchemistDialog() {
    openAlchemistDialog(this.dialog);
  }

  cycleSlot(control: AbstractControl): void {
    if (control.disabled) return;
    const next: Record<string, string> = { '': 'cross', cross: 'filled', filled: '' };
    control.setValue(next[control.value ?? ''] ?? 'cross');
  }
}
