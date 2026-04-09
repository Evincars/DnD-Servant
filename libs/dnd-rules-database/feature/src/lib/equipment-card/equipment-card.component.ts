import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, Equipment } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'equipment-card',
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class EquipmentCardComponent {
  equipment = input<Equipment | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  costText(e: Equipment): string {
    return `${e.cost.quantity} ${e.cost.unit}`;
  }

  acText(e: Equipment): string {
    if (!e.armor_class) return '';
    const base = e.armor_class.base;
    if (e.armor_class.dex_bonus) {
      const cap = e.armor_class.max_bonus != null ? ` (max +${e.armor_class.max_bonus})` : '';
      return `${base} + DEX${cap}`;
    }
    return `${base}`;
  }

  rangeText(e: Equipment): string | null {
    const r = e.range ?? e.throw_range;
    if (!r) return null;
    return r.long ? `${r.normal}/${r.long} ft` : `${r.normal} ft`;
  }
}


