import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { startWith, switchMap } from 'rxjs';
import { ProfessionForm, SpellsForm, ThirdPageForm, TopInfoForSpellSheetForm } from '@dn-d-servant/character-sheet-util';

@Component({
  selector: 'third-page',
  template: `
    <img src="character-sheet-3.png" alt="Character Sheet" height="1817" width="1293" />

    <input
      [formControl]="controls.topInfoForSpellSheet.controls.jmenoPostavy"
      class="field"
      style="top:179px; left:472px; width:347px; text-align: center"
      placeholder="Jméno postavy"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.stupenPozic"
      class="field"
      style="top:121px; left:960px; width:82px;"
      placeholder="Stupeň"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox1"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1061px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox2"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1102px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox3"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1144px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox4"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1185px;"
    />

    <input
      [formControl]="controls.topInfoForSpellSheet.controls.mystickyTaj"
      class="field"
      style="top:181px; left:960px; width:82px;"
      placeholder="Mystický taj"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.mystickyTajCheckbox1"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:216px; left:1061px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.mystickyTajCheckbox2"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:216px; left:1103px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.mystickyTajCheckbox3"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:216px; left:1144px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.mystickyTajCheckbox4"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:216px; left:1185px;"
    />

    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniSesilatelskePovolani"
      class="field"
      style="top:346px; left:219px; width:189px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniUroven"
      class="field"
      style="top:346px; left:419px; width:70px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniMaxStupenKouzel"
      class="field"
      style="top:346px; left:500px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniSesilaciVlastnost"
      class="field"
      style="top:346px; left:689px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniSOZachrany"
      class="field"
      style="top:346px; left:878px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.prvniPovolaniUtocnyBonus"
      class="field"
      style="top:346px; left:1068px; width:149px;"
      placeholder="*"
    />

    <input
      [formControl]="controls.professionForm.controls.druhePovolaniSesilatelskePovolani"
      class="field"
      style="top:385px; left:219px; width:189px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.druhePovolaniUroven"
      class="field"
      style="top:385px; left:419px; width:70px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.druhePovolaniMaxStupenKouzel"
      class="field"
      style="top:385px; left:500px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.druhePovolaniSesilaciVlastnost"
      class="field"
      style="top:385px; left:689px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.druhePovolaniSOZachrany"
      class="field"
      style="top:385px; left:878px; width:179px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.professionForm.controls.druhePovolaniUtocnyBonus"
      class="field"
      style="top:385px; left:1068px; width:149px;"
      placeholder="*"
    />
    <!--    ===================================================================================-->

    <!--    ROW 1-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r1P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:512px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1S"
      class="field spell-row"
      style="top:511px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Nazev"
      class="field spell-row "
      style="top:511px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Utok"
      class="field spell-row"
      style="top:511px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1DobaSesilani"
      class="field spell-row"
      style="top:511px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Slozky"
      class="field spell-row"
      style="top:511px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Dosah"
      class="field spell-row"
      style="top:511px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Trvani"
      class="field spell-row"
      style="top:511px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Poznamka"
      class="field spell-row"
      style="top:511px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(1)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r1Str"
      class="field spell-row"
      style="top:511px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 2-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r2P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:548px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2S"
      class="field spell-row"
      style="top:546px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Nazev"
      class="field spell-row "
      style="top:546px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Utok"
      class="field spell-row"
      style="top:546px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2DobaSesilani"
      class="field spell-row"
      style="top:546px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Slozky"
      class="field spell-row"
      style="top:546px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Dosah"
      class="field spell-row"
      style="top:546px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Trvani"
      class="field spell-row"
      style="top:546px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Poznamka"
      class="field spell-row"
      style="top:546px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(2)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r2Str"
      class="field spell-row"
      style="top:546px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 3-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r3P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:583px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3S"
      class="field spell-row"
      style="top:582px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Nazev"
      class="field spell-row "
      style="top:582px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Utok"
      class="field spell-row"
      style="top:582px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3DobaSesilani"
      class="field spell-row"
      style="top:582px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Slozky"
      class="field spell-row"
      style="top:582px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Dosah"
      class="field spell-row"
      style="top:582px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Trvani"
      class="field spell-row"
      style="top:582px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Poznamka"
      class="field spell-row"
      style="top:582px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(3)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r3Str"
      class="field spell-row"
      style="top:582px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 4-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r4P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:619px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4S"
      class="field spell-row"
      style="top:618px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Nazev"
      class="field spell-row "
      style="top:618px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Utok"
      class="field spell-row"
      style="top:618px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4DobaSesilani"
      class="field spell-row"
      style="top:618px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Slozky"
      class="field spell-row"
      style="top:618px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Dosah"
      class="field spell-row"
      style="top:618px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Trvani"
      class="field spell-row"
      style="top:618px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Poznamka"
      class="field spell-row"
      style="top:618px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(4)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r4Str"
      class="field spell-row"
      style="top:618px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 5-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r5P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:654px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5S"
      class="field spell-row"
      style="top:653px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Nazev"
      class="field spell-row "
      style="top:653px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Utok"
      class="field spell-row"
      style="top:653px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5DobaSesilani"
      class="field spell-row"
      style="top:653px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Slozky"
      class="field spell-row"
      style="top:653px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Dosah"
      class="field spell-row"
      style="top:653px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Trvani"
      class="field spell-row"
      style="top:653px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Poznamka"
      class="field spell-row"
      style="top:653px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(5)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r5Str"
      class="field spell-row"
      style="top:653px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 6-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r6P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:690px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6S"
      class="field spell-row"
      style="top:689px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Nazev"
      class="field spell-row "
      style="top:689px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Utok"
      class="field spell-row"
      style="top:689px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6DobaSesilani"
      class="field spell-row"
      style="top:689px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Slozky"
      class="field spell-row"
      style="top:689px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Dosah"
      class="field spell-row"
      style="top:689px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Trvani"
      class="field spell-row"
      style="top:689px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Poznamka"
      class="field spell-row"
      style="top:689px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(6)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r6Str"
      class="field spell-row"
      style="top:689px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 7-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r7P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:726px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7S"
      class="field spell-row"
      style="top:725px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Nazev"
      class="field spell-row "
      style="top:725px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Utok"
      class="field spell-row"
      style="top:725px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7DobaSesilani"
      class="field spell-row"
      style="top:725px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Slozky"
      class="field spell-row"
      style="top:725px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Dosah"
      class="field spell-row"
      style="top:725px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Trvani"
      class="field spell-row"
      style="top:725px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Poznamka"
      class="field spell-row"
      style="top:725px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(7)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r7Str"
      class="field spell-row"
      style="top:725px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 8-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r8P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:761px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8S"
      class="field spell-row"
      style="top:760px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Nazev"
      class="field spell-row "
      style="top:760px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Utok"
      class="field spell-row"
      style="top:760px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8DobaSesilani"
      class="field spell-row"
      style="top:760px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Slozky"
      class="field spell-row"
      style="top:760px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Dosah"
      class="field spell-row"
      style="top:760px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Trvani"
      class="field spell-row"
      style="top:760px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Poznamka"
      class="field spell-row"
      style="top:760px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(8)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r8Str"
      class="field spell-row"
      style="top:760px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 9-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r9P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:797px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9S"
      class="field spell-row"
      style="top:796px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Nazev"
      class="field spell-row "
      style="top:796px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Utok"
      class="field spell-row"
      style="top:796px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9DobaSesilani"
      class="field spell-row"
      style="top:796px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Slozky"
      class="field spell-row"
      style="top:796px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Dosah"
      class="field spell-row"
      style="top:796px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Trvani"
      class="field spell-row"
      style="top:796px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Poznamka"
      class="field spell-row"
      style="top:796px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(9)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r9Str"
      class="field spell-row"
      style="top:796px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 10-->
    <!--    ###################################################################################-->
    <input
      [formControl]="controls.spellsForm.controls.r10P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:832px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10S"
      class="field spell-row"
      style="top:831px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Nazev"
      class="field spell-row "
      style="top:831px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Utok"
      class="field spell-row"
      style="top:831px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10DobaSesilani"
      class="field spell-row"
      style="top:831px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Slozky"
      class="field spell-row"
      style="top:831px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Dosah"
      class="field spell-row"
      style="top:831px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Trvani"
      class="field spell-row"
      style="top:831px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Poznamka"
      class="field spell-row"
      style="top:831px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(10)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Str"
      class="field spell-row"
      style="top:831px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 11-->
    <input
      [formControl]="controls.spellsForm.controls.r11P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:868px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11S"
      class="field spell-row"
      style="top:867px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Nazev"
      class="field spell-row "
      style="top:867px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Utok"
      class="field spell-row"
      style="top:867px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11DobaSesilani"
      class="field spell-row"
      style="top:867px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Slozky"
      class="field spell-row"
      style="top:867px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Dosah"
      class="field spell-row"
      style="top:867px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Trvani"
      class="field spell-row"
      style="top:867px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Poznamka"
      class="field spell-row"
      style="top:867px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(11)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r11Str"
      class="field spell-row"
      style="top:867px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 12-->
    <input
      [formControl]="controls.spellsForm.controls.r12P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:904px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12S"
      class="field spell-row"
      style="top:903px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Nazev"
      class="field spell-row "
      style="top:903px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Utok"
      class="field spell-row"
      style="top:903px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12DobaSesilani"
      class="field spell-row"
      style="top:903px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Slozky"
      class="field spell-row"
      style="top:903px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Dosah"
      class="field spell-row"
      style="top:903px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Trvani"
      class="field spell-row"
      style="top:903px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Poznamka"
      class="field spell-row"
      style="top:903px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(12)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r12Str"
      class="field spell-row"
      style="top:903px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 13-->
    <input
      [formControl]="controls.spellsForm.controls.r13P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:940px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13S"
      class="field spell-row"
      style="top:939px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Nazev"
      class="field spell-row "
      style="top:939px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Utok"
      class="field spell-row"
      style="top:939px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13DobaSesilani"
      class="field spell-row"
      style="top:939px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Slozky"
      class="field spell-row"
      style="top:939px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Dosah"
      class="field spell-row"
      style="top:939px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Trvani"
      class="field spell-row"
      style="top:939px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Poznamka"
      class="field spell-row"
      style="top:939px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(13)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r13Str"
      class="field spell-row"
      style="top:939px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 14-->
    <input
      [formControl]="controls.spellsForm.controls.r14P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:976px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14S"
      class="field spell-row"
      style="top:975px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Nazev"
      class="field spell-row "
      style="top:975px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Utok"
      class="field spell-row"
      style="top:975px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14DobaSesilani"
      class="field spell-row"
      style="top:975px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Slozky"
      class="field spell-row"
      style="top:975px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Dosah"
      class="field spell-row"
      style="top:975px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Trvani"
      class="field spell-row"
      style="top:975px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Poznamka"
      class="field spell-row"
      style="top:975px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(14)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r14Str"
      class="field spell-row"
      style="top:975px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 15-->
    <input
      [formControl]="controls.spellsForm.controls.r15P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1012px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15S"
      class="field spell-row"
      style="top:1011px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Nazev"
      class="field spell-row "
      style="top:1011px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Utok"
      class="field spell-row"
      style="top:1011px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15DobaSesilani"
      class="field spell-row"
      style="top:1011px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Slozky"
      class="field spell-row"
      style="top:1011px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Dosah"
      class="field spell-row"
      style="top:1011px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Trvani"
      class="field spell-row"
      style="top:1011px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Poznamka"
      class="field spell-row"
      style="top:1011px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(15)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r15Str"
      class="field spell-row"
      style="top:1011px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 16-->
    <input
      [formControl]="controls.spellsForm.controls.r16P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1048px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16S"
      class="field spell-row"
      style="top:1047px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Nazev"
      class="field spell-row "
      style="top:1047px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Utok"
      class="field spell-row"
      style="top:1047px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16DobaSesilani"
      class="field spell-row"
      style="top:1047px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Slozky"
      class="field spell-row"
      style="top:1047px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Dosah"
      class="field spell-row"
      style="top:1047px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Trvani"
      class="field spell-row"
      style="top:1047px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Poznamka"
      class="field spell-row"
      style="top:1047px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(16)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r16Str"
      class="field spell-row"
      style="top:1047px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 17-->
    <input
      [formControl]="controls.spellsForm.controls.r17P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1084px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17S"
      class="field spell-row"
      style="top:1083px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Nazev"
      class="field spell-row "
      style="top:1083px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Utok"
      class="field spell-row"
      style="top:1083px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17DobaSesilani"
      class="field spell-row"
      style="top:1083px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Slozky"
      class="field spell-row"
      style="top:1083px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Dosah"
      class="field spell-row"
      style="top:1083px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Trvani"
      class="field spell-row"
      style="top:1083px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Poznamka"
      class="field spell-row"
      style="top:1083px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(17)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r17Str"
      class="field spell-row"
      style="top:1083px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 18-->
    <input
      [formControl]="controls.spellsForm.controls.r18P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1120px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18S"
      class="field spell-row"
      style="top:1119px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Nazev"
      class="field spell-row "
      style="top:1119px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Utok"
      class="field spell-row"
      style="top:1119px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18DobaSesilani"
      class="field spell-row"
      style="top:1119px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Slozky"
      class="field spell-row"
      style="top:1119px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Dosah"
      class="field spell-row"
      style="top:1119px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Trvani"
      class="field spell-row"
      style="top:1119px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Poznamka"
      class="field spell-row"
      style="top:1119px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(18)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r18Str"
      class="field spell-row"
      style="top:1119px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 19-->
    <input
      [formControl]="controls.spellsForm.controls.r19P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1156px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19S"
      class="field spell-row"
      style="top:1155px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Nazev"
      class="field spell-row "
      style="top:1155px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Utok"
      class="field spell-row"
      style="top:1155px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19DobaSesilani"
      class="field spell-row"
      style="top:1155px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Slozky"
      class="field spell-row"
      style="top:1155px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Dosah"
      class="field spell-row"
      style="top:1155px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Trvani"
      class="field spell-row"
      style="top:1155px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Poznamka"
      class="field spell-row"
      style="top:1155px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(19)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r19Str"
      class="field spell-row"
      style="top:1155px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 20-->
    <input
      [formControl]="controls.spellsForm.controls.r20P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1192px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20S"
      class="field spell-row"
      style="top:1191px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Nazev"
      class="field spell-row "
      style="top:1191px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Utok"
      class="field spell-row"
      style="top:1191px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20DobaSesilani"
      class="field spell-row"
      style="top:1191px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Slozky"
      class="field spell-row"
      style="top:1191px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Dosah"
      class="field spell-row"
      style="top:1191px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Trvani"
      class="field spell-row"
      style="top:1191px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Poznamka"
      class="field spell-row"
      style="top:1191px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(20)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r20Str"
      class="field spell-row"
      style="top:1191px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 21-->
    <input
      [formControl]="controls.spellsForm.controls.r21P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1228px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21S"
      class="field spell-row"
      style="top:1227px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Nazev"
      class="field spell-row "
      style="top:1227px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Utok"
      class="field spell-row"
      style="top:1227px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21DobaSesilani"
      class="field spell-row"
      style="top:1227px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Slozky"
      class="field spell-row"
      style="top:1227px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Dosah"
      class="field spell-row"
      style="top:1227px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Trvani"
      class="field spell-row"
      style="top:1227px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Poznamka"
      class="field spell-row"
      style="top:1227px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(21)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r21Str"
      class="field spell-row"
      style="top:1227px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 22-->
    <input
      [formControl]="controls.spellsForm.controls.r22P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1264px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22S"
      class="field spell-row"
      style="top:1263px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Nazev"
      class="field spell-row "
      style="top:1263px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Utok"
      class="field spell-row"
      style="top:1263px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22DobaSesilani"
      class="field spell-row"
      style="top:1263px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Slozky"
      class="field spell-row"
      style="top:1263px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Dosah"
      class="field spell-row"
      style="top:1263px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Trvani"
      class="field spell-row"
      style="top:1263px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Poznamka"
      class="field spell-row"
      style="top:1263px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(22)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r22Str"
      class="field spell-row"
      style="top:1263px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 23-->
    <input
      [formControl]="controls.spellsForm.controls.r23P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1300px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23S"
      class="field spell-row"
      style="top:1299px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Nazev"
      class="field spell-row "
      style="top:1299px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Utok"
      class="field spell-row"
      style="top:1299px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23DobaSesilani"
      class="field spell-row"
      style="top:1299px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Slozky"
      class="field spell-row"
      style="top:1299px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Dosah"
      class="field spell-row"
      style="top:1299px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Trvani"
      class="field spell-row"
      style="top:1299px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Poznamka"
      class="field spell-row"
      style="top:1299px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(23)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r23Str"
      class="field spell-row"
      style="top:1299px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 24-->
    <input
      [formControl]="controls.spellsForm.controls.r24P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1336px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24S"
      class="field spell-row"
      style="top:1335px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Nazev"
      class="field spell-row "
      style="top:1335px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Utok"
      class="field spell-row"
      style="top:1335px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24DobaSesilani"
      class="field spell-row"
      style="top:1335px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Slozky"
      class="field spell-row"
      style="top:1335px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Dosah"
      class="field spell-row"
      style="top:1335px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Trvani"
      class="field spell-row"
      style="top:1335px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Poznamka"
      class="field spell-row"
      style="top:1335px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(24)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r24Str"
      class="field spell-row"
      style="top:1335px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 25-->
    <input
      [formControl]="controls.spellsForm.controls.r25P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1372px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25S"
      class="field spell-row"
      style="top:1371px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Nazev"
      class="field spell-row "
      style="top:1371px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Utok"
      class="field spell-row"
      style="top:1371px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25DobaSesilani"
      class="field spell-row"
      style="top:1371px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Slozky"
      class="field spell-row"
      style="top:1371px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Dosah"
      class="field spell-row"
      style="top:1371px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Trvani"
      class="field spell-row"
      style="top:1371px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Poznamka"
      class="field spell-row"
      style="top:1371px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(25)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r25Str"
      class="field spell-row"
      style="top:1371px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 26-->
    <input
      [formControl]="controls.spellsForm.controls.r26P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1408px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26S"
      class="field spell-row"
      style="top:1407px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Nazev"
      class="field spell-row "
      style="top:1407px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Utok"
      class="field spell-row"
      style="top:1407px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26DobaSesilani"
      class="field spell-row"
      style="top:1407px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Slozky"
      class="field spell-row"
      style="top:1407px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Dosah"
      class="field spell-row"
      style="top:1407px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Trvani"
      class="field spell-row"
      style="top:1407px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Poznamka"
      class="field spell-row"
      style="top:1407px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(26)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r26Str"
      class="field spell-row"
      style="top:1407px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 27-->
    <input
      [formControl]="controls.spellsForm.controls.r27P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1444px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27S"
      class="field spell-row"
      style="top:1443px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Nazev"
      class="field spell-row "
      style="top:1443px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Utok"
      class="field spell-row"
      style="top:1443px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27DobaSesilani"
      class="field spell-row"
      style="top:1443px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Slozky"
      class="field spell-row"
      style="top:1443px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Dosah"
      class="field spell-row"
      style="top:1443px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Trvani"
      class="field spell-row"
      style="top:1443px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Poznamka"
      class="field spell-row"
      style="top:1443px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(27)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r27Str"
      class="field spell-row"
      style="top:1443px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 28-->
    <input
      [formControl]="controls.spellsForm.controls.r28P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1480px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28S"
      class="field spell-row"
      style="top:1479px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Nazev"
      class="field spell-row "
      style="top:1479px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Utok"
      class="field spell-row"
      style="top:1479px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28DobaSesilani"
      class="field spell-row"
      style="top:1479px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Slozky"
      class="field spell-row"
      style="top:1479px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Dosah"
      class="field spell-row"
      style="top:1479px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Trvani"
      class="field spell-row"
      style="top:1479px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Poznamka"
      class="field spell-row"
      style="top:1479px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(28)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r28Str"
      class="field spell-row"
      style="top:1479px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 29-->
    <input
      [formControl]="controls.spellsForm.controls.r29P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1510px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29S"
      class="field spell-row"
      style="top:1509px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Nazev"
      class="field spell-row "
      style="top:1509px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Utok"
      class="field spell-row"
      style="top:1509px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29DobaSesilani"
      class="field spell-row"
      style="top:1509px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Slozky"
      class="field spell-row"
      style="top:1509px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Dosah"
      class="field spell-row"
      style="top:1509px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Trvani"
      class="field spell-row"
      style="top:1509px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Poznamka"
      class="field spell-row"
      style="top:1509px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(29)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r29Str"
      class="field spell-row"
      style="top:1509px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 30-->
    <input
      [formControl]="controls.spellsForm.controls.r30P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1546px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30S"
      class="field spell-row"
      style="top:1545px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Nazev"
      class="field spell-row "
      style="top:1545px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Utok"
      class="field spell-row"
      style="top:1545px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30DobaSesilani"
      class="field spell-row"
      style="top:1545px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Slozky"
      class="field spell-row"
      style="top:1545px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Dosah"
      class="field spell-row"
      style="top:1545px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Trvani"
      class="field spell-row"
      style="top:1545px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Poznamka"
      class="field spell-row"
      style="top:1545px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(30)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r30Str"
      class="field spell-row"
      style="top:1545px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 31-->
    <input
      [formControl]="controls.spellsForm.controls.r31P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1582px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31S"
      class="field spell-row"
      style="top:1581px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Nazev"
      class="field spell-row "
      style="top:1581px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Utok"
      class="field spell-row"
      style="top:1581px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31DobaSesilani"
      class="field spell-row"
      style="top:1581px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Slozky"
      class="field spell-row"
      style="top:1581px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Dosah"
      class="field spell-row"
      style="top:1581px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Trvani"
      class="field spell-row"
      style="top:1581px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Poznamka"
      class="field spell-row"
      style="top:1581px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(31)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r31Str"
      class="field spell-row"
      style="top:1581px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 32-->
    <input
      [formControl]="controls.spellsForm.controls.r32P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1618px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32S"
      class="field spell-row"
      style="top:1617px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Nazev"
      class="field spell-row "
      style="top:1617px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Utok"
      class="field spell-row"
      style="top:1617px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32DobaSesilani"
      class="field spell-row"
      style="top:1617px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Slozky"
      class="field spell-row"
      style="top:1617px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Dosah"
      class="field spell-row"
      style="top:1617px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Trvani"
      class="field spell-row"
      style="top:1617px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Poznamka"
      class="field spell-row"
      style="top:1617px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(32)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r32Str"
      class="field spell-row"
      style="top:1617px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 33-->
    <input
      [formControl]="controls.spellsForm.controls.r33P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1654px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33S"
      class="field spell-row"
      style="top:1653px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Nazev"
      class="field spell-row "
      style="top:1653px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Utok"
      class="field spell-row"
      style="top:1653px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33DobaSesilani"
      class="field spell-row"
      style="top:1653px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Slozky"
      class="field spell-row"
      style="top:1653px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Dosah"
      class="field spell-row"
      style="top:1653px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Trvani"
      class="field spell-row"
      style="top:1653px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Poznamka"
      class="field spell-row"
      style="top:1653px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(33)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r33Str"
      class="field spell-row"
      style="top:1653px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 34-->
    <input
      [formControl]="controls.spellsForm.controls.r34P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1690px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34S"
      class="field spell-row"
      style="top:1689px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Nazev"
      class="field spell-row "
      style="top:1689px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Utok"
      class="field spell-row"
      style="top:1689px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34DobaSesilani"
      class="field spell-row"
      style="top:1689px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Slozky"
      class="field spell-row"
      style="top:1689px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Dosah"
      class="field spell-row"
      style="top:1689px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Trvani"
      class="field spell-row"
      style="top:1689px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Poznamka"
      class="field spell-row"
      style="top:1689px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(34)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r34Str"
      class="field spell-row"
      style="top:1689px; left:1160px; width:60px;"
      placeholder="*"
    />

    <!--    ROW 35-->
    <input
      [formControl]="controls.spellsForm.controls.r35P"
      type="checkbox"
      class="field checkbox red-checkbox"
      style="top:1732px; left:69px;"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35S"
      class="field spell-row"
      style="top:1731px; left:102px; width:41px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Nazev"
      class="field spell-row "
      style="top:1731px; left:152px; width:193px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Utok"
      class="field spell-row"
      style="top:1731px; left:353px; width:78px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35DobaSesilani"
      class="field spell-row"
      style="top:1731px; left:439px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Slozky"
      class="field spell-row"
      style="top:1731px; left:506px; width:58px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Dosah"
      class="field spell-row"
      style="top:1731px; left:572px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Trvani"
      class="field spell-row"
      style="top:1731px; left:658px; width:77px;"
      placeholder="*"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Poznamka"
      class="field spell-row"
      style="top:1731px; left:744px; width:408px;"
      placeholder="*"
      [matTooltip]="poz(35)()"
    />
    <input
      [formControl]="controls.spellsForm.controls.r35Str"
      class="field spell-row"
      style="top:1731px; left:1160px; width:60px;"
      placeholder="*"
    />
  `,
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatTooltip],
})
export class ThirdPageComponent {
  form = input.required<FormGroup<ThirdPageForm>>();

  /**
   * Single signal tracking the entire spellsForm value reactively.
   * toSignal is called here at field-initializer time (injection context),
   * toObservable converts the form signal input to an observable,
   * switchMap subscribes to valueChanges with startWith so the initial value is captured.
   */
  private readonly _spellValues = toSignal(
    toObservable(this.form).pipe(
      switchMap(f => f.controls.spellsForm.valueChanges.pipe(startWith(f.controls.spellsForm.getRawValue()))),
    ),
    { initialValue: {} as Record<string, string> },
  );

  /** Returns a computed signal for the poznamka tooltip of row N */
  poz(n: number): Signal<string> {
    return computed(() => (this._spellValues() as Record<string, string>)[`r${n}Poznamka`] ?? '');
  }

  get controls(): ThirdPageForm {
    return this.form().controls;
  }

  static createForm(): FormGroup<ThirdPageForm> {
    const fb = new FormBuilder().nonNullable;
    return fb.group<ThirdPageForm>({
      topInfoForSpellSheet: fb.group<TopInfoForSpellSheetForm>({
        jmenoPostavy: fb.control(''),
        stupenPozic: fb.control(''),
        checkbox1: fb.control(''),
        checkbox2: fb.control(''),
        checkbox3: fb.control(''),
        checkbox4: fb.control(''),
        mystickyTaj: fb.control(''),
        mystickyTajCheckbox1: fb.control(''),
        mystickyTajCheckbox2: fb.control(''),
        mystickyTajCheckbox3: fb.control(''),
        mystickyTajCheckbox4: fb.control(''),
      }),
      professionForm: fb.group<ProfessionForm>({
        prvniPovolaniSesilatelskePovolani: fb.control(''),
        prvniPovolaniUroven: fb.control(''),
        prvniPovolaniMaxStupenKouzel: fb.control(''),
        prvniPovolaniSesilaciVlastnost: fb.control(''),
        prvniPovolaniSOZachrany: fb.control(''),
        prvniPovolaniUtocnyBonus: fb.control(''),

        druhePovolaniSesilatelskePovolani: fb.control(''),
        druhePovolaniUroven: fb.control(''),
        druhePovolaniMaxStupenKouzel: fb.control(''),
        druhePovolaniSesilaciVlastnost: fb.control(''),
        druhePovolaniSOZachrany: fb.control(''),
        druhePovolaniUtocnyBonus: fb.control(''),
      }),
      spellsForm: fb.group<SpellsForm>({
        r1P: fb.control(''),
        r1S: fb.control(''),
        r1Nazev: fb.control(''),
        r1Utok: fb.control(''),
        r1DobaSesilani: fb.control(''),
        r1Slozky: fb.control(''),
        r1Dosah: fb.control(''),
        r1Trvani: fb.control(''),
        r1Poznamka: fb.control(''),
        r1Str: fb.control(''),

        r2P: fb.control(''),
        r2S: fb.control(''),
        r2Nazev: fb.control(''),
        r2Utok: fb.control(''),
        r2DobaSesilani: fb.control(''),
        r2Slozky: fb.control(''),
        r2Dosah: fb.control(''),
        r2Trvani: fb.control(''),
        r2Poznamka: fb.control(''),
        r2Str: fb.control(''),

        r3P: fb.control(''),
        r3S: fb.control(''),
        r3Nazev: fb.control(''),
        r3Utok: fb.control(''),
        r3DobaSesilani: fb.control(''),
        r3Slozky: fb.control(''),
        r3Dosah: fb.control(''),
        r3Trvani: fb.control(''),
        r3Poznamka: fb.control(''),
        r3Str: fb.control(''),

        r4P: fb.control(''),
        r4S: fb.control(''),
        r4Nazev: fb.control(''),
        r4Utok: fb.control(''),
        r4DobaSesilani: fb.control(''),
        r4Slozky: fb.control(''),
        r4Dosah: fb.control(''),
        r4Trvani: fb.control(''),
        r4Poznamka: fb.control(''),
        r4Str: fb.control(''),

        r5P: fb.control(''),
        r5S: fb.control(''),
        r5Nazev: fb.control(''),
        r5Utok: fb.control(''),
        r5DobaSesilani: fb.control(''),
        r5Slozky: fb.control(''),
        r5Dosah: fb.control(''),
        r5Trvani: fb.control(''),
        r5Poznamka: fb.control(''),
        r5Str: fb.control(''),

        r6P: fb.control(''),
        r6S: fb.control(''),
        r6Nazev: fb.control(''),
        r6Utok: fb.control(''),
        r6DobaSesilani: fb.control(''),
        r6Slozky: fb.control(''),
        r6Dosah: fb.control(''),
        r6Trvani: fb.control(''),
        r6Poznamka: fb.control(''),
        r6Str: fb.control(''),

        r7P: fb.control(''),
        r7S: fb.control(''),
        r7Nazev: fb.control(''),
        r7Utok: fb.control(''),
        r7DobaSesilani: fb.control(''),
        r7Slozky: fb.control(''),
        r7Dosah: fb.control(''),
        r7Trvani: fb.control(''),
        r7Poznamka: fb.control(''),
        r7Str: fb.control(''),

        r8P: fb.control(''),
        r8S: fb.control(''),
        r8Nazev: fb.control(''),
        r8Utok: fb.control(''),
        r8DobaSesilani: fb.control(''),
        r8Slozky: fb.control(''),
        r8Dosah: fb.control(''),
        r8Trvani: fb.control(''),
        r8Poznamka: fb.control(''),
        r8Str: fb.control(''),

        r9P: fb.control(''),
        r9S: fb.control(''),
        r9Nazev: fb.control(''),
        r9Utok: fb.control(''),
        r9DobaSesilani: fb.control(''),
        r9Slozky: fb.control(''),
        r9Dosah: fb.control(''),
        r9Trvani: fb.control(''),
        r9Poznamka: fb.control(''),
        r9Str: fb.control(''),

        r10P: fb.control(''),
        r10S: fb.control(''),
        r10Nazev: fb.control(''),
        r10Utok: fb.control(''),
        r10DobaSesilani: fb.control(''),
        r10Slozky: fb.control(''),
        r10Dosah: fb.control(''),
        r10Trvani: fb.control(''),
        r10Poznamka: fb.control(''),
        r10Str: fb.control(''),

        r11P: fb.control(''),
        r11S: fb.control(''),
        r11Nazev: fb.control(''),
        r11Utok: fb.control(''),
        r11DobaSesilani: fb.control(''),
        r11Slozky: fb.control(''),
        r11Dosah: fb.control(''),
        r11Trvani: fb.control(''),
        r11Poznamka: fb.control(''),
        r11Str: fb.control(''),
        r12P: fb.control(''),
        r12S: fb.control(''),
        r12Nazev: fb.control(''),
        r12Utok: fb.control(''),
        r12DobaSesilani: fb.control(''),
        r12Slozky: fb.control(''),
        r12Dosah: fb.control(''),
        r12Trvani: fb.control(''),
        r12Poznamka: fb.control(''),
        r12Str: fb.control(''),
        r13P: fb.control(''),
        r13S: fb.control(''),
        r13Nazev: fb.control(''),
        r13Utok: fb.control(''),
        r13DobaSesilani: fb.control(''),
        r13Slozky: fb.control(''),
        r13Dosah: fb.control(''),
        r13Trvani: fb.control(''),
        r13Poznamka: fb.control(''),
        r13Str: fb.control(''),
        r14P: fb.control(''),
        r14S: fb.control(''),
        r14Nazev: fb.control(''),
        r14Utok: fb.control(''),
        r14DobaSesilani: fb.control(''),
        r14Slozky: fb.control(''),
        r14Dosah: fb.control(''),
        r14Trvani: fb.control(''),
        r14Poznamka: fb.control(''),
        r14Str: fb.control(''),
        r15P: fb.control(''),
        r15S: fb.control(''),
        r15Nazev: fb.control(''),
        r15Utok: fb.control(''),
        r15DobaSesilani: fb.control(''),
        r15Slozky: fb.control(''),
        r15Dosah: fb.control(''),
        r15Trvani: fb.control(''),
        r15Poznamka: fb.control(''),
        r15Str: fb.control(''),
        r16P: fb.control(''),
        r16S: fb.control(''),
        r16Nazev: fb.control(''),
        r16Utok: fb.control(''),
        r16DobaSesilani: fb.control(''),
        r16Slozky: fb.control(''),
        r16Dosah: fb.control(''),
        r16Trvani: fb.control(''),
        r16Poznamka: fb.control(''),
        r16Str: fb.control(''),
        r17P: fb.control(''),
        r17S: fb.control(''),
        r17Nazev: fb.control(''),
        r17Utok: fb.control(''),
        r17DobaSesilani: fb.control(''),
        r17Slozky: fb.control(''),
        r17Dosah: fb.control(''),
        r17Trvani: fb.control(''),
        r17Poznamka: fb.control(''),
        r17Str: fb.control(''),
        r18P: fb.control(''),
        r18S: fb.control(''),
        r18Nazev: fb.control(''),
        r18Utok: fb.control(''),
        r18DobaSesilani: fb.control(''),
        r18Slozky: fb.control(''),
        r18Dosah: fb.control(''),
        r18Trvani: fb.control(''),
        r18Poznamka: fb.control(''),
        r18Str: fb.control(''),
        r19P: fb.control(''),
        r19S: fb.control(''),
        r19Nazev: fb.control(''),
        r19Utok: fb.control(''),
        r19DobaSesilani: fb.control(''),
        r19Slozky: fb.control(''),
        r19Dosah: fb.control(''),
        r19Trvani: fb.control(''),
        r19Poznamka: fb.control(''),
        r19Str: fb.control(''),
        r20P: fb.control(''),
        r20S: fb.control(''),
        r20Nazev: fb.control(''),
        r20Utok: fb.control(''),
        r20DobaSesilani: fb.control(''),
        r20Slozky: fb.control(''),
        r20Dosah: fb.control(''),
        r20Trvani: fb.control(''),
        r20Poznamka: fb.control(''),
        r20Str: fb.control(''),
        r21P: fb.control(''),
        r21S: fb.control(''),
        r21Nazev: fb.control(''),
        r21Utok: fb.control(''),
        r21DobaSesilani: fb.control(''),
        r21Slozky: fb.control(''),
        r21Dosah: fb.control(''),
        r21Trvani: fb.control(''),
        r21Poznamka: fb.control(''),
        r21Str: fb.control(''),
        r22P: fb.control(''),
        r22S: fb.control(''),
        r22Nazev: fb.control(''),
        r22Utok: fb.control(''),
        r22DobaSesilani: fb.control(''),
        r22Slozky: fb.control(''),
        r22Dosah: fb.control(''),
        r22Trvani: fb.control(''),
        r22Poznamka: fb.control(''),
        r22Str: fb.control(''),
        r23P: fb.control(''),
        r23S: fb.control(''),
        r23Nazev: fb.control(''),
        r23Utok: fb.control(''),
        r23DobaSesilani: fb.control(''),
        r23Slozky: fb.control(''),
        r23Dosah: fb.control(''),
        r23Trvani: fb.control(''),
        r23Poznamka: fb.control(''),
        r23Str: fb.control(''),
        r24P: fb.control(''),
        r24S: fb.control(''),
        r24Nazev: fb.control(''),
        r24Utok: fb.control(''),
        r24DobaSesilani: fb.control(''),
        r24Slozky: fb.control(''),
        r24Dosah: fb.control(''),
        r24Trvani: fb.control(''),
        r24Poznamka: fb.control(''),
        r24Str: fb.control(''),
        r25P: fb.control(''),
        r25S: fb.control(''),
        r25Nazev: fb.control(''),
        r25Utok: fb.control(''),
        r25DobaSesilani: fb.control(''),
        r25Slozky: fb.control(''),
        r25Dosah: fb.control(''),
        r25Trvani: fb.control(''),
        r25Poznamka: fb.control(''),
        r25Str: fb.control(''),
        r26P: fb.control(''),
        r26S: fb.control(''),
        r26Nazev: fb.control(''),
        r26Utok: fb.control(''),
        r26DobaSesilani: fb.control(''),
        r26Slozky: fb.control(''),
        r26Dosah: fb.control(''),
        r26Trvani: fb.control(''),
        r26Poznamka: fb.control(''),
        r26Str: fb.control(''),
        r27P: fb.control(''),
        r27S: fb.control(''),
        r27Nazev: fb.control(''),
        r27Utok: fb.control(''),
        r27DobaSesilani: fb.control(''),
        r27Slozky: fb.control(''),
        r27Dosah: fb.control(''),
        r27Trvani: fb.control(''),
        r27Poznamka: fb.control(''),
        r27Str: fb.control(''),
        r28P: fb.control(''),
        r28S: fb.control(''),
        r28Nazev: fb.control(''),
        r28Utok: fb.control(''),
        r28DobaSesilani: fb.control(''),
        r28Slozky: fb.control(''),
        r28Dosah: fb.control(''),
        r28Trvani: fb.control(''),
        r28Poznamka: fb.control(''),
        r28Str: fb.control(''),
        r29P: fb.control(''),
        r29S: fb.control(''),
        r29Nazev: fb.control(''),
        r29Utok: fb.control(''),
        r29DobaSesilani: fb.control(''),
        r29Slozky: fb.control(''),
        r29Dosah: fb.control(''),
        r29Trvani: fb.control(''),
        r29Poznamka: fb.control(''),
        r29Str: fb.control(''),
        r30P: fb.control(''),
        r30S: fb.control(''),
        r30Nazev: fb.control(''),
        r30Utok: fb.control(''),
        r30DobaSesilani: fb.control(''),
        r30Slozky: fb.control(''),
        r30Dosah: fb.control(''),
        r30Trvani: fb.control(''),
        r30Poznamka: fb.control(''),
        r30Str: fb.control(''),
        r31P: fb.control(''),
        r31S: fb.control(''),
        r31Nazev: fb.control(''),
        r31Utok: fb.control(''),
        r31DobaSesilani: fb.control(''),
        r31Slozky: fb.control(''),
        r31Dosah: fb.control(''),
        r31Trvani: fb.control(''),
        r31Poznamka: fb.control(''),
        r31Str: fb.control(''),
        r32P: fb.control(''),
        r32S: fb.control(''),
        r32Nazev: fb.control(''),
        r32Utok: fb.control(''),
        r32DobaSesilani: fb.control(''),
        r32Slozky: fb.control(''),
        r32Dosah: fb.control(''),
        r32Trvani: fb.control(''),
        r32Poznamka: fb.control(''),
        r32Str: fb.control(''),
        r33P: fb.control(''),
        r33S: fb.control(''),
        r33Nazev: fb.control(''),
        r33Utok: fb.control(''),
        r33DobaSesilani: fb.control(''),
        r33Slozky: fb.control(''),
        r33Dosah: fb.control(''),
        r33Trvani: fb.control(''),
        r33Poznamka: fb.control(''),
        r33Str: fb.control(''),
        r34P: fb.control(''),
        r34S: fb.control(''),
        r34Nazev: fb.control(''),
        r34Utok: fb.control(''),
        r34DobaSesilani: fb.control(''),
        r34Slozky: fb.control(''),
        r34Dosah: fb.control(''),
        r34Trvani: fb.control(''),
        r34Poznamka: fb.control(''),
        r34Str: fb.control(''),
        r35P: fb.control(''),
        r35S: fb.control(''),
        r35Nazev: fb.control(''),
        r35Utok: fb.control(''),
        r35DobaSesilani: fb.control(''),
        r35Slozky: fb.control(''),
        r35Dosah: fb.control(''),
        r35Trvani: fb.control(''),
        r35Poznamka: fb.control(''),
        r35Str: fb.control(''),
      }),
    });
  }
}
