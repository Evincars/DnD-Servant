import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Spell } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'spell-card',
  templateUrl: './spell-card.component.html',
  styleUrl: './spell-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class SpellCardComponent {
  spell = input<Spell | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  /** "0" → "Cantrip", otherwise "Level N" */
  levelLabel(level: number): string {
    return level === 0 ? 'Cantrip' : `${level}. stupeň`;
  }

  /** ["V","S","M"] → "V, S, M" */
  componentsText(s: Spell): string {
    return s.components.join(', ');
  }

  /** damage_at_slot_level / damage_at_character_level → "3: 8d6, 4: 9d6 …" */
  damageScaling(s: Spell): string | null {
    const map = s.damage?.damage_at_slot_level ?? s.damage?.damage_at_character_level;
    if (!map) return null;
    return Object.entries(map)
      .sort(([a], [b]) => +a - +b)
      .map(([lvl, dice]) => `${lvl}: ${dice}`)
      .join('  ·  ');
  }

  /** heal_at_slot_level → "1: 1d8+MOD, 2: 2d8+MOD …" */
  healScaling(s: Spell): string | null {
    const map = s.heal_at_slot_level;
    if (!map) return null;
    return Object.entries(map)
      .sort(([a], [b]) => +a - +b)
      .map(([lvl, dice]) => `${lvl}: ${dice}`)
      .join('  ·  ');
  }

  hasHigherLevel(s: Spell): boolean {
    return !!s.higher_level?.length;
  }
}
