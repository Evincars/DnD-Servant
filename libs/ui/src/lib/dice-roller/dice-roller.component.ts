import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

export type DiceType = 'k4' | 'k6' | 'k8' | 'k10' | 'k12' | 'k20';

interface QueuedDie {
  id: number;
  type: DiceType;
}
interface RollResult {
  id: number;
  dice: DiceType;
  value: number;
}

@Component({
  selector: 'dice-roller',
  templateUrl: './dice-roller.component.html',
  styleUrl: './dice-roller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class DiceRollerComponent {
  readonly diceTypes: DiceType[] = ['k4', 'k6', 'k8', 'k10', 'k12', 'k20'];

  isOpen = signal(false);
  isRolling = signal(false);
  results = signal<RollResult[]>([]);
  queue = signal<QueuedDie[]>([]);
  totalSum = signal<number | null>(null);

  private nextId = 0;

  togglePanel(): void {
    this.isOpen.update(v => !v);
  }

  addDie(type: DiceType): void {
    this.queue.update(q => [...q, { id: this.nextId++, type }]);
  }

  removeDieFromQueue(id: number): void {
    this.queue.update(q => q.filter(d => d.id !== id));
  }

  countInQueue(type: DiceType): number {
    return this.queue().filter(d => d.type === type).length;
  }

  rollAll(): void {
    const toRoll = this.queue();
    if (!toRoll.length || this.isRolling()) return;

    this.isRolling.set(true);
    this.results.set([]);
    this.totalSum.set(null);
    this.queue.set([]);

    // Short "rolling" animation delay then show results
    setTimeout(() => {
      const res: RollResult[] = toRoll.map(d => ({
        id: d.id,
        dice: d.type,
        value: Math.floor(Math.random() * parseInt(d.type.slice(1))) + 1,
      }));
      const sum = res.reduce((a, r) => a + r.value, 0);
      this.results.set(res);
      this.totalSum.set(res.length > 1 ? sum : null);
      this.isRolling.set(false);
    }, 600);
  }

  removeResult(id: number): void {
    this.results.update(r => r.filter(x => x.id !== id));
    const rem = this.results();
    this.totalSum.set(rem.length > 1 ? rem.reduce((a, r) => a + r.value, 0) : null);
  }

  clearAll(): void {
    this.results.set([]);
    this.totalSum.set(null);
    this.queue.set([]);
    this.isRolling.set(false);
  }

  isNat20(r: RollResult): boolean {
    return r.dice === 'k20' && r.value === 20;
  }
  isCritFail(r: RollResult): boolean {
    return r.dice === 'k20' && r.value === 1;
  }
}
