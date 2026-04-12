import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Condition } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'condition-card',
  templateUrl: './condition-card.component.html',
  styleUrl: './condition-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class ConditionCardComponent {
  condition = input<Condition | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();
}

