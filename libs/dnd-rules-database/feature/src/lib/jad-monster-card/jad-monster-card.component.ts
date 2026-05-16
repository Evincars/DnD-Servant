import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'jad-monster-card',
  templateUrl: './jad-monster-card.component.html',
  styleUrl: './jad-monster-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class JadMonsterCardComponent {
  /** Pre-rendered HTML stat block from the JaD wiki. */
  html = input<string | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();
}

