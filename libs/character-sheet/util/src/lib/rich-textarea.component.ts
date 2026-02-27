import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostListener, signal, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Plain-text markup syntax (stored as-is in DB):
 *
 *  **text**       → bold
 *  _text_         → italic
 *  - text  (or • text) at line start → bullet point
 *  ## text        at line start → large font (h1-style)
 *  # text         at line start → medium font (h2-style)
 *  (default)      → normal/small font
 */
function parseMarkup(raw: string): string {
  const lines = raw.split('\n');
  const htmlLines: string[] = [];

  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Escape HTML special chars first
    line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Inline: bold **text**
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline: italic _text_
    line = line.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');

    // Block: bullet  (- text  or  • text)
    const bulletMatch = line.match(/^(- |• )(.*)/);
    // Block: heading ##
    const h1Match = line.match(/^## (.*)/);
    // Block: heading #
    const h2Match = line.match(/^# (.*)/);

    if (bulletMatch) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${bulletMatch[2]}</li>`);
    } else {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
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

  if (inList) htmlLines.push('</ul>');

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
      <button type="button" title="Velký nadpis (## )" (click)="insertHeading('## ')">
        <span style="font-size:13px;font-weight:bold">H1</span>
      </button>
      <button type="button" title="Střední nadpis (# )" (click)="insertHeading('# ')">
        <span style="font-size:11px;font-weight:bold">H2</span>
      </button>
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

      // font size helpers
      :host ::ng-deep .rt-h1 {
        font-size: 17px;
        font-weight: bold;
      }

      :host ::ng-deep .rt-h2 {
        font-size: 15px;
        font-weight: bold;
      }

      :host ::ng-deep .rt-normal {
        font-size: 13px;
      }

      :host ::ng-deep ul {
        margin: 2px 0 2px 18px;
        padding: 0;
      }

      :host ::ng-deep li {
        font-size: 13px;
        margin: 1px 0;
      }
    }

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
    // Focus the textarea on next tick after it renders
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

  /** Wrap current selection with prefix/suffix, or insert at cursor */
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

  /** Insert a bullet prefix at the start of the current line */
  insertBullet() {
    this._insertLinePrefix('- ');
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
