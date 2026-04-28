import { ChangeDetectionStrategy, Component, ElementRef, inject, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DOCUMENT } from '@angular/common';

/**
 * Always-visible floating action bar (bottom-right corner).
 * Contains scroll-to-top, scroll-to-bottom and save buttons.
 */
@Component({
  selector: 'cs-floating-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconButton, MatIcon, MatTooltip],
  host: { class: 'cs-floating-actions' },
  template: `
    <div class="cs-fab-group">
      <button
        mat-icon-button
        type="button"
        class="cs-fab-btn"
        (click)="scrollTop()"
        matTooltip="Nahoru"
        matTooltipPosition="left"
      >
        <mat-icon>arrow_upward</mat-icon>
      </button>

      <button
        mat-icon-button
        type="button"
        class="cs-fab-btn"
        (click)="scrollBottom()"
        matTooltip="Dolů"
        matTooltipPosition="left"
      >
        <mat-icon>arrow_downward</mat-icon>
      </button>

      <button
        mat-icon-button
        type="button"
        class="cs-fab-btn cs-fab-btn--save"
        (click)="saveRequested.emit()"
        matTooltip="Uložit"
        matTooltipPosition="left"
      >
        <mat-icon>save</mat-icon>
      </button>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      bottom: 20px;
      right: 16px;
      z-index: 9999;
      pointer-events: none;
    }

    .cs-fab-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      pointer-events: auto;
    }

    .cs-fab-btn {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background: rgba(30, 20, 8, 0.82) !important;
      color: rgba(200, 160, 60, 0.9) !important;
      border: 1px solid rgba(200, 160, 60, 0.35) !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
      backdrop-filter: blur(4px);
      transition: background 0.15s, box-shadow 0.15s;

      &:hover {
        background: rgba(50, 35, 10, 0.92) !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.6) !important;
        border-color: rgba(200, 160, 60, 0.65) !important;
      }
    }

    .cs-fab-btn--save {
      background: rgba(180, 100, 20, 0.88) !important;
      color: #fff !important;
      border-color: rgba(220, 150, 40, 0.6) !important;

      &:hover {
        background: rgba(200, 120, 30, 0.95) !important;
      }
    }

    /* Light-theme override */
    :host-context(:not(.theme-dark)) {
      .cs-fab-btn {
        background: rgba(255, 248, 235, 0.92) !important;
        color: rgba(120, 70, 10, 0.9) !important;
        border-color: rgba(180, 120, 40, 0.45) !important;

        &:hover {
          background: rgba(255, 240, 200, 0.97) !important;
        }
      }

      .cs-fab-btn--save {
        background: rgba(180, 90, 10, 0.9) !important;
        color: #fff !important;
      }
    }
  `,
})
export class CsFloatingActionsComponent {
  readonly saveRequested = output<void>();

  private readonly _doc = inject(DOCUMENT);
  private readonly _el = inject(ElementRef<HTMLElement>);

  scrollTop(): void {
    // Brute-force: scroll every candidate that might be the real scroller.
    for (const el of this._scrollCandidates()) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollBottom(): void {
    const maxH = Math.max(
      this._doc.body?.scrollHeight ?? 0,
      this._doc.documentElement?.scrollHeight ?? 0,
    );
    for (const el of this._scrollCandidates()) {
      const h = el instanceof Element ? el.scrollHeight : maxH;
      el.scrollTo({ top: h, behavior: 'smooth' });
    }
  }

  /**
   * Collect every element that could potentially be the scrollable container.
   * Depending on CSS overrides, any of these might be the actual scroller:
   *  1. closest scrollable ancestor of this component
   *  2. mat-tab-body-content (angular material tabs)
   *  3. mat-sidenav-content (angular material sidenav)
   *  4. document.scrollingElement (html or body)
   *  5. window
   */
  private _scrollCandidates(): (Element | Window)[] {
    const result: (Element | Window)[] = [];
    const tabBody = this._doc.querySelector('.mat-mdc-tab-body-active .mat-mdc-tab-body-content');
    if (tabBody) result.push(tabBody);

    const sidenavContent = this._doc.querySelector('.mat-sidenav-content');
    if (sidenavContent) result.push(sidenavContent);

    // Walk up from this component to find a scrolling ancestor
    let parent: HTMLElement | null = this._el.nativeElement.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      const ov = style.overflow + style.overflowY;
      if (ov.includes('auto') || ov.includes('scroll')) {
        if (!result.includes(parent)) result.push(parent);
        break;
      }
      parent = parent.parentElement;
    }

    if (this._doc.scrollingElement && !result.includes(this._doc.scrollingElement)) {
      result.push(this._doc.scrollingElement);
    }
    if (this._doc.documentElement && !result.includes(this._doc.documentElement)) {
      result.push(this._doc.documentElement);
    }
    const win = this._doc.defaultView;
    if (win) result.push(win);

    return result;
  }
}

