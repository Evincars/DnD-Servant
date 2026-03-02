import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Race } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'race-card',
  templateUrl: './race-card.component.html',
  styleUrl: './race-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class RaceCardComponent {
  race = input<Race | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  /** Fixed bonuses as "+1 STR, +2 DEX" */
  abilityBonusText(r: Race): string {
    return r.ability_bonuses.map(b => `+${b.bonus} ${b.ability_score.name}`).join(', ');
  }

  /** Choosable bonus summary e.g. "choose 2 from any" */
  abilityBonusOptionsText(r: Race): string | null {
    const o = r.ability_bonus_options;
    if (!o) return null;
    return `+1 — vyber ${o.choose} z: ${o.from.options.map(x => x.ability_score.name).join(', ')}`;
  }

  /** Fixed languages list */
  languageText(r: Race): string {
    return r.languages.map(l => l.name).join(', ');
  }

  /** Optional extra language choices */
  languageOptionsText(r: Race): string | null {
    const o = r.language_options;
    if (!o) return null;
    return `Vyber ${o.choose} navíc z: ${o.from.options.map(x => x.item.name).join(', ')}`;
  }

  /** Starting proficiencies, if any */
  proficiencyText(r: Race): string | null {
    if (!r.starting_proficiencies?.length) return null;
    return r.starting_proficiencies.map(p => p.name).join(', ');
  }

  /** Starting proficiency options summary */
  proficiencyOptionsText(r: Race): string | null {
    const o = r.starting_proficiency_options;
    if (!o) return null;
    return `Vyber ${o.choose} z: ${o.from.options.map(x => x.item.name).join(', ')}`;
  }
}
