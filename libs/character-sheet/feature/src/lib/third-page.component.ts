import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  HeaderInfoForm,
  LookAndFeelForm,
  ProfessionForm,
  SecondPageForm,
  SpellsForm,
  ThirdPageForm,
  TopInfoForSpellSheetForm,
} from '@dn-d-servant/character-sheet-util';

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
    />
    <input
      [formControl]="controls.spellsForm.controls.r10Str"
      class="field spell-row"
      style="top:831px; left:1160px; width:60px;"
      placeholder="*"
    />
  `,
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class ThirdPageComponent {
  form = input.required<FormGroup<ThirdPageForm>>();

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

        columnP: fb.control(''),
        columnS: fb.control(''),
        columnNazev: fb.control(''),
        columnUtok: fb.control(''),
        columnDobaSesilani: fb.control(''),
        columnSlozky: fb.control(''),
        columnDosah: fb.control(''),
        columnTrvani: fb.control(''),
        columnPoznamka: fb.control(''),
        columnStr: fb.control(''),
      }),
    });
  }
}
