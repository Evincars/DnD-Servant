import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Feat } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'feat-card',
  templateUrl: './feat-card.component.html',
  styleUrl: './feat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class FeatCardComponent {
  feat = input<Feat | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  hasPrerequisites(f: Feat): boolean {
    return f.prerequisites.length > 0;
  }

  prerequisiteText(f: Feat): string {
    return f.prerequisites.map(p => `${p.ability_score.name} ${p.minimum_score}`).join(', ');
  }
}
