import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DndTranslatePipe, DndClass } from '@dn-d-servant/util';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'class-card',
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DndTranslatePipe, AsyncPipe],
})
export class ClassCardComponent {
  dndClass = input<DndClass | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  close = output<void>();

  /** "d10" */
  hitDieLabel(c: DndClass): string {
    return `d${c.hit_die}`;
  }

  /** "STR, CON" */
  savingThrowsText(c: DndClass): string {
    return c.saving_throws.map(s => s.name).join(', ');
  }

  /** Flat proficiency names */
  proficienciesText(c: DndClass): string {
    return c.proficiencies.map(p => p.name).join(', ');
  }

  /** Skill choices description */
  proficiencyChoiceText(c: DndClass): string | null {
    if (!c.proficiency_choices?.length) return null;
    return c.proficiency_choices
      .map(pc => {
        const opts = pc.from.options.map(o => o.item.name).join(', ');
        return `Vyber ${pc.choose} z: ${opts}`;
      })
      .join(' | ');
  }

  /** Starting equipment list */
  startingEquipmentText(c: DndClass): string | null {
    if (!c.starting_equipment?.length) return null;
    return c.starting_equipment.map(e => `${e.equipment.name} ×${e.quantity}`).join(', ');
  }

  /** Multiclassing requirements */
  multiclassReqText(c: DndClass): string | null {
    const mc = c.multi_classing;
    const hard = mc.prerequisites?.map(p => `${p.ability_score.name} ${p.minimum_score}`).join(', ');
    const opts = mc.prerequisite_options
      ? `Vyber ${mc.prerequisite_options.choose} z: ${mc.prerequisite_options.from.options
          .map(o => `${o.ability_score.name} ${o.minimum_score}`)
          .join(', ')}`
      : null;
    return [hard, opts].filter(Boolean).join(' | ') || null;
  }

  /** Proficiencies gained on multiclass */
  multiclassProfText(c: DndClass): string | null {
    const profs = c.multi_classing?.proficiencies;
    if (!profs?.length) return null;
    return profs.map(p => p.name).join(', ');
  }
}
