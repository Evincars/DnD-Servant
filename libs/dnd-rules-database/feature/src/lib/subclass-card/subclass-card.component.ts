import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Subclass } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'subclass-card',
  templateUrl: './subclass-card.component.html',
  styleUrl: './subclass-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class SubclassCardComponent {
  subclass = input<Subclass | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  spellPrereqLevel(s: Subclass, spellName: string): number | null {
    const entry = (s.spells ?? []).find(e => e.spell.name === spellName);
    const lvlReq = entry?.prerequisites.find(p => p.type === 'level');
    return lvlReq ? lvlReq.minimum_level : null;
  }
}
