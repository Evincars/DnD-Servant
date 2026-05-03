import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { SheetThemeService } from '../sheet-theme.service';

/** Monotonically-increasing counter to give each SVG instance a unique namespace. */
let _svgInstanceCounter = 0;

/**
 * Prepares raw SVG text for safe inline injection:
 *
 * 1. Namespaces every id="" so gradient/filter defs don't clash when
 *    multiple sheets are in the DOM (all collapsibles open at once).
 * 2. Namespaces CSS class names (.cls-N → .NS-cls-N) to prevent style
 *    leakage from the SVG's <style> block into the rest of the page.
 * 3. Fixes the Barlow font: the SVG references 'Barlow Black' but
 *    @fontsource/barlow registers the family as plain 'Barlow'.
 * 4. Injects explicit width/height on <svg> to keep pixel layout identical
 *    to the previous <img width="1293" height="1817">.
 */
function prepareSvg(svgText: string, ns: string): string {
  // ── 1. Namespace all id= attributes ──────────────────────────────────
  svgText = svgText.replace(/\bid="([^"]+)"/g, `id="${ns}-$1"`);

  // ── 2. Namespace all url(#...) paint-server references ───────────────
  svgText = svgText.replace(/url\(#([^)]+)\)/g, `url(#${ns}-$1)`);

  // ── 3. Namespace href="#..." and xlink:href="#..." references ─────────
  svgText = svgText.replace(/(xlink:href|href)="#([^"]+)"/g, `$1="#${ns}-$2"`);

  // ── 4. Namespace CSS class names (.cls-N in <style> and class="cls-N") ─
  //   The word-boundary \b ensures we only hit the start of the token.
  svgText = svgText.replace(/\bcls-(\w+)/g, `${ns}-cls-$1`);

  // ── 5. Fix Barlow font family name ────────────────────────────────────
  //   @fontsource/barlow registers as 'Barlow'; SVG falls back to 'Barlow Black'
  svgText = svgText.replace(/'Barlow Black'/g, "'Barlow'");

  // ── 6. Inject explicit dimensions on the root <svg> element ──────────
  //   Replace only if not already present (guard against double-inject).
  if (!/\bwidth="1293"/.test(svgText)) {
    svgText = svgText.replace(/(<svg\b[^>]*?)(\/?>)/, '$1 width="1293" height="1817"$2');
  }

  return svgText;
}

/**
 * Renders a character-sheet SVG inline (not as <img>) so that
 * globally-loaded @font-face rules (Alegreya, Barlow…) apply to SVG text.
 *
 * The <img> approach sandboxes the SVG in an opaque image context where
 * the browser blocks external resource loading — including web fonts.
 * Inlining makes the SVG part of the live DOM so it inherits all fonts.
 */
@Component({
  selector: 'cs-svg-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // class cs-bg-img — the responsive @media rule hides .cs-bg-img on mobile
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
    :host {
      display: block;
      line-height: 0;
    }

    .cs-svg-wrap {
      line-height: 0;
    }

    /* Parchment fallback background (light theme) */
    :host ::ng-deep svg {
      display: block;
      background: #f6f0e8;
    }

    /* ── Dark theme: warm amber / sepia ─────────────────────────────── */
    :host.theme-dark ::ng-deep svg {
      background: #1a1208;
      filter: invert(1) sepia(0.35) hue-rotate(10deg) brightness(0.85) contrast(1.05);
    }

    /* ── Sirien theme: arcane purple ────────────────────────────────── */
    :host.theme-sirien ::ng-deep svg {
      background: #100818;
      filter: invert(1) hue-rotate(80deg) saturate(1.3) brightness(0.82) contrast(1.08);
    }

    /* ── Noční theme: cold night blue ───────────────────────────────── */
    :host.theme-night ::ng-deep svg {
      background: #080d18;
      filter: invert(1) hue-rotate(20deg) saturate(1.1) brightness(0.80) contrast(1.08);
    }
  `,
})
export class CsSvgSheetComponent {
  /** Path to the SVG, relative to the app root (e.g. "character-sheets/character-sheet-1.svg"). */
  readonly src = input.required<string>();

  readonly sheetTheme = inject(SheetThemeService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  /** Per-instance namespace prefix — prevents ID and class collisions in the DOM. */
  private readonly _ns = `svgcs${++_svgInstanceCounter}`;

  readonly safeHtml = toSignal<SafeHtml>(
    toObservable(this.src).pipe(
      switchMap(src => this.http.get(src, { responseType: 'text' })),
      map(svgText =>
        this.sanitizer.bypassSecurityTrustHtml(prepareSvg(svgText, this._ns)),
      ),
    ),
  );
}
