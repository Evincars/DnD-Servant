import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Background } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'background-card',
  templateUrl: './background-card.component.html',
  styleUrl: './background-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class BackgroundCardComponent {
  background = input<Background | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  proficienciesText(b: Background): string {
    return b.starting_proficiencies.map(p => p.name).join(', ');
  }

  equipmentText(b: Background): string {
    return b.starting_equipment.map(e => `${e.equipment.name} ×${e.quantity}`).join(', ');
  }

  languageOptionsText(b: Background): string | null {
    const o = b.language_options;
    if (!o) return null;
    const names = o.from.options.map(x => x.item.name).join(', ');
    return `Vyber ${o.choose} z: ${names}`;
  }

  personalityTraits(b: Background): string[] {
    return b.personality_traits?.from.options.map(o => o.string) ?? [];
  }
}

