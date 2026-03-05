import { Injectable, signal } from '@angular/core';

export interface ModifierRollRequest {
  label: string;
  modifier: number;
}

@Injectable({ providedIn: 'root' })
export class DiceRollerService {
  /** Emits whenever character-sheet wants to roll d20 + modifier */
  readonly pendingRoll = signal<ModifierRollRequest | null>(null);

  rollD20WithModifier(label: string, modifier: number): void {
    this.pendingRoll.set({ label, modifier });
  }
}
