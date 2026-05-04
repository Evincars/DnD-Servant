import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { SheetThemeService } from '../sheet-theme.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventoryForm, Main6SkillsForm } from '@dn-d-servant/character-sheet-util';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { openCarriageDialog } from '../help-dialogs/carriage-dialog.component';
import { openEquipmentDialog } from '../equipment-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'cs-inventory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '[class.theme-dark]': 'sheetTheme.darkMode()' },
  imports: [ReactiveFormsModule, NgClass, MatIcon, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Inventář</h3>
    @if (_tick()) {
      <ng-container [formGroup]="form()">
        <button
          (click)="onOpenCarriageDialog()"
          type="button"
          matTooltip="Nosnost"
          style="top:1310px; left:376px"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <button
          (click)="onOpenEquipmentDialog()"
          type="button"
          matTooltip="Výbava postavy — vybav předměty"
          style="top:1306px; left:402px; width:26px; height:26px; background:linear-gradient(135deg,#2a1a04,#1a1008); border:1px solid rgba(200,160,60,.55); border-radius:5px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; box-shadow:0 0 8px rgba(200,160,60,.25);"
          class="field button cs-equip-btn"
        >
          <mat-icon style="font-size:16px;width:16px;height:16px;color:#c8a03c;">checkroom</mat-icon>
        </button>
        <div class="cs-inventory-field-wrap" data-label="Peníze">
          <input
            [formControl]="c.penize"
            id="penize"
            class="field"
            style="top:1358px; left:106.35px; width:495.18px"
            placeholder="Peníze"
          />
        </div>

        <!-- Column 1 -->
        <input
          [formControl]="c.radek1"
          [ngClass]="inventoryClasses()[0]"
          id="inventoryItemRow1"
          class="field inventory-item"
          style="top:1398.19px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek2"
          [ngClass]="inventoryClasses()[1]"
          id="inventoryItemRow2"
          class="field inventory-item"
          style="top:1435.53px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek3"
          [ngClass]="inventoryClasses()[2]"
          id="inventoryItemRow3"
          class="field inventory-item"
          style="top:1473.69px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek4"
          [ngClass]="inventoryClasses()[3]"
          id="inventoryItemRow4"
          class="field inventory-item"
          style="top:1511.85px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek5"
          [ngClass]="inventoryClasses()[4]"
          id="inventoryItemRow5"
          class="field inventory-item"
          style="top:1553.01px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek6"
          [ngClass]="inventoryClasses()[5]"
          id="inventoryItemRow6"
          class="field inventory-item"
          style="top:1591.17px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek7"
          [ngClass]="inventoryClasses()[6]"
          id="inventoryItemRow7"
          class="field inventory-item"
          style="top:1629.33px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek8"
          [ngClass]="inventoryClasses()[7]"
          id="inventoryItemRow8"
          class="field inventory-item"
          style="top:1667.49px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek9"
          [ngClass]="inventoryClasses()[8]"
          id="inventoryItemRow9"
          class="field inventory-item"
          style="top:1705.65px; left:68.12px; width:249px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek10"
          [ngClass]="inventoryClasses()[9]"
          id="inventoryItemRow10"
          class="field inventory-item"
          style="top:1743.81px; left:68.12px; width:249px"
          placeholder="*"
        />

        <!-- Column 2 -->
        <input
          [formControl]="c.radek11"
          [ngClass]="inventoryClasses()[10]"
          id="inventoryItemRow11"
          class="field inventory-item"
          style="top:1398.19px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek12"
          [ngClass]="inventoryClasses()[11]"
          id="inventoryItemRow12"
          class="field inventory-item"
          style="top:1435.53px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek13"
          [ngClass]="inventoryClasses()[12]"
          id="inventoryItemRow13"
          class="field inventory-item"
          style="top:1473.69px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek14"
          [ngClass]="inventoryClasses()[13]"
          id="inventoryItemRow14"
          class="field inventory-item"
          style="top:1511.85px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek15"
          [ngClass]="inventoryClasses()[14]"
          id="inventoryItemRow15"
          class="field inventory-item"
          style="top:1553.01px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek16"
          [ngClass]="inventoryClasses()[15]"
          id="inventoryItemRow16"
          class="field inventory-item"
          style="top:1591.17px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek17"
          [ngClass]="inventoryClasses()[16]"
          id="inventoryItemRow17"
          class="field inventory-item"
          style="top:1629.33px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek18"
          [ngClass]="inventoryClasses()[17]"
          id="inventoryItemRow18"
          class="field inventory-item"
          style="top:1667.49px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek19"
          [ngClass]="inventoryClasses()[18]"
          id="inventoryItemRow19"
          class="field inventory-item"
          style="top:1705.65px; left:352.39px; width:254.14px"
          placeholder="*"
        />
        <input
          [formControl]="c.radek20"
          [ngClass]="inventoryClasses()[19]"
          id="inventoryItemRow20"
          class="field inventory-item"
          style="top:1743.81px; left:352.39px; width:254.14px"
          placeholder="*"
        />
      </ng-container>
    }
  `,
})
export class CsInventoryComponent {
  readonly sheetTheme = inject(SheetThemeService);
  form = input.required<FormGroup<InventoryForm>>();
  inventoryClasses = input.required<string[]>();
  main6Form = input<FormGroup<Main6SkillsForm> | null>(null);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      this.form()
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get c() {
    return this.form().controls;
  }

  onOpenCarriageDialog() {
    openCarriageDialog(this.dialog);
  }

  onOpenEquipmentDialog() {
    const m6 = this.main6Form();
    const parseMod = (v: string | null | undefined): number => {
      const n = parseInt((v ?? '0').replace(/[^\d\-+]/g, ''));
      return isNaN(n) ? 0 : n;
    };
    const dexMod = m6 ? parseMod(m6.controls.obratnostOprava.value) : 0;
    const strScore = m6 ? parseMod(m6.controls.sila.value) : 10;
    openEquipmentDialog(this.dialog, { dexMod, strScore });
  }
}
