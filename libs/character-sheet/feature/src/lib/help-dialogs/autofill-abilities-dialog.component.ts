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
      <span class="dialog-title__icon">⚙️</span>
      Automatické vyplňování schopností
      <button class="dialog-title__close" (click)="onClose()" matIconButton>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content autofill-dialog-content">
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

      <div class="autofill-gif-wrap">
        <img src="autofill-of-abilities.gif" alt="Ukázka automatického vyplňování" class="autofill-gif" />
      </div>

      <div class="autofill-footer">
        <label class="autofill-no-show">
          <mat-checkbox [(ngModel)]="dontShow" color="primary" />
          <span>Příště nezobrazovat</span>
        </label>
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
      padding-top: 8px;
      border-top: 1px solid rgba(200,160,60,.15);
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
