import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/**
 * A plain-text input with a native <datalist> autocomplete.
 * Implements ControlValueAccessor — use with [(ngModel)] or formControl.
 *
 * @example
 * <autofill-input
 *   [(ngModel)]="row.name"
 *   [suggestions]="monsterNames"
 *   placeholder="Název / jméno"
 *   inputClass="my-input-class"
 * />
 */
@Component({
  selector: 'autofill-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutofillInputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [id]="inputId"
      type="text"
      [class]="inputClass()"
      [placeholder]="placeholder()"
      [attr.list]="listId"
      [ngModel]="value()"
      (ngModelChange)="onValueChange($event)"
      (blur)="onTouched()"
    />
    <datalist [id]="listId">
      @for (s of suggestions(); track s) {
      <option [value]="s"></option>
      }
    </datalist>
  `,
  styles: `
    :host { display: contents; }
    datalist { display: none; }
  `,
})
export class AutofillInputComponent implements ControlValueAccessor {
  suggestions = input<string[]>([]);
  placeholder = input<string>('');
  inputClass = input<string>('');

  value = signal<string>('');

  readonly inputId = `autofill-input-${++nextId}`;
  readonly listId = `autofill-list-${nextId}`;

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onValueChange(v: string): void {
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(v: string): void {
    this.value.set(v ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
