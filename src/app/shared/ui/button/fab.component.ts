import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-fab',
  },
  template: `
    <button
      class="app-fab__btn"
      type="button"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
    >
      <span class="app-fab__ring" aria-hidden="true"></span>
      <app-icon [name]="icon" [size]="22" [decorative]="true" />
    </button>
  `,
  styles: `
    :host {
      position: fixed;
      right: 18px;
      bottom: calc(18px + var(--app-bottom-inset, 0px));
      z-index: 40;
      display: inline-flex;
    }

    .app-fab__btn {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--accent-green-dark, #059669) 70%, transparent);
      background:
        linear-gradient(
          to bottom,
          var(--accent-green-bright, #34d399),
          var(--accent-green, #10b981)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(16, 185, 129, 0.5),
        0 18px 34px rgba(0, 0, 0, 0.18);
      cursor: pointer;
      color: rgba(6, 78, 59, 0.96);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
      transition:
        transform 140ms ease,
        filter 140ms ease,
        box-shadow 140ms ease;
      overflow: hidden;
    }

    .app-fab__ring {
      position: absolute;
      inset: -8px;
      border-radius: 999px;
      background:
        radial-gradient(
          55% 55% at 30% 20%,
          rgba(255, 255, 255, 0.38),
          transparent 55%
        );
      opacity: 0.8;
      pointer-events: none;
      transition: opacity 140ms ease;
    }

    .app-fab__btn:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: saturate(1.05);
    }

    .app-fab__btn:hover:not(:disabled) .app-fab__ring {
      opacity: 1;
    }

    .app-fab__btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(2, 6, 23, 0.34),
        0 14px 28px rgba(2, 6, 23, 0.14);
    }

    .app-fab__btn:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--accent-blue, #3b82f6) 22%, transparent),
        0 0 0 8px color-mix(in srgb, var(--accent-blue, #3b82f6) 12%, transparent),
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(16, 185, 129, 0.45),
        0 18px 34px rgba(0, 0, 0, 0.18);
    }

    .app-fab__btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      filter: grayscale(0.15);
    }
  `,
})
export class FabComponent {
  @Input() icon: IconName = 'plus';
  @Input() ariaLabel = 'Добавить трату';
  @Input() disabled = false;
}
