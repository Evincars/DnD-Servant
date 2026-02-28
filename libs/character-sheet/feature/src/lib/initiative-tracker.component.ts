import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@dn-d-servant/util';
import { Dnd5eApiService, Monster } from '@dn-d-servant/data-access';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

interface InitiativeRow {
  initiative: number | null;
  name: string;
  ac: number | null;
  hp: number | null;
}

const STORAGE_KEY = 'initiative-tracker';

@Component({
  selector: 'initiative-tracker',
  template: `
    <div class="it-wrapper">
      <div class="it-layout">
        <!-- ── Initiative table card ────────────────────────────── -->
        <div class="it-card">
          <div class="it-header">
            <mat-icon class="it-header__icon">shield</mat-icon>
            <h2 class="it-header__title">Sledování iniciativy</h2>
          </div>
          <p class="it-notice">Data se ukládají pouze v tomto prohlížeči — na jiném zařízení budou řádky prázdné.</p>

          <div class="it-col-headers">
            <span class="it-col-header it-col-header--indicator"></span>
            <span class="it-col-header it-col-header--sm">⚔ Init.</span>
            <span class="it-col-header it-col-header--name">👤 Jméno</span>
            <span class="it-col-header it-col-header--sm">🛡 OČ</span>
            <span class="it-col-header it-col-header--sm">❤ HP</span>
            <span class="it-col-header it-col-header--icon"></span>
            <span class="it-col-header it-col-header--icon"></span>
          </div>

          <div class="it-rows">
            @for (row of rows(); track $index) {
            <div
              class="it-row"
              [class.it-row--odd]="$index % 2 === 1"
              [class.it-row--active]="$index === activeIndex()"
              [class.it-row--selected]="selectedRowIndex() === $index"
            >
              <span class="it-turn-indicator">{{ $index === activeIndex() ? '▶' : '' }}</span>
              <input [(ngModel)]="row.initiative" type="number" class="it-input it-input--sm" placeholder="—" />
              <input [(ngModel)]="row.name" type="text" class="it-input it-input--name" placeholder="Název / jméno" />
              <input [(ngModel)]="row.ac" type="number" class="it-input it-input--sm" placeholder="—" />
              <input [(ngModel)]="row.hp" type="number" class="it-input it-input--sm" placeholder="—" />
              <button
                mat-icon-button
                type="button"
                class="it-lookup-btn"
                [class.it-lookup-btn--active]="selectedRowIndex() === $index"
                [class.it-lookup-btn--loading]="loadingIndex() === $index"
                title="Vyhledat příšeru"
                (click)="lookupMonster(row.name, $index)"
              >
                <mat-icon>{{ loadingIndex() === $index ? 'hourglass_empty' : 'search' }}</mat-icon>
              </button>
              <button mat-icon-button type="button" class="it-remove-btn" title="Odstranit řádek" (click)="removeRow($index)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            }
          </div>

          <div class="it-actions">
            <button type="button" class="it-btn it-btn--add" (click)="addRow()">
              <mat-icon>add</mat-icon>
              Přidat
            </button>
            <button type="button" class="it-btn it-btn--next" (click)="nextRow()">
              <mat-icon>arrow_downward</mat-icon>
              Další tah
            </button>
            <button type="button" class="it-btn it-btn--sort" (click)="sortRows()">
              <mat-icon>sort</mat-icon>
              Seřadit
            </button>
            <button type="button" class="it-btn it-btn--save" (click)="save()">
              <mat-icon>save</mat-icon>
              Uložit
            </button>
          </div>

          @if (savedMessage()) {
          <p class="it-saved-msg">✓ Uloženo do prohlížeče</p>
          }
        </div>

        <!-- ── Monster detail card ───────────────────────────────── -->
        @if (monsterData() || monsterError() || loadingIndex() !== null) {
        <div class="m-card">
          <button class="m-close" (click)="closeMonster()" title="Zavřít">✕</button>

          @if (loadingIndex() !== null && !monsterData() && !monsterError()) {
          <div class="m-loading">
            <mat-icon class="m-loading__icon">hourglass_empty</mat-icon>
            <span>Načítám příšeru…</span>
          </div>
          } @if (monsterError()) {
          <div class="m-error">⚠ {{ monsterError() }}</div>
          } @if (monsterData(); as m) {
          <!-- Name & meta -->
          <div class="m-name">{{ m.name }}</div>
          <div class="m-meta">
            {{ m.size }} {{ m.type }} @if (m.subtype) { ({{ m.subtype }}) } @if (m.alignment) {· {{ m.alignment }}}
          </div>

          <div class="m-rule"></div>

          <!-- Core stats line -->
          <div class="m-stat-row">
            @if (m.armor_class?.length) {
            <div class="m-stat-pill">
              <span class="m-stat-pill__label">OČ</span>
              <span class="m-stat-pill__val">
                {{ m.armor_class[0].value }}@if(m.armor_class[0].type){
                <small>({{ m.armor_class[0].type }})</small>
                }
              </span>
            </div>
            } @if (m.hit_points) {
            <div class="m-stat-pill">
              <span class="m-stat-pill__label">ŽB</span>
              <span class="m-stat-pill__val">
                {{ m.hit_points }}@if(m.hit_dice){
                <small>({{ m.hit_dice }})</small>
                }
              </span>
            </div>
            } @if (m.challenge_rating != null) {
            <div class="m-stat-pill">
              <span class="m-stat-pill__label">CR</span>
              <span class="m-stat-pill__val">{{ m.challenge_rating }}</span>
            </div>
            } @if (m.xp) {
            <div class="m-stat-pill">
              <span class="m-stat-pill__label">XP</span>
              <span class="m-stat-pill__val">{{ m.xp }}</span>
            </div>
            } @if (m.proficiency_bonus) {
            <div class="m-stat-pill">
              <span class="m-stat-pill__label">Zdatnost</span>
              <span class="m-stat-pill__val">+{{ m.proficiency_bonus }}</span>
            </div>
            }
          </div>

          <!-- Speed -->
          @if (m.speed && hasSpeed(m)) {
          <div class="m-line">
            <b>Pohyb:</b>
            @if (m.speed.walk) {
            <span>chůze {{ m.speed.walk }}</span>
            } @if (m.speed.swim) {
            <span>plavání {{ m.speed.swim }}</span>
            } @if (m.speed.fly) {
            <span>let {{ m.speed.fly }}</span>
            } @if (m.speed.burrow) {
            <span>hrabání {{ m.speed.burrow }}</span>
            } @if (m.speed.climb) {
            <span>šplhání {{ m.speed.climb }}</span>
            }
          </div>
          }

          <div class="m-rule"></div>

          <!-- Ability scores -->
          <div class="m-abilities">
            <div class="m-ab">
              <div class="m-ab__lbl">SIL</div>
              <div class="m-ab__val">{{ m.strength }}</div>
              <div class="m-ab__mod">{{ mod(m.strength) }}</div>
            </div>
            <div class="m-ab">
              <div class="m-ab__lbl">OBR</div>
              <div class="m-ab__val">{{ m.dexterity }}</div>
              <div class="m-ab__mod">{{ mod(m.dexterity) }}</div>
            </div>
            <div class="m-ab">
              <div class="m-ab__lbl">ODL</div>
              <div class="m-ab__val">{{ m.constitution }}</div>
              <div class="m-ab__mod">{{ mod(m.constitution) }}</div>
            </div>
            <div class="m-ab">
              <div class="m-ab__lbl">INT</div>
              <div class="m-ab__val">{{ m.intelligence }}</div>
              <div class="m-ab__mod">{{ mod(m.intelligence) }}</div>
            </div>
            <div class="m-ab">
              <div class="m-ab__lbl">MDR</div>
              <div class="m-ab__val">{{ m.wisdom }}</div>
              <div class="m-ab__mod">{{ mod(m.wisdom) }}</div>
            </div>
            <div class="m-ab">
              <div class="m-ab__lbl">CHA</div>
              <div class="m-ab__val">{{ m.charisma }}</div>
              <div class="m-ab__mod">{{ mod(m.charisma) }}</div>
            </div>
          </div>

          <div class="m-rule"></div>

          <!-- Properties -->
          @if (m.proficiencies?.length) {
          <div class="m-prop">
            <b>Zdatnosti:</b>
            {{ profList(m) }}
          </div>
          } @if (m.damage_vulnerabilities?.length) {
          <div class="m-prop">
            <b>Zranitelnosti:</b>
            {{ m.damage_vulnerabilities.join(', ') }}
          </div>
          } @if (m.damage_resistances?.length) {
          <div class="m-prop">
            <b>Odolnosti:</b>
            {{ m.damage_resistances.join(', ') }}
          </div>
          } @if (m.damage_immunities?.length) {
          <div class="m-prop">
            <b>Imunity (poškození):</b>
            {{ m.damage_immunities.join(', ') }}
          </div>
          } @if (m.condition_immunities?.length) {
          <div class="m-prop">
            <b>Imunity (stavy):</b>
            {{ conditionNames(m) }}
          </div>
          } @if (m.senses) {
          <div class="m-prop">
            <b>Smysly:</b>
            {{ sensesText(m) }}
          </div>
          } @if (m.languages) {
          <div class="m-prop">
            <b>Jazyky:</b>
            {{ m.languages }}
          </div>
          }

          <!-- Special abilities -->
          @if (m.special_abilities?.length) {
          <div class="m-rule"></div>
          <div class="m-section">Speciální schopnosti</div>
          @for (a of m.special_abilities; track a.name) {
          <p class="m-ability">
            <b class="m-ability__name">{{ a.name }}.</b>
            {{ a.desc }}
          </p>
          } }

          <!-- Actions -->
          @if (m.actions?.length) {
          <div class="m-rule"></div>
          <div class="m-section">Akce</div>
          @for (a of m.actions; track a.name) {
          <p class="m-ability">
            <b class="m-ability__name">{{ a.name }}.</b>
            {{ a.desc }} @if (a.attack_bonus != null) {
            <span class="m-tag">+{{ a.attack_bonus }} k zásahu</span>
            } @if (a.dc) {
            <span class="m-tag">SO {{ a.dc.dc_value }} {{ a.dc.dc_type.name }}</span>
            }
          </p>
          } }

          <!-- Legendary actions -->
          @if (m.legendary_actions?.length) {
          <div class="m-rule"></div>
          <div class="m-section">Legendární akce</div>
          @for (a of m.legendary_actions; track a.name) {
          <p class="m-ability">
            <b class="m-ability__name">{{ a.name }}.</b>
            {{ a.desc }}
          </p>
          } }

          <!-- Reactions -->
          @if (m.reactions?.length) {
          <div class="m-rule"></div>
          <div class="m-section">Reakce</div>
          @for (a of m.reactions; track a.name) {
          <p class="m-ability">
            <b class="m-ability__name">{{ a.name }}.</b>
            {{ a.desc }}
          </p>
          } } @if (m.image) {
          <div class="m-rule"></div>
          <img class="m-image" [src]="'https://www.dnd5eapi.co' + m.image" [alt]="m.name" />
          } }
        </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }

    .it-wrapper {
      height: 100%;
      overflow-y: auto;
      padding: 32px 24px;
      background:
        linear-gradient(rgba(10,10,20,.78), rgba(10,10,20,.78)),
        url('https://www.transparenttextures.com/patterns/dark-leather.png');
      background-color: #12111a;
      box-sizing: border-box;
    }

    /* side-by-side layout when monster card is open */
    .it-layout {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }

    /* ── Initiative card ─────────────────────────────────────────── */
    .it-card {
      flex: 0 0 auto;
      width: 720px;
      max-width: 100%;
      background: rgba(25,22,38,.92);
      border: 1px solid rgba(200,160,60,.35);
      border-radius: 10px;
      padding: 28px 28px 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,220,100,.08);
    }

    .it-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .it-header__icon  { color: #c8a03c; font-size: 28px; width: 28px; height: 28px; }
    .it-header__title { margin: 0; font-size: 22px; font-weight: 700; color: #e8d5a0; letter-spacing: .04em; text-shadow: 0 1px 8px rgba(200,160,60,.4); }
    .it-notice        { margin: 0 0 20px; font-size: 11px; color: #6b6580; }

    .it-col-headers { display: flex; align-items: center; gap: 8px; padding: 0 0 6px; border-bottom: 1px solid rgba(200,160,60,.25); margin-bottom: 6px; }
    .it-col-header  { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #c8a03c; user-select: none; }
    .it-col-header--indicator { width: 14px; flex-shrink: 0; }
    .it-col-header--sm   { width: 70px; text-align: center; flex-shrink: 0; }
    .it-col-header--name { flex: 1; padding-left: 4px; }
    .it-col-header--icon { width: 32px; flex-shrink: 0; }

    .it-rows { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }

    .it-row {
      display: flex; align-items: center; gap: 8px; padding: 4px 6px;
      border-radius: 5px; background: rgba(255,255,255,.03);
      border: 1px solid transparent; transition: background .15s;
    }
    .it-row--odd     { background: rgba(255,255,255,.055); }
    .it-row--active  { background: rgba(200,160,60,.15) !important; border-color: rgba(200,160,60,.5); box-shadow: 0 0 10px rgba(200,160,60,.15); }
    .it-row--selected { outline: 1px solid rgba(120,170,232,.5); }
    .it-row:hover    { background: rgba(200,160,60,.07); }

    .it-turn-indicator { width: 14px; flex-shrink: 0; color: #c8a03c; font-size: 12px; text-align: center; }

    .it-input {
      padding: 7px 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 5px;
      font-size: 14px; background: rgba(0,0,0,.35); color: #e8e0d0; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .it-input::placeholder { color: #4a4560; }
    .it-input:focus { border-color: #c8a03c; box-shadow: 0 0 0 2px rgba(200,160,60,.2); }
    .it-input--sm   { width: 70px; text-align: center; flex-shrink: 0; }
    .it-input--name { flex: 1; }
    .it-input[type=number]::-webkit-inner-spin-button,
    .it-input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
    .it-input[type=number] { -moz-appearance: textfield; }

    .it-lookup-btn {
      width: 32px !important; height: 32px !important; flex-shrink: 0;
      color: #7a6fa0 !important; transition: color .15s, transform .15s !important;
    }
    .it-lookup-btn:hover          { color: #c8a03c !important; }
    .it-lookup-btn--active        { color: #78aae8 !important; }
    .it-lookup-btn--loading       { color: #c8a03c !important; animation: it-spin 1s linear infinite; }
    @keyframes it-spin { to { transform: rotate(360deg); } }

    .it-remove-btn { width: 32px !important; height: 32px !important; flex-shrink: 0; color: #6b6580 !important; transition: color .15s !important; }
    .it-remove-btn:hover { color: #e05555 !important; }

    .it-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .it-btn {
      display: inline-flex; align-items: center; gap: 5px; padding: 8px 18px;
      border: 1px solid transparent; border-radius: 5px; cursor: pointer;
      font-size: 13px; font-weight: 600; letter-spacing: .03em;
      transition: filter .15s, transform .1s;
    }
    .it-btn:active { transform: scale(.97); }
    .it-btn--add  { background: #2a2540; border-color: rgba(200,160,60,.3); color: #c8a03c; }
    .it-btn--next { background: #2a1a10; border-color: rgba(220,120,40,.4);  color: #e08840; }
    .it-btn--sort { background: #152040; border-color: rgba(60,120,200,.4);  color: #78aae8; }
    .it-btn--save { background: #0f2a18; border-color: rgba(60,180,90,.4);   color: #6ecf8a; }
    .it-btn--add:hover, .it-btn--next:hover, .it-btn--sort:hover, .it-btn--save:hover { filter: brightness(1.3); }
    .it-saved-msg { margin: 14px 0 0; font-size: 13px; color: #6ecf8a; letter-spacing: .02em; }

    /* ══ Monster card ════════════════════════════════════════════════ */
    .m-card {
      flex: 1 1 360px;
      min-width: 320px;
      max-width: 480px;
      position: relative;
      background: rgba(18,14,30,.97);
      border: 1px solid rgba(160,100,30,.55);
      border-radius: 10px;
      padding: 22px 20px 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,200,80,.06);
      color: #d4c9b8;
      font-size: 13px;
      line-height: 1.6;
    }

    .m-close {
      position: absolute; top: 10px; right: 12px;
      background: none; border: none; cursor: pointer;
      color: #6b6580; font-size: 15px; transition: color .15s; padding: 2px 6px;
    }
    .m-close:hover { color: #e05555; }

    .m-loading { display: flex; align-items: center; gap: 8px; color: #c8a03c; }
    .m-loading__icon { animation: it-spin 1s linear infinite; }
    .m-error { color: #e07070; font-style: italic; }

    .m-name {
      font-size: 20px; font-weight: 700; color: #e8c96a;
      letter-spacing: .04em; text-shadow: 0 1px 8px rgba(200,150,40,.4);
      padding-right: 28px; margin-bottom: 2px;
    }
    .m-meta { font-style: italic; color: #9a8fa0; font-size: 12px; margin-bottom: 10px; }

    .m-rule {
      height: 1px;
      background: linear-gradient(90deg, rgba(160,100,30,.7) 0%, rgba(160,100,30,.1) 100%);
      margin: 10px 0;
    }

    /* stat pills row */
    .m-stat-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .m-stat-pill {
      display: flex; flex-direction: column; align-items: center;
      background: rgba(200,160,60,.1); border: 1px solid rgba(200,160,60,.25);
      border-radius: 6px; padding: 5px 10px; min-width: 52px;
    }
    .m-stat-pill__label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #c8a03c; }
    .m-stat-pill__val   { font-size: 15px; font-weight: 600; color: #e8e0d0; }

    /* speed line */
    .m-line { margin: 4px 0; display: flex; flex-wrap: wrap; gap: 4px; }
    .m-line b { color: #c8a03c; margin-right: 4px; }
    .m-line span::after { content: ','; margin-right: 3px; }
    .m-line span:last-child::after { content: ''; }

    /* ability score grid */
    .m-abilities { display: flex; gap: 6px; margin: 6px 0; }
    .m-ab {
      flex: 1; text-align: center;
      background: rgba(200,160,60,.07); border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px; padding: 5px 2px;
    }
    .m-ab__lbl { font-size: 10px; font-weight: 700; color: #c8a03c; letter-spacing: .05em; }
    .m-ab__val { font-size: 15px; font-weight: 600; color: #e8e0d0; }
    .m-ab__mod { font-size: 11px; color: #9a8fa0; }

    /* properties */
    .m-prop { margin: 3px 0; }
    .m-prop b { color: #c8a03c; margin-right: 4px; }

    /* section heading */
    .m-section {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: #c8a03c; margin: 6px 0 4px;
    }

    /* ability blocks */
    .m-ability { margin: 5px 0; }
    .m-ability__name { font-style: italic; color: #e8d5a0; }

    .m-tag {
      display: inline-block; margin-left: 5px; padding: 1px 7px;
      background: rgba(200,160,60,.12); border: 1px solid rgba(200,160,60,.3);
      border-radius: 10px; font-size: 11px; color: #c8a03c; vertical-align: middle;
    }

    .m-image {
      display: block; max-width: 100%; border-radius: 6px; margin-top: 8px;
      border: 1px solid rgba(200,160,60,.25);
      box-shadow: 0 4px 16px rgba(0,0,0,.5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dnd5eApi = inject(Dnd5eApiService);

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
  savedMessage = signal(false);
  loadingIndex = signal<number | null>(null);
  selectedRowIndex = signal<number | null>(null);
  monsterData = signal<Monster | null>(null);
  monsterError = signal<string | null>(null);

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    return saved ?? [this._emptyRow()];
  }

  private _emptyRow(): InitiativeRow {
    return { initiative: null, name: '', ac: null, hp: null };
  }

  addRow() {
    this.rows.update(r => [...r, this._emptyRow()]);
  }

  removeRow(index: number) {
    this.rows.update(r => r.filter((_, i) => i !== index));
    this.activeIndex.update(i => Math.min(i, Math.max(0, this.rows().length - 1)));
    if (this.selectedRowIndex() === index) this.closeMonster();
  }

  nextRow() {
    const len = this.rows().length;
    if (len === 0) return;
    this.activeIndex.update(i => (i + 1) % len);
  }

  sortRows() {
    this.rows.update(r => [...r].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    this.activeIndex.set(0);
  }

  save() {
    this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2000);
  }

  lookupMonster(name: string, rowIndex: number) {
    // toggle off
    if (this.selectedRowIndex() === rowIndex) {
      this.closeMonster();
      return;
    }

    const index = (name ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!index) return;

    this.selectedRowIndex.set(rowIndex);
    this.loadingIndex.set(rowIndex);
    this.monsterData.set(null);
    this.monsterError.set(null);

    this.dnd5eApi.getMonster(index).subscribe({
      next: m => {
        this.monsterData.set(m);
        this.loadingIndex.set(null);
      },
      error: () => {
        this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena.`);
        this.loadingIndex.set(null);
      },
    });
  }

  closeMonster() {
    this.selectedRowIndex.set(null);
    this.loadingIndex.set(null);
    this.monsterData.set(null);
    this.monsterError.set(null);
  }

  mod(score: number): string {
    const m = Math.floor((score - 10) / 2);
    return m >= 0 ? `+${m}` : `${m}`;
  }

  hasSpeed(m: Monster): boolean {
    const s = m.speed;
    return !!(s.walk || s.swim || s.fly || s.burrow || s.climb);
  }

  profList(m: Monster): string {
    return (m.proficiencies ?? []).map(p => `${p.proficiency.name} +${p.value}`).join(', ');
  }

  conditionNames(m: Monster): string {
    return (m.condition_immunities ?? []).map(c => c.name).join(', ');
  }

  sensesText(m: Monster): string {
    const s = m.senses;
    const parts: string[] = [];
    if (s.darkvision) parts.push(`Vidění ve tmě ${s.darkvision}`);
    if (s.blindsight) parts.push(`Slepecký smysl ${s.blindsight}`);
    if (s.tremorsense) parts.push(`Třasový smysl ${s.tremorsense}`);
    if (s.truesight) parts.push(`Pravdivý zrak ${s.truesight}`);
    parts.push(`Pasivní vnímání ${s.passive_perception}`);
    return parts.join(', ');
  }
}
