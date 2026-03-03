import { ChangeDetectionStrategy, Component, OnDestroy, signal, computed } from '@angular/core';

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
}
interface AnimDie {
  id: number;
  dice: DiceType;
  rolling: boolean;
  display: number;
  final: number;
}

@Component({
  selector: 'dice-roller',
  templateUrl: './dice-roller.component.html',
  styleUrl: './dice-roller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class DiceRollerComponent implements OnDestroy {
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
  rollAll(): void {
    const toRoll = this.queue();
    if (!toRoll.length || this.isRolling()) return;

    // Clear old timers
    this.timers.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timers = [];
    this.intervals = [];

    this.isRolling.set(true);
    this.results.set([]);
    this.totalSum.set(null);

    // Expand queue into individual dice
    const expanded: { id: number; type: DiceType; final: number }[] = [];
    toRoll.forEach(d => {
      for (let i = 0; i < d.count; i++) {
        const faces = parseInt(d.type.slice(1));
        expanded.push({ id: this.nextId++, type: d.type, final: Math.floor(Math.random() * faces) + 1 });
      }
    });

    // Init anim dice — all rolling
    this.animDice.set(
      expanded.map(d => ({
        id: d.id,
        dice: d.type,
        rolling: true,
        display: 1,
        final: d.final,
      })),
    );

    // Rapid number cycling interval
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

    // Settle each die one by one with staggered delay
    expanded.forEach((d, i) => {
      const t = (this.timers[this.timers.length] = setTimeout(() => {
        this.animDice.update(dice => dice.map(ad => (ad.id === d.id ? { ...ad, rolling: false, display: d.final } : ad)));
      }, SETTLE_MS + i * 120));
      this.timers.push(t);
    });

    // After all settled — show results
    const totalDelay = SETTLE_MS + expanded.length * 120 + 200;
    const done = setTimeout(() => {
      clearInterval(iv);
      const res: RollResult[] = expanded.map(d => ({ id: d.id, dice: d.type, value: d.final }));
      const sum = res.reduce((a, r) => a + r.value, 0);
      this.results.set(res);
      this.totalSum.set(res.length > 1 ? sum : null);
      this.isRolling.set(false);
      this.queue.set([]);

      // Add to history
      const label = expanded.map(d => `${d.type}`).join(' + ');
      const vals = res.map(r => r.value).join(', ');
      const entry = res.length > 1 ? `${label} → [${vals}] = ${sum}` : `${label} → ${res[0].value}`;
      this.historyLog.update(h => [entry, ...h].slice(0, 10));
    }, totalDelay);
    this.timers.push(done);
  }

  // ── Quick single roll (double-click) ───────────────────────────────────────
  quickRoll(type: DiceType): void {
    this.queue.set([{ id: this.nextId++, type, count: 1 }]);
    this.rollAll();
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
