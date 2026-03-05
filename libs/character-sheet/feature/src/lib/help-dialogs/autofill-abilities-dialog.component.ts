import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { LocalStorageService } from '@dn-d-servant/util';
import { FormsModule } from '@angular/forms';

export const AUTOFILL_DIALOG_HIDDEN_KEY = 'autofill-dialog-hidden';

@Component({
  selector: 'autofill-abilities-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      <span class="dialog-title__text">
        <span class="dialog-title__icon">⚙️</span>
        Automatické vyplňování schopností
      </span>
      <button class="dialog-title__close" (click)="onClose()" matIconButton>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content autofill-dialog-content">
      <div class="autofill-footer autofill-footer--top">
        <label class="autofill-no-show">
          <mat-checkbox [(ngModel)]="dontShow" color="primary" />
          <span>Příště nezobrazovat</span>
        </label>
      </div>

      <div class="autofill-intro">
        <p class="autofill-intro__text">
          Karta postavy podporuje
          <strong>automatické vyplňování</strong>
          odvozených hodnot.
          <br />
          Stačí vyplnit základní schopnosti a vše se spočítá samo.
        </p>
      </div>

      <ol class="autofill-steps">
        <li class="autofill-step">
          <span class="autofill-step__num">1</span>
          <div class="autofill-step__body">
            <strong>Zadej hodnoty 6 základních schopností</strong>
            <span>(Síla, Obratnost, Odolnost, Inteligence, Moudrost, Charisma)</span>
            <em>→ Opravy schopností se vypočítají automaticky podle pravidel JaD.</em>
          </div>
        </li>
        <li class="autofill-step">
          <span class="autofill-step__num">2</span>
          <div class="autofill-step__body">
            <strong>Vyplň úroveň postavy (Úroveň)</strong>
            <span>
              →
              <strong>Zdatnostní bonus</strong>
              se automaticky aktualizuje podle úrovně a podle něj i všechny hodnoty, kde je zdatnost/expertíza. Funguje i zpětně,
              takže level se může vyplnit jako poslední.
            </span>
          </div>
        </li>
        <li class="autofill-step">
          <span class="autofill-step__num">3</span>
          <div class="autofill-step__body">
            <strong>Iniciativa se vyplní sama</strong>
            <span>
              → Hodnota
              <strong>Iniciativy</strong>
              je vždy rovna opravě
              <strong>Obratnosti</strong>
              .
            </span>
          </div>
        </li>
        <li class="autofill-step">
          <span class="autofill-step__num">4</span>
          <div class="autofill-step__body">
            <strong>Zaškrtni zdatnosti hvězdičkou</strong>
            <span>→ Jednoklik = zdatnost (+zdatnostní bonus), dvojklik = expertíza (+2× zdatnostní bonus).</span>
            <em>→ Hodnoty Dovedností, Záchranných hodů a Pasivních dovedností se přepočítají automaticky.</em>
          </div>
        </li>
      </ol>

      <div class="dice-info-box">
        <div class="dice-info-box__header">
          <span class="dice-info-box__icon">🎲</span>
          <span class="dice-info-box__title">Kostka u čísel schopností a dovedností</span>
        </div>
        <p class="dice-info-box__text">
          Najeď myší na pole
          <strong>základní schopnosti</strong>
          (Síla, Obratnost…),
          <strong>Dovednosti</strong>
          (Atletika, Akrobacie…) nebo
          <strong>Záchranné hody</strong>
          — zobrazí se ikona
          <span class="dice-info-box__inline-icon">🎲</span>
          . Klikni na ni a automaticky se:
        </p>
        <ul class="dice-info-box__list">
          <li>
            <span class="dice-info-box__tag dice-info-box__tag--ability">Schopnosti</span>
            Hodí k20 a přičte opravu dané základní schopnosti (Síla, Obr, Odl…)
          </li>
          <li>
            <span class="dice-info-box__tag dice-info-box__tag--skill">Dovednosti</span>
            Hodí k20 a přičte hodnotu dané dovednosti (vč. zdatnosti/expertízy)
          </li>
          <li>
            <span class="dice-info-box__tag dice-info-box__tag--save">Záchranné hody</span>
            Hodí k20 a přičte opravu záchranného hodu (vč. zdatnostního bonusu)
          </li>
        </ul>
        <p class="dice-info-box__text" style="margin-top: 10px; margin-bottom: 0;">
          Výsledek se zobrazí v plovoucím
          <strong>panelu kostky</strong>
          vlevo na obrazovce spolu s historií hodů.
        </p>
      </div>

      <div class="autofill-gif-wrap">
        <img src="autofill-of-abilities.gif" alt="Ukázka automatického vyplňování" class="autofill-gif" />
      </div>
    </mat-dialog-content>
  `,
  styles: `
    .autofill-dialog-content {
      padding: 0 24px 20px !important;
      max-width: 680px;
      max-height: 82vh;
      overflow-y: auto;
    }

    :host ::ng-deep .dialog-title {
      position: relative !important;
    }

    .dialog-title__text {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      pointer-events: none;
    }

    .autofill-intro {
      margin: 12px 0 18px;
      padding: 10px 14px;
      background: rgba(200,160,60,.07);
      border-left: 3px solid rgba(200,160,60,.5);
      border-radius: 0 6px 6px 0;

      &__text {
        margin: 0;
        font-size: 13px;
        color: #d4c090;
        line-height: 1.6;

        strong { color: #f0d070; }
      }
    }

    .autofill-steps {
      list-style: none;
      padding: 0;
      margin: 0 0 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .autofill-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 14px;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(200,160,60,.15);
      border-radius: 6px;
      transition: border-color .2s;

      &:hover { border-color: rgba(200,160,60,.35); }

      &__num {
        flex-shrink: 0;
        width: 28px; height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3a2200, #1a0e00);
        border: 1px solid rgba(200,160,60,.5);
        color: #f0d070;
        font-size: 13px;
        font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 8px rgba(200,160,60,.2);
      }

      &__body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 13px;
        line-height: 1.5;

        strong { color: #f0d070; font-weight: 700; }
        span   { color: #c8b890; }
        em     { color: #a09060; font-style: normal; font-size: 12px; }
      }
    }

    .dice-info-box {
      margin: 0 0 18px;
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(20,10,0,.6), rgba(10,5,0,.8));
      border: 1px solid rgba(200,160,60,.45);
      border-radius: 8px;
      box-shadow: 0 0 16px rgba(200,160,60,.1);

      &__header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      &__icon {
        font-size: 28px;
        line-height: 1;
        filter: drop-shadow(0 0 6px rgba(200,160,60,.7));
      }

      &__inline-icon {
        font-size: 14px;
        line-height: 1;
        vertical-align: middle;
        margin: 0 1px;
      }

      &__title {
        font-size: 14px;
        color: #f0d070;
        font-weight: 700;
        text-shadow: 0 0 8px rgba(200,160,60,.4);
      }

      &__text {
        margin: 0 0 12px;
        font-size: 12.5px;
        color: #c8b890;
        line-height: 1.65;

        strong { color: #f0d070; }
      }

      &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;

        li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #a09060;
        }
      }

      &__tag {
        flex-shrink: 0;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .04em;

        &--ability { background: rgba(168,64,255,.25); border: 1px solid rgba(168,64,255,.5); color: #d090ff; }
        &--skill   { background: rgba(58,184,106,.2);  border: 1px solid rgba(58,184,106,.45); color: #80e0a0; }
        &--save    { background: rgba(72,120,224,.2);  border: 1px solid rgba(72,120,224,.45); color: #90b8f0; }
      }
    }

    .autofill-gif-wrap {
      display: flex;
      justify-content: center;
      margin: 4px 0 18px;
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 8px;
      overflow: hidden;
    }

    .autofill-gif {
      width: 100%;
      max-width: 640px;
      display: block;
    }

    .autofill-footer {
      display: flex;
      justify-content: flex-end;
      padding-bottom: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid rgba(200,160,60,.15);
    }

    .autofill-no-show {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 12px;
      color: #9a8060;
      user-select: none;

      &:hover { color: #c8a03c; }
    }
  `,
  imports: [MatDialogContent, MatDialogTitle, MatCheckboxModule, MatIconButton, MatIcon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutofillAbilitiesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AutofillAbilitiesDialogComponent>);
  private readonly ls = inject(LocalStorageService);

  dontShow = false;

  onClose(): void {
    if (this.dontShow) {
      this.ls.setDataSync(AUTOFILL_DIALOG_HIDDEN_KEY, true);
    }
    this.dialogRef.close();
  }
}

export function openAutofillAbilitiesDialog(dialog: MatDialog): Observable<void> {
  return dialog
    .open(AutofillAbilitiesDialogComponent, {
      width: '700px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      disableClose: false,
    })
    .afterClosed();
}
