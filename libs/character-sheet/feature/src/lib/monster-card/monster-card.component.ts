import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Monster } from '@dn-d-servant/data-access';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'monster-card',
  templateUrl: './monster-card.component.html',
  styleUrl: './monster-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class MonsterCardComponent {
  monster = input<Monster | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

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
