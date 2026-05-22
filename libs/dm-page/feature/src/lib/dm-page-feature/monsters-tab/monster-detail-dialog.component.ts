import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, catchError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { WikiService } from '@dn-d-servant/character-sheet-feature';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JadMonstersService } from './jad-monsters.service';

export interface MonsterDetailDialogData {
  monsterName: string;
}

@Component({
  selector: 'monster-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  styles: `
    :host { font-family: sans-serif; display: block; }

    .dlg {
      display: flex; flex-direction: column;
      max-height: 82vh; width: min(860px, 96vw);
      background: #0b0a18; color: #d4c9a0; overflow: hidden;
    }

    .dlg-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px 12px; flex-shrink: 0;
      border-bottom: 1px solid rgba(200,160,60,.25);
      background: linear-gradient(180deg, rgba(28,18,4,.9) 0%, rgba(10,8,20,.9) 100%);
      gap: 12px;
    }
    .dlg-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 17px; letter-spacing: .1em; text-transform: uppercase;
      color: #e8c96a; text-shadow: 0 0 18px rgba(200,160,60,.5);
      flex: 1; min-width: 0;
    }
    .dlg-title mat-icon { font-size: 20px; width: 20px; height: 20px; color: #c8a03c; flex-shrink: 0; }
    .dlg-subtitle { font-size: 11px; letter-spacing: .05em; color: rgba(200,160,60,.45); text-transform: none; }
    .dlg-close {
      background: none; border: 1px solid rgba(200,160,60,.25); border-radius: 4px;
      color: rgba(200,160,60,.6); cursor: pointer; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center; padding: 0;
      transition: all .18s; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(200,160,60,.12); color: #e8c96a; border-color: rgba(200,160,60,.6); }
    }

    .dlg-body {
      flex: 1; overflow-y: auto; padding: 20px 24px 24px;
      scrollbar-width: thin; scrollbar-color: rgba(200,160,60,.25) transparent;
    }

    .dlg-loading, .dlg-empty {
      padding: 60px 24px; text-align: center;
      font-size: 13px; color: rgba(200,160,60,.3); font-style: italic;
      mat-icon { display: block; font-size: 38px; width: 38px; height: 38px; margin: 0 auto 14px; color: rgba(200,160,60,.18); }
    }

    /* ── Monster card styles (rendered via [innerHTML]) ── */
    :host ::ng-deep .monster-card {
      background: linear-gradient(180deg, rgba(40,8,6,.95) 0%, rgba(28,5,4,.97) 100%);
      border: 1px solid rgba(180,60,30,.4);
      border-radius: 6px; overflow: hidden; font-size: 13px;
    }
    :host ::ng-deep .mc-head {
      background: linear-gradient(180deg, rgba(120,20,12,.98), rgba(80,12,8,.99));
      padding: 12px 16px 10px;
      border-bottom: 2px solid rgba(180,60,30,.5);
    }
    :host ::ng-deep .mc-name {
      font-size: 20px; font-weight: 700; color: #f0d08a; letter-spacing: .06em;
    }
    :host ::ng-deep .mc-type { font-size: 11px; color: rgba(230,160,80,.7); margin-top: 2px; font-style: italic; }
    :host ::ng-deep .mc-rule { height: 1px; background: linear-gradient(90deg,transparent,rgba(180,60,30,.45),transparent); margin: 0; }
    :host ::ng-deep .mc-basics, :host ::ng-deep .mc-details {
      padding: 8px 16px; display: flex; flex-direction: column; gap: 3px;
    }
    :host ::ng-deep .mc-row {
      display: flex; gap: 6px; font-size: 12px; color: rgba(210,185,145,.8);
    }
    :host ::ng-deep .mc-label {
      color: rgba(180,60,30,.85); font-weight: 600; min-width: 130px; flex-shrink: 0;
    }
    :host ::ng-deep .mc-abilities {
      display: flex; justify-content: space-around; padding: 10px 16px; gap: 8px;
      background: rgba(180,60,30,.07);
    }
    :host ::ng-deep .mc-ab { text-align: center; }
    :host ::ng-deep .mc-ab-name { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: rgba(180,60,30,.8); font-weight: 700; }
    :host ::ng-deep .mc-ab-val { font-size: 13px; color: #d4c9a0; margin-top: 2px; }
    :host ::ng-deep .mc-body {
      padding: 12px 16px 14px; color: rgba(210,185,145,.85); font-size: 12.5px; line-height: 1.6;
    }
    :host ::ng-deep .mc-body h6 { color: #c8603c; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; margin: 12px 0 4px; border-bottom: 1px solid rgba(180,60,30,.3); padding-bottom: 3px; }
    :host ::ng-deep .mc-body strong { color: #e0c080; }
    :host ::ng-deep .mc-body em { color: rgba(210,180,120,.7); }
    :host ::ng-deep .mc-body p { margin: 6px 0; }

    /* prose surrounding monster card */
    :host ::ng-deep h1, :host ::ng-deep h2, :host ::ng-deep h3 {
      color: #c8903c; letter-spacing: .06em; margin-top: 18px; margin-bottom: 6px;
    }
    :host ::ng-deep p { line-height: 1.65; margin: 8px 0; color: rgba(210,190,150,.75); font-size: 13px; }
    :host ::ng-deep ul, :host ::ng-deep ol { padding-left: 18px; color: rgba(210,190,150,.75); font-size: 13px; }
    :host ::ng-deep blockquote { border-left: 3px solid rgba(180,60,30,.45); padding: 4px 12px; margin: 10px 0; color: rgba(200,170,120,.6); font-style: italic; }
    :host ::ng-deep .heading-anchor { display: none; }
  `,
  template: `
    <div class="dlg">
      <div class="dlg-header">
        <div class="dlg-title">
          <mat-icon>pets</mat-icon>
          <span>
            {{ monsterName }}
            @if (monsterSubtitle()) {
              <div class="dlg-subtitle">{{ monsterSubtitle() }}</div>
            }
          </span>
        </div>
        <button type="button" class="dlg-close" (click)="close()" aria-label="Zavřít">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dlg-body">
        @if (!contentHtml()) {
          <div class="dlg-loading"><mat-icon>hourglass_empty</mat-icon>Načítám…</div>
        } @else if (contentHtml() === 'error') {
          <div class="dlg-empty"><mat-icon>search_off</mat-icon>Obsah netvora nenalezen.</div>
        } @else {
          <div [innerHTML]="safeHtml()"></div>
        }
      </div>
    </div>
  `,
})
export class MonsterDetailDialogComponent {
  readonly data: MonsterDetailDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MonsterDetailDialogComponent>);
  private readonly monstersService = inject(JadMonstersService);
  private readonly wiki = inject(WikiService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly monsterName = this.data.monsterName;

  private readonly _monster = this.monstersService.findMonsterByName(this.monsterName);

  readonly monsterSubtitle = signal(
    this._monster ? `${this._monster.size} ${this._monster.type}`.trim() : '',
  );

  private readonly _content = toSignal(
    this._monster
      ? this.wiki.loadChapter(this._monster.book, this._monster.file).pipe(
          catchError(() => of('error')),
        )
      : of('error'),
    { initialValue: '' },
  );

  readonly contentHtml = this._content;

  readonly safeHtml = toSignal(
    toObservable(this._content).pipe(
      switchMap(html =>
        html && html !== 'error'
          ? of(this.sanitizer.bypassSecurityTrustHtml(html))
          : of(null as SafeHtml | null),
      ),
    ),
    { initialValue: null as SafeHtml | null },
  );

  close(): void {
    this.dialogRef.close();
  }
}

