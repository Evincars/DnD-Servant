import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Subrace } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'subrace-card',
  templateUrl: './subrace-card.component.html',
  styleUrl: './subrace-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class SubraceCardComponent {
  subrace = input<Subrace | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  abilityBonusText(s: Subrace): string | null {
    if (!s.ability_bonuses?.length) return null;
    return s.ability_bonuses.map(b => `+${b.bonus} ${b.ability_score.name}`).join(', ');
  }

  proficienciesText(s: Subrace): string | null {
    if (!s.starting_proficiencies?.length) return null;
    return s.starting_proficiencies.map(p => p.name).join(', ');
  }

  languagesText(s: Subrace): string | null {
    if (!s.languages?.length) return null;
    return s.languages.map(l => l.name).join(', ');
  }

  languageOptionsText(s: Subrace): string | null {
    const o = s.language_options;
    if (!o) return null;
    return `Vyber ${o.choose} z: ${o.from.options.map(x => x.item.name).join(', ')}`;
  }

  traitOptionsText(s: Subrace): string | null {
    const o = s.racial_trait_options;
    if (!o) return null;
    const desc = o.desc ? ` — ${o.desc}` : '';
    return `Vyber ${o.choose} z: ${o.from.options.map(x => x.item.name).join(', ')}${desc}`;
  }
}
