import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * Plain-text markup syntax (stored as-is in DB):
 *
 *  **text**           → bold
 *  _text_             → italic
 *  [red]text[/red]    → colored text  (red | green | blue | orange | gray)
 *  - text  (or • text) at line start → bullet point (unordered)
 *  1. text            at line start → numbered list item (ordered)
 *  ## text            at line start → large font (h1-style)
 *  # text             at line start → medium font (h2-style)
 *  (default)          → normal/small font
 */

const COLORS = ['red', 'green', 'blue', 'orange', 'gray'];
const COLOR_LABELS: Record<string, string> = {
  red: '#e53935',
  green: '#43a047',
  blue: '#1e88e5',
  orange: '#fb8c00',
  gray: '#757575',
};

function parseMarkup(raw: string): string {
  const lines = raw.split('\n');
  const htmlLines: string[] = [];

  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
    for (const color of COLORS) {
      const re = new RegExp(`\\[${color}\\](.+?)\\[\\/${color}\\]`, 'g');
      line = line.replace(re, `<span class="rt-color-${color}">$1</span>`);
    }

    const ulMatch = line.match(/^(- |• )(.*)/);
    const olMatch = !ulMatch && line.match(/^\d+\. (.*)/);
    const h1Match = line.match(/^## (.*)/);
    const h2Match = !h1Match && line.match(/^# (.*)/);

    if (ulMatch) {
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (!inUl) { htmlLines.push('<ul>'); inUl = true; }
      htmlLines.push(`<li>${ulMatch[2]}</li>`);
    } else if (olMatch) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (!inOl) { htmlLines.push('<ol>'); inOl = true; }
      htmlLines.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (h1Match) {
        htmlLines.push(`<span class="rt-h1">${h1Match[1]}</span><br>`);
      } else if (h2Match) {
        htmlLines.push(`<span class="rt-h2">${h2Match[1]}</span><br>`);
      } else if (line.trim() === '') {
        htmlLines.push('<br>');
      } else {
        htmlLines.push(`<span class="rt-normal">${line}</span><br>`);
      }
    }
  }

  if (inUl) htmlLines.push('</ul>');
  if (inOl) htmlLines.push('</ol>');
  return htmlLines.join('');
}

@Component({
  selector: 'rich-textarea',
  template: `
    @if (editing()) {
      <!-- Toolbar: inline on mobile (normal flow), absolute on desktop -->
      <div class="rt-toolbar" [class.rt-toolbar--inline]="responsive()" (mousedown)="$event.preventDefault()">
        <button type="button" title="Tučné (**text**)" (click)="wrap('**', '**')"><strong>B</strong></button>
        <button type="button" title="Kurzíva (_text_)" (click)="wrap('_', '_')"><em>I</em></button>
        <span class="rt-separator"></span>
        <button type="button" title="Odrážka (- )" (click)="insertBullet()">•</button>
        <button type="button" title="Číslovaný seznam (1. )" (click)="insertNumberedBullet()">1.</button>
        <span class="rt-separator"></span>
        <button type="button" title="Velký nadpis (## )" (click)="insertHeading('## ')">
          <span style="font-size:13px;font-weight:bold">H1</span>
        </button>
        <button type="button" title="Střední nadpis (# )" (click)="insertHeading('# ')">
          <span style="font-size:11px;font-weight:bold">H2</span>
        </button>
        <span class="rt-separator"></span>
        @for (c of colorList; track c) {
          <button type="button" [title]="'Barva: ' + c" (click)="wrapColor(c)"
            [style.color]="colorHex(c)" style="font-weight:bold">A</button>
        }
        <!-- Done button: always shown, essential on mobile where blur is unreliable -->
        <span class="rt-separator"></span>
        <button type="button" class="rt-done-btn" title="Hotovo (zavřít editor)" (click)="stopEditing()">✓</button>
      </div>
      <textarea
        #ta
        class="rt-editor"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onEditorBlur()"
      ></textarea>
    } @else {
      <div
        class="rt-preview"
        [class.rt-preview--empty]="!value()"
        (click)="startEditing()"
        [innerHTML]="previewHtml()"
      ></div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      box-sizing: border-box;
    }

    /* ── Desktop toolbar: floats above the component ─────────────────── */
    .rt-toolbar {
      position: absolute;
      top: -34px;
      left: 0;
      z-index: 200;
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      align-items: center;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2px 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      white-space: nowrap;

      button {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 3px;
        cursor: pointer;
        min-width: 26px;
        height: 24px;
        font-size: 13px;
        padding: 0 4px;
        line-height: 1;
        &:hover { background: #f0f0f0; border-color: #bbb; }
      }
    }

    /* ── Mobile toolbar: inline normal-flow above the editor ─────────── */
    /* Avoids being clipped by overflow:hidden on parent collapsible.     */
    .rt-toolbar--inline {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      width: 100%;
      border-radius: 6px 6px 0 0;
      border-bottom: none;
      box-shadow: none;
      background: #f8f5ee;
      border-color: rgba(180, 130, 50, 0.35);
      flex-wrap: wrap;
      gap: 4px;
      padding: 6px 8px;

      button {
        min-width: 34px;
        height: 34px;
        font-size: 15px;
        border-radius: 4px;
      }
    }

    .rt-done-btn {
      color: #2a6e2a !important;
      font-weight: bold !important;
      font-size: 16px !important;
      min-width: 32px !important;
      &:hover { background: rgba(40,140,40,0.12) !important; border-color: #4caf50 !important; }
    }

    .rt-separator { width: 1px; height: 18px; background: #ccc; margin: 0 2px; flex-shrink: 0; }

    /* ── Preview ─────────────────────────────────────────────────────── */
    .rt-preview {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
      cursor: text;
      padding: 4px 6px;
      font-family: Arial, serif;
      font-size: 13px;
      word-break: break-word;
      white-space: pre-wrap;
      color: var(--rt-text-color, #2e2924);
      border-radius: 3px;
      transition: border-color 0.15s;
      position: relative;
    }

    /* Subtle "click to edit" affordance */
    .rt-preview::after {
      content: '✎';
      position: absolute;
      bottom: 4px;
      right: 6px;
      font-size: 11px;
      opacity: 0;
      color: var(--rt-text-color, #2e2924);
      transition: opacity 0.15s;
      pointer-events: none;
    }
    .rt-preview:hover::after { opacity: 0.35; }

    /* Empty placeholder */
    .rt-preview--empty::before {
      content: attr(data-placeholder);
      color: rgba(100, 80, 60, 0.38);
      font-style: italic;
      font-size: 12px;
      pointer-events: none;
    }

    ::ng-deep .rt-preview .rt-h1 { font-size: 17px; font-weight: bold; }
    ::ng-deep .rt-preview .rt-h2 { font-size: 15px; font-weight: bold; }
    ::ng-deep .rt-preview .rt-normal { font-size: 13px; }
    ::ng-deep .rt-preview ul, ::ng-deep .rt-preview ol { margin: 2px 0 2px 18px; padding: 0; }
    ::ng-deep .rt-preview li { font-size: 13px; margin: 1px 0; }
    ::ng-deep .rt-preview .rt-color-red    { color: #e53935; }
    ::ng-deep .rt-preview .rt-color-green  { color: #43a047; }
    ::ng-deep .rt-preview .rt-color-blue   { color: #1e88e5; }
    ::ng-deep .rt-preview .rt-color-orange { color: #fb8c00; }
    ::ng-deep .rt-preview .rt-color-gray   { color: #757575; }

    /* ── Editor ──────────────────────────────────────────────────────── */
    .rt-editor {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      resize: none;
      font-family: Arial, serif;
      font-size: 13px;
      border: none;
      outline: none;
      padding: 4px 6px;
      background: transparent;
      color: var(--rt-text-color, #2e2924);
      caret-color: var(--rt-caret-color, #8b1a1a);
    }

    /* When toolbar is inline, editor loses its top portion to the toolbar,
       so we shrink its height on mobile by giving the host flex layout */
    :host.rt-editing--inline {
      display: flex;
      flex-direction: column;

      .rt-editor {
        flex: 1 1 auto;
        height: auto;
        min-height: 100px;
      }
    }

    /* ══════════════════════════════════════════════════════════════════
       DARK THEME — applied whenever an ancestor has .theme-dark
       ══════════════════════════════════════════════════════════════════ */
    :host-context(.theme-dark) {
      /* Desktop floating toolbar */
      .rt-toolbar {
        background: rgba(22, 14, 6, 0.97);
        border-color: rgba(200, 160, 60, 0.35);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);

        button {
          color: rgba(220, 195, 130, 0.9);
          &:hover { background: rgba(200, 160, 60, 0.14); border-color: rgba(200, 160, 60, 0.45); color: #e8c96a; }
        }
      }

      /* Mobile inline toolbar */
      .rt-toolbar--inline {
        background: rgba(18, 12, 5, 0.98);
        border-color: rgba(200, 160, 60, 0.25);
      }

      .rt-separator { background: rgba(200, 160, 60, 0.3); }

      .rt-done-btn {
        color: rgba(100, 200, 100, 0.9) !important;
        &:hover { background: rgba(50, 160, 50, 0.15) !important; border-color: rgba(80, 180, 80, 0.5) !important; }
      }

      /* Preview panel */
      .rt-preview {
        color: var(--rt-text-color, rgba(220, 200, 170, 0.9));
        &::after { color: rgba(200, 160, 60, 0.5); }
      }

      .rt-preview--empty::before {
        color: rgba(200, 160, 60, 0.3);
      }

      /* Raw editor */
      .rt-editor {
        color: var(--rt-text-color, rgba(220, 200, 170, 0.9));
        caret-color: var(--rt-caret-color, rgba(200, 160, 60, 0.9));
      }

      /* Rich preview inner spans */
      ::ng-deep .rt-preview .rt-h1 { color: #e8c96a; }
      ::ng-deep .rt-preview .rt-h2 { color: #d4aa50; }
      ::ng-deep .rt-preview .rt-normal { color: inherit; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextareaComponent), multi: true }],
  host: {
    '[class.rt-editing--inline]': 'editing() && responsive()',
  },
})
export class RichTextareaComponent implements ControlValueAccessor {
  private readonly injector = inject(Injector);
  private readonly bp = inject(BreakpointObserver);

  readonly ta = viewChild<ElementRef<HTMLTextAreaElement>>('ta');

  readonly editing = signal(false);
  readonly value = signal('');
  readonly html = signal('');

  /** True on ≤1359px — same breakpoint as the character-sheet responsive layout */
  readonly responsive = toSignal(
    this.bp.observe('(max-width: 1359px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  readonly colorList = COLORS;

  /** HTML shown in preview — adds a data-placeholder attribute for the empty hint */
  previewHtml(): string {
    return this.html();
  }

  colorHex(color: string): string {
    return COLOR_LABELS[color] ?? '#000';
  }

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    const v = val ?? '';
    this.value.set(v);
    this.html.set(parseMarkup(v));
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  startEditing(): void {
    this.editing.set(true);
    // afterNextRender fires after Angular has committed the DOM — guarantees
    // the <textarea> exists before we focus it. This fixes the mobile issue
    // where setTimeout() would fire before Angular rendered the @if branch.
    afterNextRender(() => {
      this.ta()?.nativeElement.focus();
    }, { injector: this.injector });
  }

  stopEditing(): void {
    this.editing.set(false);
    this.onTouched();
  }

  /** Called on textarea blur — only close editor if not on mobile, because on
   *  mobile the soft-keyboard often triggers spurious blur events. */
  onEditorBlur(): void {
    if (!this.responsive()) {
      this.stopEditing();
    }
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this.html.set(parseMarkup(val));
    this.onChange(val);
  }

  wrap(prefix: string, suffix: string): void {
    const el = this.ta()?.nativeElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end) || 'text';
    const newVal = el.value.substring(0, start) + prefix + selected + suffix + el.value.substring(end);
    el.value = newVal;
    el.selectionStart = start + prefix.length;
    el.selectionEnd = start + prefix.length + selected.length;
    this._emitChange(newVal);
    el.focus();
  }

  wrapColor(color: string): void { this.wrap(`[${color}]`, `[/${color}]`); }
  insertBullet(): void { this._insertLinePrefix('- '); }

  insertNumberedBullet(): void {
    const el = this.ta()?.nativeElement;
    if (!el) return;
    const pos = el.selectionStart;
    const textBefore = el.value.substring(0, pos);
    const prevNumbered = (textBefore.match(/^\d+\. /gm) ?? []).length;
    this._insertLinePrefix(`${prevNumbered + 1}. `);
  }

  insertHeading(prefix: string): void { this._insertLinePrefix(prefix); }

  private _insertLinePrefix(prefix: string): void {
    const el = this.ta()?.nativeElement;
    if (!el) return;
    const pos = el.selectionStart;
    const val = el.value;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const newVal = val.substring(0, lineStart) + prefix + val.substring(lineStart);
    el.value = newVal;
    el.selectionStart = el.selectionEnd = pos + prefix.length;
    this._emitChange(newVal);
    el.focus();
  }

  private _emitChange(val: string): void {
    this.value.set(val);
    this.html.set(parseMarkup(val));
    this.onChange(val);
  }
}
