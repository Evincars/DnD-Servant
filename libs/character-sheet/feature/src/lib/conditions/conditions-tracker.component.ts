import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MAT_TOOLTIP_SCROLL_STRATEGY, MatTooltip } from '@angular/material/tooltip';
import { Overlay } from '@angular/cdk/overlay';

export interface ConditionDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  glow: string;
  description: string;
}

export const CONDITIONS: ConditionDef[] = [
  { id: 'concentration', name: 'Soustředění',  icon: 'psychology',                    color: '#d4a830', glow: 'rgba(212,168,48,.6)',  description: 'Soustředění na kouzlo. Záchranný hod na Odolnost (DC 10 nebo ½ zásahu) při každém zásahu.' },
  { id: 'blinded',       name: 'Oslepení',     icon: 'visibility_off',                color: '#c0b060', glow: 'rgba(192,176,96,.55)', description: 'Nemůže vidět. Útočné hody mají výhodu pro protivníky a nevýhodu pro tebe.' },
  { id: 'charmed',       name: 'Okouzlení',    icon: 'favorite',                      color: '#e060c0', glow: 'rgba(224,96,192,.55)', description: 'Nemůže útočit na původce okouzlení. Původce má výhodu na sociální hody vůči tobě.' },
  { id: 'deafened',      name: 'Ohlušení',     icon: 'hearing_disabled',              color: '#909090', glow: 'rgba(144,144,144,.5)', description: 'Neslyší. Automaticky neúspěšné záchranné hody na Vnímání (sluch).' },
  { id: 'frightened',    name: 'Vystrašení',   icon: 'sentiment_very_dissatisfied',   color: '#c05030', glow: 'rgba(192,80,48,.55)',  description: 'Nevýhoda na hody vlastností a útočné hody, pokud je zdroj strachu v dohledu. Nemůže se přiblížit ke zdroji.' },
  { id: 'grappled',      name: 'Uchvácení',    icon: 'pan_tool',                      color: '#c08030', glow: 'rgba(192,128,48,.5)',  description: 'Rychlost snížena na 0. Stav skončí, pokud je uchvatitel neschopný nebo byl odtažen.' },
  { id: 'incapacitated', name: 'Neschopnost',  icon: 'block',                         color: '#c04040', glow: 'rgba(192,64,64,.55)',  description: 'Nemůže provádět akce ani reakce.' },
  { id: 'invisible',     name: 'Neviditelnost',icon: 'no_photography',                color: '#50b8d8', glow: 'rgba(80,184,216,.5)',  description: 'Nezjistitelný bez magie nebo speciálních smyslů. Tvé útoky mají výhodu, útoky na tebe nevýhodu.' },
  { id: 'paralyzed',     name: 'Paralýza',     icon: 'accessibility_new',             color: '#d03030', glow: 'rgba(208,48,48,.65)',  description: 'Neschopný a nehybný. Automatické kritické zásahy z 1,5 m. Neúspěšné záchranné hody Síly a Obratnosti.' },
  { id: 'petrified',     name: 'Zkamenění',    icon: 'landscape',                     color: '#88a888', glow: 'rgba(136,168,136,.5)', description: 'Proměněn v pevnou neživou látku. Odolnost vůči všem škodám. Výhoda pro útočníky.' },
  { id: 'poisoned',      name: 'Otrávení',     icon: 'science',                       color: '#60b030', glow: 'rgba(96,176,48,.55)',  description: 'Nevýhoda na útočné hody a hody na vlastnosti.' },
  { id: 'prone',         name: 'Ležení',       icon: 'airline_seat_flat',             color: '#a07828', glow: 'rgba(160,120,40,.5)',  description: 'Pohyb pouze plazením (cena ×2). Nevýhoda na útoky. Vzdálené útoky na tebe mají nevýhodu, zblízka výhodu.' },
  { id: 'restrained',    name: 'Pouta',        icon: 'lock',                          color: '#c06020', glow: 'rgba(192,96,32,.55)',  description: 'Rychlost snížena na 0. Nevýhoda na útočné hody a záchranné hody na Obratnost. Útočníci mají výhodu.' },
  { id: 'stunned',       name: 'Omráčení',     icon: 'self_improvement',              color: '#9840c0', glow: 'rgba(152,64,192,.55)', description: 'Neschopný. Nemůže se pohybovat. Mluví zmateně. Neúspěšné záchranné hody Síly a Obratnosti. Výhoda pro útočníky.' },
  { id: 'unconscious',   name: 'Bezvědomí',    icon: 'bedtime',                       color: '#4060a8', glow: 'rgba(64,96,168,.55)',  description: 'Neschopný a nehybný. Padá na zem. Automatické kritické zásahy z 1,5 m.' },
  { id: 'hasted',        name: 'Chvat',        icon: 'bolt',                          color: '#28b0e0', glow: 'rgba(40,176,224,.55)', description: 'Rychlost ×2. +2 AC. Výhoda na záchranné hody Obratnosti. Navíc jedna akce za kolo (útok, sprint, přerušení, únik nebo schování).' },
  { id: 'blessed',       name: 'Požehnání',    icon: 'auto_awesome',                  color: '#e0c030', glow: 'rgba(224,192,48,.55)', description: 'Přidej 1k4 ke všem útočným hodům a záchranným hodům.' },
  { id: 'raging',        name: 'Zuřivost',     icon: 'local_fire_department',         color: '#e04818', glow: 'rgba(224,72,24,.65)',  description: 'Výhoda na hody Síly a záchranné hody Síly. Odolnost vůči bodné, sečné a drtivé zbrani.' },
];

export const EXHAUSTION_EFFECTS = [
  'Žádné vyčerpání',
  'Nevýhoda na hody dovedností',
  'Rychlost snížena na polovinu',
  'Nevýhoda na útočné hody a záchranné hody',
  'Maximum životů sníženo na polovinu',
  'Rychlost snížena na 0',
  'Smrt',
];

export const LS_KEY = 'player-conditions-v1';

@Component({
  selector: 'conditions-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  providers: [
    {
      provide: MAT_TOOLTIP_SCROLL_STRATEGY,
      deps: [Overlay],
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.reposition(),
    },
  ],
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      padding: 24px 32px 40px;
      box-sizing: border-box;
      font-family: 'Mikadan', sans-serif;
    }

    /* ── Header ─────────────────────────────────── */
    .ct-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 24px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(160,80,200,.6) 20%, rgba(200,120,240,.8) 50%, rgba(160,80,200,.6) 80%, transparent) 1;
    }
    .ct-title {
      font-size: 22px; letter-spacing: .12em; text-transform: uppercase;
      color: #c890e8; text-shadow: 0 0 18px rgba(160,80,200,.4), 0 0 4px rgba(160,80,200,.2);
      display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #a060c0; }
    }
    .ct-subtitle { font-size: 11px; color: rgba(160,80,200,.4); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }

    .ct-header-right { display: flex; align-items: center; gap: 12px; }

    .ct-active-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(200,50,50,.12); border: 1px solid rgba(200,50,50,.3);
      border-radius: 20px; padding: 4px 12px 4px 8px;
      font-family: sans-serif; font-size: 11px; color: rgba(220,100,80,.85);
      transition: opacity .2s;
      &--hidden { opacity: 0; pointer-events: none; }
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .ct-clear-btn {
      font-family: 'Mikadan', sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(255,255,255,.1); border-radius: 3px; background: transparent;
      color: rgba(255,255,255,.3); padding: 6px 14px; cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: rgba(180,50,50,.12); border-color: rgba(200,80,60,.3); color: rgba(220,100,80,.85); }
    }

    /* ── Conditions grid ─────────────────────────── */
    .ct-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 28px;
    }

    .ct-card {
      --cond-color: transparent;
      --cond-glow: transparent;
      position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; padding: 12px 8px 10px;
      background: linear-gradient(160deg, rgba(28,20,14,.96) 0%, rgba(18,12,8,.98) 100%);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 4px;
      cursor: pointer;
      transition: background .15s, border-color .15s, box-shadow .15s, transform .1s;
      font-family: 'Mikadan', sans-serif;
      outline: none;
      user-select: none;
      text-align: center;

      &:hover { background: rgba(255,255,255,.03); transform: translateY(-1px); }
      &:active { transform: translateY(0); }

      &--active {
        border-color: var(--cond-color) !important;
        box-shadow: 0 0 12px var(--cond-glow), inset 0 0 20px rgba(0,0,0,.3);
        background: linear-gradient(160deg, rgba(40,28,20,.97) 0%, rgba(24,16,10,.99) 100%) !important;
        transform: translateY(-2px);

        .ct-card__icon { color: var(--cond-color); text-shadow: 0 0 10px var(--cond-glow); }
        .ct-card__name { color: var(--cond-color); }
        .ct-card__active-dot { opacity: 1; }
      }
    }

    .ct-card__icon {
      font-size: 22px !important; width: 22px !important; height: 22px !important;
      color: rgba(255,255,255,.2);
      transition: color .15s, text-shadow .15s;
    }

    .ct-card__name {
      font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(255,255,255,.3); line-height: 1.2;
      transition: color .15s;
    }

    .ct-card__active-dot {
      position: absolute; top: 5px; right: 6px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--cond-color);
      box-shadow: 0 0 6px var(--cond-glow);
      opacity: 0;
      transition: opacity .2s;
    }

    /* ── Exhaustion section ──────────────────────── */
    .ct-section-label {
      font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(255,255,255,.22); margin-bottom: 10px;
      display: flex; align-items: center; gap: 6px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .ct-exhaustion-track {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;
    }

    .ct-exhaustion-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; width: 50px; padding: 8px 4px;
      background: linear-gradient(160deg, rgba(28,20,14,.96), rgba(18,12,8,.98));
      border: 1px solid rgba(255,255,255,.07); border-radius: 3px;
      cursor: pointer; font-family: 'Mikadan', sans-serif;
      transition: background .15s, border-color .15s, box-shadow .15s;
      outline: none;

      &--active {
        border-color: rgba(210,60,50,.7) !important;
        box-shadow: 0 0 10px rgba(200,50,40,.4);
      }

      &:hover { background: rgba(255,255,255,.03); }

      &__level {
        font-size: 14px; font-weight: 700; color: rgba(255,255,255,.25);
        line-height: 1;
        .ct-exhaustion-btn--active & { color: rgba(220,100,80,.9); }
      }
    }

    .ct-exhaustion-effect {
      margin-top: 6px; font-family: sans-serif; font-size: 11px;
      color: rgba(255,255,255,.3); font-style: italic; line-height: 1.4;
      min-height: 20px; transition: color .2s;
      &--active { color: rgba(220,100,80,.7); }
    }

    /* ── Hint row ────────────────────────────────── */
    .ct-hint {
      margin-top: 20px; font-family: sans-serif; font-size: 10px;
      color: rgba(255,255,255,.12); letter-spacing: .03em; font-style: italic;
    }
  `,
  template: `
    <div class="ct-header">
      <div>
        <div class="ct-title">
          <mat-icon>health_and_safety</mat-icon>
          Stavy &amp; Podmínky
        </div>
        <div class="ct-subtitle">Klikni na stav pro aktivaci — uloženo automaticky v prohlížeči</div>
      </div>
      <div class="ct-header-right">
        <span class="ct-active-badge" [class.ct-active-badge--hidden]="activeCount() === 0">
          <mat-icon>warning</mat-icon>
          {{ activeCount() }} aktivní{{ activeCount() === 1 ? '' : 'ch' }}
        </span>
        <button class="ct-clear-btn" type="button" (click)="clearAll()" matTooltip="Zrušit všechny aktivní stavy">
          <mat-icon>clear_all</mat-icon>
          Vymazat vše
        </button>
      </div>
    </div>

    <!-- Conditions grid -->
    <div class="ct-grid">
      @for (cond of conditions; track cond.id) {
        <button
          type="button"
          class="ct-card"
          [class.ct-card--active]="isActive(cond.id)"
          [style.--cond-color]="cond.color"
          [style.--cond-glow]="cond.glow"
          (click)="toggle(cond.id)"
          [matTooltip]="cond.description"
          matTooltipShowDelay="300"
        >
          <mat-icon class="ct-card__icon">{{ cond.icon }}</mat-icon>
          <span class="ct-card__name">{{ cond.name }}</span>
          <span class="ct-card__active-dot"></span>
        </button>
      }
    </div>

    <!-- Exhaustion -->
    <div class="ct-section-label">
      <mat-icon>battery_alert</mat-icon>
      Vyčerpání (úroveň {{ exhaustion() }}/6)
    </div>
    <div class="ct-exhaustion-track">
      @for (lvl of exhaustionLevels; track lvl) {
        <button
          type="button"
          class="ct-exhaustion-btn"
          [class.ct-exhaustion-btn--active]="exhaustion() >= lvl"
          (click)="setExhaustion(exhaustion() === lvl ? lvl - 1 : lvl)"
          [matTooltip]="exhaustionEffects[lvl]"
        >
          <span class="ct-exhaustion-btn__level">{{ lvl }}</span>
        </button>
      }
    </div>
    <div class="ct-exhaustion-effect" [class.ct-exhaustion-effect--active]="exhaustion() > 0">
      @if (exhaustion() > 0) {
        Efekt: {{ exhaustionEffects[exhaustion()] }}
      } @else {
        Žádné vyčerpání
      }
    </div>

    <div class="ct-hint">
      Klikni na podmínku pro aktivaci/deaktivaci. Hover zobrazí popis efektu. Stavy jsou ukládány v prohlížeči (localStorage).
    </div>
  `,
})
export class ConditionsTrackerComponent implements OnInit {
  readonly conditions = CONDITIONS;
  readonly exhaustionLevels = [1, 2, 3, 4, 5, 6];
  readonly exhaustionEffects = EXHAUSTION_EFFECTS;

  active = signal<Set<string>>(new Set());
  exhaustion = signal<number>(0);

  activeCount = computed(() => this.active().size + (this.exhaustion() > 0 ? 1 : 0));

  ngOnInit(): void {
    this._load();
  }

  toggle(id: string): void {
    this.active.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    this._save();
  }

  isActive(id: string): boolean {
    return this.active().has(id);
  }

  setExhaustion(level: number): void {
    this.exhaustion.set(Math.max(0, Math.min(6, level)));
    this._save();
  }

  clearAll(): void {
    this.active.set(new Set());
    this.exhaustion.set(0);
    this._save();
  }

  private _load(): void {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.active.set(new Set(d.active ?? []));
        this.exhaustion.set(d.exhaustion ?? 0);
      }
    } catch { /* ignore */ }
  }

  private _save(): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        active: Array.from(this.active()),
        exhaustion: this.exhaustion(),
      }));
    } catch { /* ignore */ }
  }
}

