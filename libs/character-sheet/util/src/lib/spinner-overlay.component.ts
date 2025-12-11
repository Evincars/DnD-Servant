import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'spinner-overlay',
  template: `
    <div class="content" [class.filled]="filled() && showSpinner()">
      <ng-content />
    </div>
    @if (showSpinner()) {
      <div class="overlay" [class.round]="round()" [class.no-background]="filled()"></div>
    }
    @if (showSpinner()) {
      <mat-spinner [diameter]="diameter()" />
    }
  `,
  styles: `
    :host {
      position: relative;
    }

    .content {
      height: 100%;
      position: relative;
      z-index: 0;

      &.filled {
        opacity: 0;
      }
    }

    .overlay {
      background-color: hsl(from #bbb h s l / 0.4);
      inset: 0;
      position: absolute;

      &.no-background {
        background-color: unset;
      }

      &.round {
        border-radius: 50%;
      }
    }

    mat-spinner {
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
})
export class SpinnerOverlayComponent {
  showSpinner = input<boolean | null>(false);
  diameter = input(20);
  filled = input(false);
  round = input(false);
}
