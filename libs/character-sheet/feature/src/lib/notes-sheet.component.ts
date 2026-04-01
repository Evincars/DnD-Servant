import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NotesPageForm } from '@dn-d-servant/character-sheet-util';
import { RichTextareaComponent } from '@dn-d-servant/ui';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotesFormModelMappers } from './api-mappers/notes-form-model-mappers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'notes-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RichTextareaComponent, MatIcon],
  styles: `
    :host { display: block; padding: 24px 32px 40px; font-family: 'Mikadan', sans-serif; overflow: visible; }

    /* ── Header ─────────────────────────────────── */
    .header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 24px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(200,160,60,.6) 20%, rgba(240,200,80,.85) 50%, rgba(200,160,60,.6) 80%, transparent) 1;
    }
    .header-title {
      font-size: 22px; letter-spacing: .12em; text-transform: uppercase;
      color: #e8c96a; text-shadow: 0 0 18px rgba(200,160,60,.4), 0 0 4px rgba(200,160,60,.2);
      display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #c8a03c; }
    }
    .header-subtitle { font-size: 11px; color: rgba(200,160,60,.4); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }
    .header-actions { display: flex; gap: 10px; align-items: center; }

    .autosave-indicator {
      font-family: sans-serif; font-size: 10px; letter-spacing: .05em;
      color: rgba(100,200,120,.55); display: flex; align-items: center; gap: 5px;
      transition: opacity .4s;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &--hidden { opacity: 0; pointer-events: none; }
    }

    .btn-save {
      font-family: 'Mikadan', sans-serif; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(80,160,80,.35); border-radius: 3px; background: rgba(60,120,60,.08);
      color: rgba(100,200,100,.8); padding: 6px 16px; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(60,140,60,.18); border-color: rgba(80,180,80,.6); color: #80e080; }
    }

    /* ── 2-column panel grid ─────────────────────── */
    .notes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto;
      gap: 18px;
    }

    /* ── Single note panel ───────────────────────── */
    .note-panel {
      border-radius: 3px; overflow: hidden;
      background: linear-gradient(160deg, rgba(42,32,14,.97) 0%, rgba(28,20,8,.99) 100%);
      border: 1px solid rgba(200,160,60,.15);
      box-shadow: 0 4px 20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,220,100,.04);
      transition: border-color .2s, box-shadow .2s;
      position: relative;
      &:hover { border-color: rgba(200,160,60,.32); box-shadow: 0 6px 26px rgba(0,0,0,.6), 0 0 8px rgba(200,160,60,.06); }
      &::before { content: '◆'; position: absolute; top: 5px; left: 8px; font-size: 6px; color: rgba(200,160,60,.2); pointer-events: none; }
    }

    .panel-rule { height: 2px; background: linear-gradient(90deg, rgba(200,160,60,0) 0%, rgba(200,160,60,.35) 40%, rgba(240,200,80,.6) 50%, rgba(200,160,60,.35) 60%, rgba(200,160,60,0) 100%); }

    .panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px 8px; border-bottom: 1px solid rgba(200,160,60,.08);
    }
    .panel-icon { font-size: 17px !important; width: 17px !important; height: 17px !important; flex-shrink: 0; }
    .panel-title { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
    .panel-desc { font-family: sans-serif; font-size: 10px; margin-left: auto; color: rgba(255,255,255,.18); font-style: italic; letter-spacing: .03em; }

    .panel--expedition { border-color: rgba(200,160,60,.2);
      grid-row: 1 / span 2; display: flex; flex-direction: column;
      .panel-header { background: rgba(200,160,60,.07); } .panel-icon { color: rgba(220,180,80,.7); } .panel-title { color: rgba(230,195,90,.9); }
      .rt-wrap { flex: 1; height: auto; min-height: 380px; } }
    .panel--maps { border-color: rgba(80,160,100,.2);
      .panel-header { background: rgba(80,160,100,.06); } .panel-icon { color: rgba(100,190,120,.65); } .panel-title { color: rgba(120,200,140,.85); } }
    .panel--goals { border-color: rgba(220,120,60,.2);
      .panel-header { background: rgba(220,120,60,.06); } .panel-icon { color: rgba(230,140,80,.65); } .panel-title { color: rgba(240,160,90,.85); } }

    /* ── Rich-textarea wrapper ───────────────────── */
    .rt-wrap { position: relative; height: 380px; background: rgba(0,0,0,.15); }
  `,
  template: `
    <form [formGroup]="form">
      <div class="header">
        <div>
          <div class="header-title"><mat-icon>auto_stories</mat-icon>Zápisník Dobrodruhů</div>
          <div class="header-subtitle">Osobní zápisky, mapy, NPC a cíle tvojí postavy</div>
        </div>
        <div class="header-actions">
          <span class="autosave-indicator" [class.autosave-indicator--hidden]="!autoSaved()">
            <mat-icon>check_circle</mat-icon> Automaticky uloženo
          </span>
          <button class="btn-save" type="submit" (click)="onSaveClick()">
            <mat-icon>save</mat-icon>Uložit
          </button>
        </div>
      </div>

      <div class="notes-grid">
        <!-- Zápisky z Výpravy — notesColumn1 (existing data preserved) -->
        <div class="note-panel panel--expedition">
          <div class="panel-rule"></div>
          <div class="panel-header">
            <mat-icon class="panel-icon">history_edu</mat-icon>
            <span class="panel-title">Zápisky z Výpravy</span>
            <span class="panel-desc">Deník sezení, klíčové události</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [formControl]="controls.notesColumn1" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>

        <!-- Mapy & Místa — notesColumn2 (existing data preserved) -->
        <div class="note-panel panel--maps">
          <div class="panel-rule"></div>
          <div class="panel-header">
            <mat-icon class="panel-icon">explore</mat-icon>
            <span class="panel-title">Mapy &amp; Místa</span>
            <span class="panel-desc">Lokace, sklepy, popisky map</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [formControl]="controls.notesColumn2" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>

        <!-- Cíle & Tajemství — notesColumn4 (new) -->
        <div class="note-panel panel--goals">
          <div class="panel-rule"></div>
          <div class="panel-header">
            <mat-icon class="panel-icon">psychology</mat-icon>
            <span class="panel-title">Cíle &amp; Tajemství</span>
            <span class="panel-desc">Otevřené otázky, plány, úkoly</span>
          </div>
          <div class="rt-wrap">
            <rich-textarea [formControl]="controls.notesColumn4" style="top:0;left:0;width:100%;height:100%;"></rich-textarea>
          </div>
        </div>
      </div>
    </form>
  `,
})
export class NotesSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  autoSaved = signal(false);

  private readonly documentName = '_notes';

  fb = new FormBuilder().nonNullable;
  form = this.fb.group<NotesPageForm>({
    notesColumn1: this.fb.control(''),
    notesColumn2: this.fb.control(''),
    notesColumn4: this.fb.control(''),
  });

  get controls() { return this.form.controls; }

  constructor() {
    effect(() => {
      const username = this.authService.currentUser()?.username;
      untracked(() => {
        if (username) {
          this.characterSheetStore.getNotesPageByUsername(`${username}${this.documentName}`);
        }
      });
    });

    effect(() => {
      const notesPage = this.characterSheetStore.notesPage();
      untracked(() => {
        if (notesPage) {
          const formValue = FormUtil.convertModelToForm(notesPage, NotesFormModelMappers.notesFormToApiMapper);
          this.form.patchValue(formValue);
        }
      });
    });

    // ── Auto-draft every 30 s → localStorage ──────────────────────────────
    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const username = this.authService.currentUser()?.username;
        if (!username) return;
        const model = FormUtil.convertFormToModel(this.form.getRawValue(), NotesFormModelMappers.notesFormToApiMapper);
        model.username = `${username}${this.documentName}`;
        this.characterSheetStore.saveDraftToLocalStorage({ type: 'notes', model });
        this.autoSaved.set(true);
        setTimeout(() => this.autoSaved.set(false), 3000);
      });
  }

  onSaveClick(): void {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(this.form.getRawValue(), NotesFormModelMappers.notesFormToApiMapper);
      request.username = `${username}${this.documentName}`;

      this.characterSheetStore.saveNotesPage(request);
    } else {
      this.snackBar.open('Pro uložení poznámek se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }
}
