import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, MagicItem } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'magic-item-card',
  templateUrl: './magic-item-card.component.html',
  styleUrl: './magic-item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class MagicItemCardComponent {
  magicItem = input<MagicItem | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  rarityColor(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case 'common':    return '#c8c4bc';
      case 'uncommon':  return '#60c060';
      case 'rare':      return '#4090e0';
      case 'very rare': return '#a060d0';
      case 'legendary': return '#e0a030';
      case 'artifact':  return '#e05030';
      default:          return '#c8c4bc';
    }
  }
}

