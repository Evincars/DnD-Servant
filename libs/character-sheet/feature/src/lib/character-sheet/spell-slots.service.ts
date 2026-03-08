import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlchemistChestForm, SpellSlotsForm } from '@dn-d-servant/character-sheet-util';

@Injectable({ providedIn: 'root' })
export class SpellSlotsService {
  applySpellSlotsLevel(levelNumber: number, spellSlotsControls: FormGroup<SpellSlotsForm>['controls']): void {
    const c = spellSlotsControls;
    const en = (name: keyof SpellSlotsForm) => c[name].enable({ emitEvent: false });
    const di = (name: keyof SpellSlotsForm) => c[name].disable({ emitEvent: false });
    const disableAll = () => this.disableAllSpellSlots(c);
    const enableAll = () => this.enableAllSpellSlots(c);
    const disableBP = () => this.disableBlackPriestSlots(c);

    switch (levelNumber) {
      case 1:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        break;
      case 2:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        break;
      case 3:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        break;
      case 4:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        break;
      case 5:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        break;
      case 6:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        en('level3Slot3');
        break;
      case 7:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        en('level3Slot3');
        en('level4Slot1');
        break;
      case 8:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        en('level3Slot3');
        en('level4Slot1');
        en('level4Slot2');
        break;
      case 9:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        en('level3Slot3');
        en('level4Slot1');
        en('level4Slot2');
        en('level4Slot3');
        en('level5Slot1');
        break;
      case 10:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        en('level1Slot3');
        en('level1Slot4');
        en('level2Slot1');
        en('level2Slot2');
        en('level2Slot3');
        en('level3Slot1');
        en('level3Slot2');
        en('level3Slot3');
        en('level4Slot1');
        en('level4Slot2');
        en('level4Slot3');
        en('level5Slot1');
        en('level5Slot2');
        break;
      case 11:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot1');
        di('level7Slot2');
        di('level8Slot1');
        di('level9Slot1');
        break;
      case 12:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot1');
        di('level7Slot2');
        di('level8Slot1');
        di('level9Slot1');
        break;
      case 13:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        di('level8Slot1');
        di('level9Slot1');
        break;
      case 14:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        di('level8Slot1');
        di('level9Slot1');
        break;
      case 15:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        di('level9Slot1');
        break;
      case 16:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        break;
      case 17:
        enableAll();
        disableBP();
        di('level5Slot3');
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        break;
      case 18:
        enableAll();
        disableBP();
        di('level5Slot4');
        di('level6Slot2');
        di('level7Slot2');
        break;
      case 19:
        enableAll();
        disableBP();
        di('level5Slot4');
        di('level7Slot2');
        break;
      case 20:
        enableAll();
        disableBP();
        di('level5Slot4');
        break;
      default:
        enableAll();
    }
  }

  applyBlackPriestLevel(
    levelNumber: number,
    spellSlotsControls: FormGroup<SpellSlotsForm>['controls'],
    sesilateleLevel: number,
  ): void {
    const c = spellSlotsControls;
    const en = (name: keyof SpellSlotsForm) => c[name].enable({ emitEvent: false });
    const disableAll = () => this.disableAllSpellSlots(c);
    const enableAll = () => this.enableAllSpellSlots(c);

    switch (levelNumber) {
      case 1:
        disableAll();
        en('level1Slot1');
        break;
      case 2:
        disableAll();
        en('level1Slot1');
        en('level1Slot2');
        break;
      case 3:
      case 4:
        disableAll();
        en('level2Slot1');
        en('level2Slot2');
        break;
      case 5:
      case 6:
        disableAll();
        en('level3Slot1');
        en('level3Slot2');
        break;
      case 7:
      case 8:
        disableAll();
        en('level4Slot1');
        en('level4Slot2');
        break;
      case 9:
      case 10:
        disableAll();
        en('level5Slot1');
        en('level5Slot2');
        break;
      case 11:
      case 12:
        disableAll();
        en('level5Slot1');
        en('level5Slot2');
        en('level5Slot3');
        en('level6Slot1');
        break;
      case 13:
      case 14:
        disableAll();
        en('level5Slot1');
        en('level5Slot2');
        en('level5Slot3');
        en('level6Slot1');
        en('level7Slot1');
        break;
      case 15:
      case 16:
        disableAll();
        en('level5Slot1');
        en('level5Slot2');
        en('level5Slot3');
        en('level6Slot1');
        en('level7Slot1');
        en('level8Slot1');
        break;
      case 17:
      case 18:
      case 19:
      case 20:
        disableAll();
        en('level5Slot1');
        en('level5Slot2');
        en('level5Slot3');
        en('level5Slot4');
        en('level6Slot1');
        en('level7Slot1');
        en('level8Slot1');
        en('level9Slot1');
        break;
      default:
        if (!sesilateleLevel) {
          enableAll();
        }
    }
  }

  applyAlchemistLevel(levelNumber: number, alchemistControls: FormGroup<AlchemistChestForm>['controls']): void {
    const c = alchemistControls;
    const ace = (name: keyof AlchemistChestForm) => c[name].enable({ emitEvent: false });
    const acd = (name: keyof AlchemistChestForm) => c[name].disable({ emitEvent: false });
    const disableAll = () => this.disableAllChestUsages(c);
    const enableAll = () => this.enableAllChestUsages(c);

    switch (levelNumber) {
      case 1:
        disableAll();
        ace('chestUsage1');
        break;
      case 2:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        break;
      case 3:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        break;
      case 4:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        break;
      case 5:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        break;
      case 6:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        ace('chestUsage6');
        break;
      case 7:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        ace('chestUsage6');
        ace('chestUsage7');
        break;
      case 8:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        ace('chestUsage6');
        ace('chestUsage7');
        ace('chestUsage8');
        break;
      case 9:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        ace('chestUsage6');
        ace('chestUsage7');
        ace('chestUsage8');
        ace('chestUsage9');
        break;
      case 10:
        disableAll();
        ace('chestUsage1');
        ace('chestUsage2');
        ace('chestUsage3');
        ace('chestUsage4');
        ace('chestUsage5');
        ace('chestUsage6');
        ace('chestUsage7');
        ace('chestUsage8');
        ace('chestUsage9');
        ace('chestUsage10');
        break;
      case 11:
        enableAll();
        acd('chestUsage12');
        acd('chestUsage13');
        acd('chestUsage14');
        acd('chestUsage15');
        acd('chestUsage16');
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 12:
        enableAll();
        acd('chestUsage13');
        acd('chestUsage14');
        acd('chestUsage15');
        acd('chestUsage16');
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 13:
        enableAll();
        acd('chestUsage14');
        acd('chestUsage15');
        acd('chestUsage16');
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 14:
        enableAll();
        acd('chestUsage15');
        acd('chestUsage16');
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 15:
        enableAll();
        acd('chestUsage16');
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 16:
        enableAll();
        acd('chestUsage17');
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 17:
        enableAll();
        acd('chestUsage18');
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 18:
        enableAll();
        acd('chestUsage19');
        acd('chestUsage20');
        break;
      case 19:
        enableAll();
        acd('chestUsage20');
        break;
      case 20:
        enableAll();
        break;
      default:
        this.enableAllChestUsages(c);
    }
  }

  disableAllSpellSlots(c: FormGroup<SpellSlotsForm>['controls']): void {
    [
      c.level1Slot1,
      c.level1Slot2,
      c.level1Slot3,
      c.level1Slot4,
      c.level2Slot1,
      c.level2Slot2,
      c.level2Slot3,
      c.level2Slot4,
      c.level3Slot1,
      c.level3Slot2,
      c.level3Slot3,
      c.level3Slot4,
      c.level4Slot1,
      c.level4Slot2,
      c.level4Slot3,
      c.level4Slot4,
      c.level5Slot1,
      c.level5Slot2,
      c.level5Slot3,
      c.level5Slot4,
      c.level6Slot1,
      c.level6Slot2,
      c.level7Slot1,
      c.level7Slot2,
      c.level8Slot1,
      c.level9Slot1,
    ].forEach(ctrl => ctrl.disable({ emitEvent: false }));
  }

  enableAllSpellSlots(c: FormGroup<SpellSlotsForm>['controls']): void {
    [
      c.level1Slot1,
      c.level1Slot2,
      c.level1Slot3,
      c.level1Slot4,
      c.level2Slot1,
      c.level2Slot2,
      c.level2Slot3,
      c.level2Slot4,
      c.level3Slot1,
      c.level3Slot2,
      c.level3Slot3,
      c.level3Slot4,
      c.level4Slot1,
      c.level4Slot2,
      c.level4Slot3,
      c.level4Slot4,
      c.level5Slot1,
      c.level5Slot2,
      c.level5Slot3,
      c.level5Slot4,
      c.level6Slot1,
      c.level6Slot2,
      c.level7Slot1,
      c.level7Slot2,
      c.level8Slot1,
      c.level9Slot1,
    ].forEach(ctrl => ctrl.enable({ emitEvent: false }));
  }

  disableBlackPriestSlots(c: FormGroup<SpellSlotsForm>['controls']): void {
    c.level2Slot4.disable({ emitEvent: false });
    c.level3Slot4.disable({ emitEvent: false });
    c.level4Slot4.disable({ emitEvent: false });
    c.level5Slot4.disable({ emitEvent: false });
  }

  disableAllChestUsages(c: FormGroup<AlchemistChestForm>['controls']): void {
    [
      c.chestUsage1,
      c.chestUsage2,
      c.chestUsage3,
      c.chestUsage4,
      c.chestUsage5,
      c.chestUsage6,
      c.chestUsage7,
      c.chestUsage8,
      c.chestUsage9,
      c.chestUsage10,
      c.chestUsage11,
      c.chestUsage12,
      c.chestUsage13,
      c.chestUsage14,
      c.chestUsage15,
      c.chestUsage16,
      c.chestUsage17,
      c.chestUsage18,
      c.chestUsage19,
      c.chestUsage20,
    ].forEach(ctrl => ctrl.disable({ emitEvent: false }));
  }

  enableAllChestUsages(c: FormGroup<AlchemistChestForm>['controls']): void {
    [
      c.chestUsage1,
      c.chestUsage2,
      c.chestUsage3,
      c.chestUsage4,
      c.chestUsage5,
      c.chestUsage6,
      c.chestUsage7,
      c.chestUsage8,
      c.chestUsage9,
      c.chestUsage10,
      c.chestUsage11,
      c.chestUsage12,
      c.chestUsage13,
      c.chestUsage14,
      c.chestUsage15,
      c.chestUsage16,
      c.chestUsage17,
      c.chestUsage18,
      c.chestUsage19,
      c.chestUsage20,
    ].forEach(ctrl => ctrl.enable({ emitEvent: false }));
  }
}
