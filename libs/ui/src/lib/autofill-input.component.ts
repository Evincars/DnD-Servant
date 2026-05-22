import {
  ChangeDetectionStrategy, Component, computed, DestroyRef,
  ElementRef, forwardRef, inject, input, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';

let nextId = 0;

/** Strips diacritical marks and lowercases — used for fuzzy filtering. */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const MAX_VISIBLE = 80;

/**
 * A plain-text input with a custom diacritics-insensitive autocomplete dropdown.
 * The dropdown uses `position: fixed` so it is never clipped by ancestor overflow.
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
        #inputEl
        [id]="inputId"
        type="text"
        [class]="inputClass()"
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        (focus)="onFocus()"
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
          [style.top]="dropTop()"
          [style.left]="dropLeft()"
          [style.width]="dropWidth()"
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
    :host {
      display: block;
      flex: 1;
      min-width: 0;
    }

    .afc-wrap {
      position: relative;
      width: 100%;

      /* Ensure the inner input never exceeds the container — browsers apply
         a user-agent minimum width to <input> that would otherwise escape the
         flex item and push sibling columns out of place. */
      input {
        display: block;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
    }

    /* position: fixed — never clipped by any ancestor overflow */
    .afc-dropdown {
      position: fixed;
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  suggestions = input<string[]>([]);
  placeholder = input<string>('');
  inputClass = input<string>('');

  value = signal<string>('');
  open = signal(false);
  activeIdx = signal(-1);

  // Fixed dropdown coordinates (updated on focus)
  dropTop = signal('0px');
  dropLeft = signal('0px');
  dropWidth = signal('200px');

  filtered = computed(() => {
    const q = normalize(this.value());
    const list = q.length >= 1
      ? this.suggestions().filter(s => normalize(s).includes(q))
      : this.suggestions();
    return list.slice(0, MAX_VISIBLE);
  });

  readonly inputId = `autofill-input-${++nextId}`;
  readonly listId = `autofill-list-${nextId}`;

  constructor() {
    // Close on any scroll (capture phase catches scrolls inside overflow containers)
    fromEvent(document, 'scroll', { capture: true, passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.open.set(false));

    // Close on window resize
    fromEvent(window, 'resize', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.open.set(false));
  }

  optionId(i: number): string {
    return `${this.listId}-opt-${i}`;
  }

  onFocus(): void {
    this._updatePosition();
    this.open.set(true);
  }

  private _updatePosition(): void {
    const el = this.inputEl()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.dropTop.set(`${rect.bottom + 2}px`);
    this.dropLeft.set(`${rect.left}px`);
    this.dropWidth.set(`${rect.width}px`);
  }

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  onValueChange(v: string): void {
    this.value.set(v);
    this.activeIdx.set(-1);
    // Re-open (and reposition) whenever the user edits — handles the case where
    // they selected an option and immediately start typing again without a blur.
    this._updatePosition();
    this.open.set(true);
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

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
