import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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

    // Escape HTML special chars first
    line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Inline: bold **text**
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline: italic _text_
    line = line.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
    // Inline: colors [color]text[/color]
    for (const color of COLORS) {
      const re = new RegExp(`\\[${color}\\](.+?)\\[\\/${color}\\]`, 'g');
      line = line.replace(re, `<span class="rt-color-${color}">$1</span>`);
    }

    // Block: unordered bullet  (- text  or  • text)
    const ulMatch = line.match(/^(- |• )(.*)/);
    // Block: ordered bullet  (1. text  /  2. text  / …)
    const olMatch = !ulMatch && line.match(/^\d+\. (.*)/);
    // Block: heading ##
    const h1Match = line.match(/^## (.*)/);
    // Block: heading #
    const h2Match = !h1Match && line.match(/^# (.*)/);

    if (ulMatch) {
      if (inOl) {
        htmlLines.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        htmlLines.push('<ul>');
        inUl = true;
      }
      htmlLines.push(`<li>${ulMatch[2]}</li>`);
    } else if (olMatch) {
      if (inUl) {
        htmlLines.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        htmlLines.push('<ol>');
        inOl = true;
      }
      htmlLines.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inUl) {
        htmlLines.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        htmlLines.push('</ol>');
        inOl = false;
      }

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
    <!-- Toolbar — shown only when editing -->
    @if (editing()) {
    <div class="rt-toolbar" (mousedown)="$event.preventDefault()">
      <button type="button" title="Tučné (**text**)" (click)="wrap('**', '**')"><strong>B</strong></button>
      <button type="button" title="Kurzíva (_text_)" (click)="wrap('_', '_')"><em>I</em></button>
      <button type="button" title="Odrážka (- )" (click)="insertBullet()">•</button>
      <button type="button" title="Číslovaný seznam (1. )" (click)="insertNumberedBullet()">1.</button>
      <button type="button" title="Velký nadpis (## )" (click)="insertHeading('## ')">
        <span style="font-size:13px;font-weight:bold">H1</span>
      </button>
      <button type="button" title="Střední nadpis (# )" (click)="insertHeading('# ')">
        <span style="font-size:11px;font-weight:bold">H2</span>
      </button>
      <span class="rt-separator"></span>
      <!-- Color buttons -->
      @for (c of colorList; track c) {
      <button
        type="button"
        [title]="'Barva: ' + c"
        (click)="wrapColor(c)"
        [style.color]="colorHex(c)"
        [style.font-weight]="'bold'"
      >
        A
      </button>
      }
    </div>
    }

    <!-- Preview div (shown when not editing) -->
    @if (!editing()) {
    <div class="rt-preview" (click)="startEditing()" [innerHTML]="html()"></div>
    }

    <!-- Raw textarea (shown when editing) -->
    @if (editing()) {
    <textarea #ta class="rt-editor" [value]="value()" (input)="onInput($event)" (blur)="stopEditing()"></textarea>
    }
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      box-sizing: border-box;
    }

    .rt-toolbar {
      position: absolute;
      top: -32px;
      left: 0;
      z-index: 100;
      display: flex;
      gap: 2px;
      align-items: center;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2px 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);

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

        &:hover {
          background: #f0f0f0;
          border-color: #bbb;
        }
      }
    }

    .rt-separator {
      width: 1px;
      height: 18px;
      background: #ccc;
      margin: 0 2px;
    }

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
    }

    /* Injected HTML styles — must be ::ng-deep at host level */
    ::ng-deep .rt-preview .rt-h1 { font-size: 17px; font-weight: bold; }
    ::ng-deep .rt-preview .rt-h2 { font-size: 15px; font-weight: bold; }
    ::ng-deep .rt-preview .rt-normal { font-size: 13px; }

    ::ng-deep .rt-preview ul,
    ::ng-deep .rt-preview ol {
      margin: 2px 0 2px 18px;
      padding: 0;
    }
    ::ng-deep .rt-preview li { font-size: 13px; margin: 1px 0; }

    /* Color classes */
    ::ng-deep .rt-preview .rt-color-red    { color: #e53935; }
    ::ng-deep .rt-preview .rt-color-green  { color: #43a047; }
    ::ng-deep .rt-preview .rt-color-blue   { color: #1e88e5; }
    ::ng-deep .rt-preview .rt-color-orange { color: #fb8c00; }
    ::ng-deep .rt-preview .rt-color-gray   { color: #757575; }

    .rt-editor {
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextareaComponent),
      multi: true,
    },
  ],
})
export class RichTextareaComponent implements ControlValueAccessor {
  @ViewChild('ta') ta?: ElementRef<HTMLTextAreaElement>;

  editing = signal(false);
  value = signal('');
  html = signal('');

  readonly colorList = COLORS;

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

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  startEditing() {
    this.editing.set(true);
    setTimeout(() => this.ta?.nativeElement.focus(), 0);
  }

  stopEditing() {
    this.editing.set(false);
    this.onTouched();
  }

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this.html.set(parseMarkup(val));
    this.onChange(val);
  }

  /** Wrap current selection with prefix/suffix, or insert placeholder */
  wrap(prefix: string, suffix: string) {
    const el = this.ta?.nativeElement;
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

  /** Wrap selection with color tags, e.g. [red]text[/red] */
  wrapColor(color: string) {
    this.wrap(`[${color}]`, `[/${color}]`);
  }

  /** Insert a bullet prefix at the start of the current line */
  insertBullet() {
    this._insertLinePrefix('- ');
  }

  /** Insert a numbered bullet prefix at the start of the current line */
  insertNumberedBullet() {
    const el = this.ta?.nativeElement;
    if (!el) return;
    // Detect current number by counting previous numbered lines
    const pos = el.selectionStart;
    const textBefore = el.value.substring(0, pos);
    const prevNumbered = (textBefore.match(/^\d+\. /gm) ?? []).length;
    this._insertLinePrefix(`${prevNumbered + 1}. `);
  }

  insertHeading(prefix: string) {
    this._insertLinePrefix(prefix);
  }

  private _insertLinePrefix(prefix: string) {
    const el = this.ta?.nativeElement;
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

  private _emitChange(val: string) {
    this.value.set(val);
    this.html.set(parseMarkup(val));
    this.onChange(val);
  }
}
