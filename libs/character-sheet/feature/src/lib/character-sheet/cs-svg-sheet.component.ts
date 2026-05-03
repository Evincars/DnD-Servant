import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';
import { SheetThemeService, Theme } from '../sheet-theme.service';

/** Monotonically-increasing counter to give each SVG instance a unique namespace. */
let _svgInstanceCounter = 0;

/**
 * For the Sirien dark theme: replaces light parchment backgrounds with deep
 * blood-red darks while keeping the original dark-red gradient decorations.
 * All SVG text is forced to a warm off-white via an injected !important rule.
 */
function _applySirienColors(svgText: string): string {
  // ── Upgrade gradient stop-colors to brighter crimson (rgb(196,24,24) family) ──
  // Lifted further from deep brown to vivid-but-not-garish crimson so the
  // coat-of-arms borders and ability-score shields stand out on the dark bg.
  svgText = svgText.replace(/stop-color="#5b1c11"/gi, 'stop-color="#c41818"');
  svgText = svgText.replace(/stop-color="#4f1b0e"/gi, 'stop-color="#a81414"');
  svgText = svgText.replace(/stop-color="#361909"/gi, 'stop-color="#8a1010"');
  svgText = svgText.replace(/stop-color="#2e1908"/gi, 'stop-color="#6a0c0c"');

  // ── Recolour fills / strokes inside the <style> block ───────────────────
  svgText = svgText.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/i,
    (_m, open: string, content: string, close: string) => {
      let c = content;
      // Parchment → rgb(25,25,25) = #191919 deep charcoal
      c = c.replace(/fill:\s*#fbf8f0/gi, 'fill: #191919');
      c = c.replace(/fill:\s*#fcf9f1/gi, 'fill: #191919');
      // Light-grey panels → slightly deeper charcoal
      c = c.replace(/fill:\s*#f6f6f6/gi, 'fill: #141414');
      // White areas → near-black
      c = c.replace(/fill:\s*#fff(?=[;\s}])/gi, 'fill: #0f0f0f');
      // Strokes → brighter crimson lines — better visible on charcoal background
      c = c.replace(/stroke:\s*#1d1d1b/gi, 'stroke: #9a1818');
      c = c.replace(/stroke:\s*#000(?=[;\s}])/gi,  'stroke: #7a1010');
      c = c.replace(/stroke:\s*#8f8f8f/gi, 'stroke: #8c2020');
      c = c.replace(/stroke:\s*#b2b2b2/gi, 'stroke: #aa3030');
      c = c.replace(/stroke:\s*#fcf9f1/gi, 'stroke: #8a1414');
      // All text → warm off-white / parchment tone — highly legible on dark bg
      c += '\n      text, tspan { fill: #e8dcd0 !important; }';
      // Noise/grain texture — make subtly visible as fine dot-grain on dark bg
      // (no invert so natural grain dots appear as light speckles on #191919)
      c += '\n      image { opacity: 0.14 !important; filter: brightness(0.7) contrast(1.4); }';
      return open + c + close;
    },
  );
  // Inline fill attributes not covered by the <style> block
  svgText = svgText.replace(/\bfill="#fbf8f0"/gi, 'fill="#191919"');
  svgText = svgText.replace(/\bfill="#f6f6f6"/gi, 'fill="#141414"');
  return svgText;
}

/**
 * Prepares raw SVG text for safe inline injection:
 * 1. Namespaces id="" and url(#…) references.
 * 2. Namespaces CSS class names (.cls-N → NS-cls-N).
 * 3. Fixes the Barlow font name.
 * 4. Injects explicit width/height.
 * 5. For Sirien: direct colour substitution (no CSS filter inversion).
 */
function prepareSvg(svgText: string, ns: string, theme: Theme = 'light'): string {
  svgText = svgText.replace(/\bid="([^"]+)"/g, `id="${ns}-$1"`);
  svgText = svgText.replace(/url\(#([^)]+)\)/g, `url(#${ns}-$1)`);
  svgText = svgText.replace(/(xlink:href|href)="#([^"]+)"/g, `$1="#${ns}-$2"`);
  svgText = svgText.replace(/\bcls-(\w+)/g, `${ns}-cls-$1`);
  svgText = svgText.replace(/'Barlow Black'/g, "'Barlow'");
  if (!/\bwidth="1293"/.test(svgText)) {
    svgText = svgText.replace(/(<svg\b[^>]*?)(\/?>)/, '$1 width="1293" height="1817"$2');
  }
  if (theme === 'sirien') {
    svgText = _applySirienColors(svgText);
  }
  return svgText;
}

@Component({
  selector: 'cs-svg-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cs-bg-img',
    '[class.theme-dark]':   'sheetTheme.darkMode()',
    '[class.theme-sirien]': 'sheetTheme.theme() === "sirien"',
    '[class.theme-night]':  'sheetTheme.theme() === "night"',
  },
  template: `
    @if (safeHtml()) {
      <div [innerHTML]="safeHtml()!" class="cs-svg-wrap"></div>
    }
  `,
  styles: `
    :host { display: block; line-height: 0; }
    .cs-svg-wrap { line-height: 0; }

    :host ::ng-deep svg {
      display: block;
      background: #f6f0e8;
    }

    /* ── Tmavé: rich warm amber/gold ornaments, very dark warm-brown bg ─ */
    /* invert: parchment→near-black, text→near-white                       */
    /* hue-rotate(195°): inverted cyan ornaments → H=25° = amber/gold      */
    :host.theme-dark ::ng-deep svg {
      background: #141008;
      filter: invert(1) hue-rotate(195deg) saturate(1.0) brightness(0.76) contrast(1.1);
    }

    /* ── Sirien: rgb(25,25,25) bg, vivid crimson ornaments, warm text ──── */
    /* Gradient stops upgraded to rgb(140,15,15) family by _applySirienColors  */
    /* filter:none overrides the invert() inherited from .theme-dark           */
    :host.theme-sirien ::ng-deep svg {
      background: #191919;
      filter: none;
    }

    /* ── Noční: deep indigo-blue ornaments, dark navy bg, cool white text ── */
    /* hue-rotate(50°): inverted cyan ornaments → H=240° = vivid blue        */
    :host.theme-night ::ng-deep svg {
      background: #060810;
      filter: invert(1) hue-rotate(50deg) saturate(1.3) brightness(0.76) contrast(1.1);
    }
  `,
})
export class CsSvgSheetComponent {
  /** Path to the SVG, relative to the app root (e.g. "character-sheets/character-sheet-1.svg"). */
  readonly src = input.required<string>();

  readonly sheetTheme = inject(SheetThemeService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly _ns = `svgcs${++_svgInstanceCounter}`;

  // toObservable MUST be called in the injection context (field initializer), not
  // inside a switchMap callback.  Store it here so it can be safely referenced later.
  private readonly _theme$ = toObservable(this.sheetTheme.theme);

  /** Re-processes the SVG on theme change without re-fetching. */
  readonly safeHtml = toSignal<SafeHtml>(
    toObservable(this.src).pipe(
      switchMap(src =>
        combineLatest([
          this.http.get(src, { responseType: 'text' }),
          this._theme$,
        ]).pipe(
          map(([svgText, theme]) =>
            this.sanitizer.bypassSecurityTrustHtml(prepareSvg(svgText, this._ns, theme)),
          ),
        ),
      ),
    ),
  );
}
