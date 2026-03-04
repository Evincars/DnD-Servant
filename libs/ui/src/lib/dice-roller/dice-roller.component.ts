import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, signal, computed } from '@angular/core';
import { DiceRollerService } from './dice-roller.service';

export type DiceType = 'k4' | 'k6' | 'k8' | 'k10' | 'k12' | 'k20';

interface QueuedDie {
  id: number;
  type: DiceType;
  count: number;
}
interface RollResult {
  id: number;
  dice: DiceType;
  value: number;
  modifier?: number;
  label?: string;
}
interface AnimDie {
  id: number;
  dice: DiceType;
  rolling: boolean;
  display: number;
  final: number;
  modifier?: number;
  label?: string;
}

@Component({
  selector: 'dice-roller',
  templateUrl: './dice-roller.component.html',
  styleUrl: './dice-roller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class DiceRollerComponent implements OnDestroy {
  private readonly diceRollerService = inject(DiceRollerService);

  readonly diceTypes: DiceType[] = ['k4', 'k6', 'k8', 'k10', 'k12', 'k20'];

  isOpen = signal(false);
  isRolling = signal(false);
  animDice = signal<AnimDie[]>([]);
  results = signal<RollResult[]>([]);
  queue = signal<QueuedDie[]>([]);
  totalSum = signal<number | null>(null);
  historyLog = signal<string[]>([]);

  totalQueued = computed(() => this.queue().reduce((a, d) => a + d.count, 0));

  private nextId = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];

  constructor() {
    // Watch for external d20+modifier roll requests from character sheet
    effect(() => {
      const req = this.diceRollerService.pendingRoll();
      if (!req) return;
      this.diceRollerService.pendingRoll.set(null); // consume
      this.isOpen.set(true);
      this._quickRollWithModifier('k20', req.modifier, req.label);
    });
  }

  togglePanel(): void {
    this.isOpen.update(v => !v);
  }

  // ── Queue ──────────────────────────────────────────────────────────────────
  addDie(type: DiceType): void {
    this.queue.update(q => {
      const existing = q.find(d => d.type === type);
      if (existing) return q.map(d => (d.type === type ? { ...d, count: d.count + 1 } : d));
      return [...q, { id: this.nextId++, type, count: 1 }];
    });
  }

  removeDie(type: DiceType): void {
    this.queue.update(q => {
      const existing = q.find(d => d.type === type);
      if (!existing) return q;
      if (existing.count === 1) return q.filter(d => d.type !== type);
      return q.map(d => (d.type === type ? { ...d, count: d.count - 1 } : d));
    });
  }

  countInQueue(type: DiceType): number {
    return this.queue().find(d => d.type === type)?.count ?? 0;
  }

  clearQueue(): void {
    this.queue.set([]);
    this.results.set([]);
    this.totalSum.set(null);
    this.animDice.set([]);
  }

  // ── Roll ───────────────────────────────────────────────────────────────────
  rollAll(modifier?: number, label?: string): void {
    const toRoll = this.queue();
    if (!toRoll.length || this.isRolling()) return;

    this.timers.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timers = [];
    this.intervals = [];

    this.isRolling.set(true);
    this.results.set([]);
    this.totalSum.set(null);

    const expanded: { id: number; type: DiceType; final: number }[] = [];
    toRoll.forEach(d => {
      for (let i = 0; i < d.count; i++) {
        const faces = parseInt(d.type.slice(1));
        expanded.push({ id: this.nextId++, type: d.type, final: Math.floor(Math.random() * faces) + 1 });
      }
    });

    this.animDice.set(
      expanded.map(d => ({
        id: d.id,
        dice: d.type,
        rolling: true,
        display: 1,
        final: d.final,
        modifier,
        label,
      })),
    );

    const CYCLE_MS = 60;
    const SETTLE_MS = 900;

    const iv = setInterval(() => {
      this.animDice.update(dice =>
        dice.map(d => {
          if (!d.rolling) return d;
          const faces = parseInt(d.dice.slice(1));
          return { ...d, display: Math.floor(Math.random() * faces) + 1 };
        }),
      );
    }, CYCLE_MS);
    this.intervals.push(iv);

    expanded.forEach((d, i) => {
      const t = setTimeout(() => {
        this.animDice.update(dice => dice.map(ad => (ad.id === d.id ? { ...ad, rolling: false, display: d.final } : ad)));
      }, SETTLE_MS + i * 120);
      this.timers.push(t);
    });

    const totalDelay = SETTLE_MS + expanded.length * 120 + 200;
    const done = setTimeout(() => {
      clearInterval(iv);
      const res: RollResult[] = expanded.map(d => ({ id: d.id, dice: d.type, value: d.final, modifier, label }));
      const rollSum = res.reduce((a, r) => a + r.value, 0);
      const total = modifier !== undefined ? rollSum + modifier : rollSum;
      this.results.set(res);
      this.totalSum.set(res.length > 1 ? total : null);
      this.isRolling.set(false);
      this.queue.set([]);

      const diceLabel = expanded.map(d => d.type).join(' + ');
      const vals = res.map(r => r.value).join(', ');
      const modStr = modifier !== undefined ? (modifier >= 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '';
      const totalStr = modifier !== undefined ? ` = ${total}` : res.length > 1 ? ` = ${rollSum}` : '';
      const prefix = label ? `${label}: ` : '';
      const entry =
        res.length > 1
          ? `${prefix}${diceLabel} → [${vals}]${modStr}${totalStr}`
          : `${prefix}${diceLabel} → ${res[0].value}${modStr}${totalStr}`;
      this.historyLog.update(h => [entry, ...h].slice(0, 10));
    }, totalDelay);
    this.timers.push(done);
  }

  // ── Quick single roll (double-click on die button) ─────────────────────────
  quickRoll(type: DiceType): void {
    this.queue.set([{ id: this.nextId++, type, count: 1 }]);
    this.rollAll();
  }

  // ── Internal: quick roll triggered by character-sheet with modifier ────────
  private _quickRollWithModifier(type: DiceType, modifier: number, label?: string): void {
    this.queue.set([{ id: this.nextId++, type, count: 1 }]);
    this.rollAll(modifier, label);
  }

  clearResults(): void {
    this.results.set([]);
    this.totalSum.set(null);
    this.animDice.set([]);
  }

  isNat20(r: RollResult): boolean {
    return r.dice === 'k20' && r.value === 20;
  }
  isCritFail(r: RollResult): boolean {
    return r.dice === 'k20' && r.value === 1;
  }
  isMax(r: RollResult): boolean {
    return r.value === parseInt(r.dice.slice(1));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
  }
}
