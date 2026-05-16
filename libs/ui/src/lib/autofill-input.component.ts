import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/** Strips diacritical marks and lowercases — used for fuzzy filtering. */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const MAX_VISIBLE = 80;

/**
 * A plain-text input with a custom diacritics-insensitive autocomplete dropdown.
 * Filtering works even when typing without accents (e.g. "chrlic" → "Chrlič").
 * Implements ControlValueAccessor — use with [(ngModel)] or formControl.
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
    <div class="afc-wrap">
      <input
        [id]="inputId"
        type="text"
        [class]="inputClass()"
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        (focus)="open.set(true)"
        (blur)="open.set(false)"
        (keydown)="onKeydown($event)"
        autocomplete="off"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open() && filtered().length > 0"
        [attr.aria-activedescendant]="activeIdx() >= 0 ? optionId(activeIdx()) : null"
      />
      @if (open() && filtered().length > 0) {
        <ul
          class="afc-dropdown"
          role="listbox"
          (mousedown)="$event.preventDefault()"
        >
          @for (s of filtered(); track s; let i = $index) {
            <li
              [id]="optionId(i)"
              class="afc-option"
              [class.afc-option--active]="i === activeIdx()"
              role="option"
              (click)="onSelect(s)"
            >{{ s }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host { display: contents; }

    .afc-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
    }

    .afc-dropdown {
      position: absolute;
      top: calc(100% + 2px);
      left: 0;
      min-width: 100%;
      max-width: 420px;
      max-height: 260px;
      overflow-y: auto;
      margin: 0;
      padding: 4px 0;
      list-style: none;
      background: #16141c;
      border: 1px solid rgba(200, 160, 60, 0.35);
      border-radius: 4px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.75);
      z-index: 9999;
    }

    .afc-option {
      padding: 6px 12px;
      font-size: 13px;
      color: #d0c8b8;
      cursor: pointer;
      white-space: nowrap;

      &:hover, &.afc-option--active {
        background: rgba(200, 160, 60, 0.15);
        color: #f0d080;
      }
    }
  `,
})
export class AutofillInputComponent implements ControlValueAccessor {
  suggestions = input<string[]>([]);
  placeholder = input<string>('');
  inputClass = input<string>('');

  value = signal<string>('');
  open = signal(false);
  activeIdx = signal(-1);

  filtered = computed(() => {
    const q = normalize(this.value());
    const list = q.length >= 1
      ? this.suggestions().filter(s => normalize(s).includes(q))
      : this.suggestions();
    return list.slice(0, MAX_VISIBLE);
  });

  readonly inputId = `autofill-input-${++nextId}`;
  readonly listId = `autofill-list-${nextId}`;

  optionId(i: number): string {
    return `${this.listId}-opt-${i}`;
  }

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onValueChange(v: string): void {
    this.value.set(v);
    this.activeIdx.set(-1);
    this.onChange(v);
  }

  onKeydown(e: KeyboardEvent): void {
    if (!this.open()) return;
    const items = this.filtered();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.activeIdx.update(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.activeIdx.update(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        if (this.activeIdx() >= 0) {
          e.preventDefault();
          this.onSelect(items[this.activeIdx()]);
        }
        break;
      case 'Escape':
        this.open.set(false);
        break;
    }
  }

  onSelect(s: string): void {
    this.value.set(s);
    this.onChange(s);
    this.open.set(false);
    this.activeIdx.set(-1);
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
