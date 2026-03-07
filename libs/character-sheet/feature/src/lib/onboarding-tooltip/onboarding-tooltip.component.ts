import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export interface OnboardingStep {
  selector: string;
  title: string;
  text: string;
  offsetX?: number;
  offsetY?: number;
}

const LS_KEY = 'cs-onboarding-dismissed';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
interface Pos {
  top: number;
  left: number;
}

@Component({
  selector: 'cs-onboarding-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgStyle, MatIcon],
  styles: [
    `
      :host {
        pointer-events: none;
      }

      .onboarding-overlay {
        position: fixed;
        inset: 0;
        z-index: 9000;
        pointer-events: none;
      }

      .onboarding-highlight {
        position: fixed;
        border-radius: 6px;
        box-shadow:
          0 0 0 3px rgba(255, 200, 60, 0.95),
          0 0 0 7px rgba(255, 200, 60, 0.35),
          0 0 24px 10px rgba(255, 200, 60, 0.2);
        animation: pulse-ring 1.6s ease-in-out infinite;
        pointer-events: none;
        transition: all 0.3s ease;
      }

      @keyframes pulse-ring {
        0%,
        100% {
          box-shadow:
            0 0 0 3px rgba(255, 200, 60, 0.95),
            0 0 0 7px rgba(255, 200, 60, 0.35),
            0 0 24px 10px rgba(255, 200, 60, 0.2);
        }
        50% {
          box-shadow:
            0 0 0 5px rgba(255, 220, 80, 1),
            0 0 0 12px rgba(255, 200, 60, 0.5),
            0 0 36px 16px rgba(255, 200, 60, 0.35);
        }
      }

      .onboarding-bubble {
        position: fixed;
        pointer-events: all;
        background: linear-gradient(135deg, #2a1a0e 0%, #3d2512 60%, #1e1209 100%);
        border: 1px solid rgba(200, 150, 60, 0.7);
        border-radius: 10px;
        padding: 14px 16px 12px;
        min-width: 250px;
        max-width: 310px;
        color: #f0ddb0;
        font-family: Georgia, serif;
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.8),
          0 0 0 1px rgba(200, 150, 60, 0.25);
        z-index: 9001;
        animation: bubble-in 0.22s ease-out;
      }

      @keyframes bubble-in {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .onboarding-bubble__close {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: rgba(200, 150, 60, 0.7);
        background: none;
        border: none;
        padding: 0;
        pointer-events: all;
        &:hover {
          color: #ffd060;
        }
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .onboarding-bubble__title {
        font-size: 13px;
        font-weight: bold;
        color: #ffd060;
        margin-bottom: 6px;
        padding-right: 22px;
      }

      .onboarding-bubble__text {
        font-size: 12px;
        line-height: 1.55;
        color: #e8ccaa;
      }

      .onboarding-bubble__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 11px;
        color: rgba(200, 150, 60, 0.7);
      }

      .onboarding-bubble__nav {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .onboarding-bubble__btn {
        background: rgba(200, 150, 40, 0.18);
        border: 1px solid rgba(200, 150, 60, 0.5);
        border-radius: 4px;
        color: #ffd060;
        font-size: 11px;
        cursor: pointer;
        padding: 3px 10px;
        font-family: Georgia, serif;
        pointer-events: all;
        transition: background 0.15s;
        &:hover {
          background: rgba(200, 150, 40, 0.38);
        }
      }

      .onboarding-hint-icon {
        position: fixed;
        pointer-events: all;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 200, 60, 0.18);
        border: 1.5px solid rgba(255, 200, 60, 0.6);
        border-radius: 50%;
        color: #ffd060;
        animation: hint-pulse 2.5s ease-in-out infinite;
        z-index: 8500;
        mat-icon {
          font-size: 13px;
          width: 13px;
          height: 13px;
        }
      }

      @keyframes hint-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(255, 200, 60, 0.5);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(255, 200, 60, 0);
        }
      }
    `,
  ],
  template: `
    @if (visible()) {
      <div class="onboarding-overlay">
        @if (hlRect) {
          <div
            class="onboarding-highlight"
            [ngStyle]="{
              top: hlRect.top - 5 + 'px',
              left: hlRect.left - 5 + 'px',
              width: hlRect.width + 10 + 'px',
              height: hlRect.height + 10 + 'px',
            }"
          ></div>
        }
        @if (bubPos && currentStep) {
          <div class="onboarding-bubble" [ngStyle]="{ top: bubPos.top + 'px', left: bubPos.left + 'px' }">
            <button class="onboarding-bubble__close" (click)="dismiss()">
              <mat-icon>close</mat-icon>
            </button>
            <div class="onboarding-bubble__title">{{ currentStep.title }}</div>
            <div class="onboarding-bubble__text">{{ currentStep.text }}</div>
            <div class="onboarding-bubble__footer">
              <span>{{ stepIndex() + 1 }} / {{ steps().length }}</span>
              <div class="onboarding-bubble__nav">
                @if (stepIndex() > 0) {
                  <button class="onboarding-bubble__btn" (click)="prev()">‹ Zpět</button>
                }
                @if (stepIndex() < steps().length - 1) {
                  <button class="onboarding-bubble__btn" (click)="next()">Další ›</button>
                } @else {
                  <button class="onboarding-bubble__btn" (click)="dismiss()">Rozumím ✓</button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }

    @if (showHint() && !visible()) {
      <div
        class="onboarding-hint-icon"
        [ngStyle]="
          hintFixedPos ? { top: hintFixedPos.top + 'px', left: hintFixedPos.left + 'px' } : { top: '330px', left: '68px' }
        "
        (click)="reopen()"
        title="Zobrazit nápovědu pro vyplňování schopností"
      >
        <mat-icon>help_outline</mat-icon>
      </div>
    }
  `,
})
export class CsOnboardingTooltipComponent implements OnInit, OnDestroy {
  steps = input.required<OnboardingStep[]>();

  dismissed = output<void>();

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  readonly stepIndex = signal(0);
  readonly visible = signal(false);
  readonly showHint = signal(false);

  get currentStep() {
    return this.steps()[this.stepIndex()];
  }

  hlRect: Rect | null = null;
  bubPos: Pos | null = null;
  hintFixedPos: Pos | null = null;

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const alreadyDismissed = localStorage.getItem(LS_KEY) === '1';
    if (!alreadyDismissed) {
      // Poll until the first target element appears in DOM (sub-components use @if(_tick))
      let attempts = 0;
      this.pollTimer = setInterval(() => {
        attempts++;
        const el = document.querySelector<HTMLElement>(this.steps()[0]?.selector);
        if (el || attempts > 40) {
          clearInterval(this.pollTimer!);
          this.pollTimer = null;
          this._lockScroll();
          this.visible.set(true);
          this.showHint.set(true);
          this._updateRects();
          this.cdr.markForCheck();
        }
      }, 150);
    } else {
      this.showHint.set(true);
      setTimeout(() => {
        this._updateHintPos();
        this.cdr.markForCheck();
      }, 600);
    }
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this._unlockScroll();
  }

  private _lockScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  private _unlockScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  private _updateRects() {
    const step = this.currentStep;
    if (!step) return;
    const el = document.querySelector<HTMLElement>(step.selector);
    if (!el) {
      this.hlRect = null;
      this.bubPos = null;
      return;
    }

    const r = el.getBoundingClientRect();
    this.hlRect = { top: r.top, left: r.left, width: r.width, height: r.height };

    const offX = step.offsetX ?? 0;
    const offY = step.offsetY ?? 0;
    const bubLeft = r.right + 14 + offX;
    const bubTop = r.top + offY;

    if (bubLeft + 320 > window.innerWidth) {
      this.bubPos = { top: r.bottom + 8 + offY, left: Math.max(4, r.left - 60 + offX) };
    } else {
      this.bubPos = { top: bubTop, left: bubLeft };
    }
  }

  private _updateHintPos() {
    const el = document.querySelector<HTMLElement>(this.steps()[0]?.selector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.hintFixedPos = { top: r.top - 14, left: r.left - 16 };
  }

  next() {
    this.stepIndex.update(i => Math.min(i + 1, this.steps().length - 1));
    this._updateRects();
    this.cdr.markForCheck();
  }

  prev() {
    this.stepIndex.update(i => Math.max(i - 1, 0));
    this._updateRects();
    this.cdr.markForCheck();
  }

  dismiss() {
    this.visible.set(false);
    this._unlockScroll();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LS_KEY, '1');
    }
    this._updateHintPos();
    this.dismissed.emit();
    this.cdr.markForCheck();
  }

  reopen() {
    this.stepIndex.set(0);
    this._lockScroll();
    this._updateRects();
    this.visible.set(true);
    this.cdr.markForCheck();
  }
}
