import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SpellsForm } from '@dn-d-servant/character-sheet-util';

/** Total number of spell rows available in the spell sheet (r1 … r35). */
const SPELL_ROW_COUNT = 35;

/**
 * Shared singleton service that bridges the Kouzla browser tab with the
 * Kouzla section on the character-sheet (third page).
 *
 * The `CharacterSheetThirdPageComponent` registers its reactive `spellsForm`
 * here when it is alive, and removes it on destroy.  The `SpellsTabComponent`
 * can then call `addSpell()` to fill in the first empty row in the sheet.
 */
@Injectable({ providedIn: 'root' })
export class SpellSheetService {
  /** The currently active spells form (null when the sheet is not rendered). */
  private readonly _form = signal<FormGroup<SpellsForm> | null>(null);

  /** Expose a read-only view so components can check availability. */
  readonly hasActiveForm = signal(false);

  /** Called by CharacterSheetThirdPageComponent when its form is available. */
  registerForm(form: FormGroup<SpellsForm>): void {
    this._form.set(form);
    this.hasActiveForm.set(true);
  }

  /** Called by CharacterSheetThirdPageComponent on destroy. */
  unregisterForm(): void {
    this._form.set(null);
    this.hasActiveForm.set(false);
  }

  /**
   * Writes `spellName` into the first empty `rXNazev` control.
   * Returns `true` if a slot was found, `false` if all 35 rows are filled.
   */
  addSpell(spellName: string): boolean {
    const form = this._form();
    if (!form) return false;

    const controls = form.controls as Record<string, { value: unknown; setValue(v: string): void }>;

    for (let i = 1; i <= SPELL_ROW_COUNT; i++) {
      const ctrl = controls[`r${i}Nazev`];
      if (!ctrl) continue;
      const val = ctrl.value;
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        ctrl.setValue(spellName);
        return true;
      }
    }
    return false;
  }
}

