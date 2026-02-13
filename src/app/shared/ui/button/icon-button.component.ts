import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

export type IconButtonVariant = 'neutral' | 'primary' | 'success' | 'danger';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon-button',
    '[attr.data-variant]': 'variant',
    '[style.--app-icon-btn-size.px]': 'size',
  },
  template: `
    <button
      class="app-icon-button__btn"
      [attr.type]="type"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
    >
      <span class="app-icon-button__glint" aria-hidden="true"></span>
      <app-icon [name]="icon" [size]="iconSize" [decorative]="true" />
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .app-icon-button__btn {
      position: relative;
      width: var(--app-icon-btn-size, 36px);
      height: var(--app-icon-btn-size, 36px);
      border-radius: 10px;
      border: 1px solid var(--plastic-border, rgba(0, 0, 0, 0.12));
      background:
        linear-gradient(
          to bottom,
          rgba(249, 250, 251, 1),
          rgba(229, 231, 235, 1)
        );
      color: rgba(75, 85, 99, 0.98);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 1px 3px rgba(0, 0, 0, 0.14);
      transition: transform 140ms ease, filter 140ms ease, box-shadow 140ms ease;
      overflow: hidden;
    }

    .app-icon-button__glint {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(120% 90% at 18% 12%, rgba(255, 255, 255, 0.55), transparent 42%),
        radial-gradient(80% 60% at 75% 10%, rgba(255, 255, 255, 0.22), transparent 45%);
      pointer-events: none;
      opacity: 0.75;
      transition: opacity 140ms ease;
    }

    :host([data-variant='primary']) .app-icon-button__btn {
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue, #3b82f6),
          var(--accent-blue-dark, #1d4ed8)
        );
      border-color: color-mix(in srgb, var(--accent-blue-dark, #1d4ed8) 80%, transparent);
      color: rgba(255, 255, 255, 0.96);
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(59, 130, 246, 0.55);
    }

	    :host([data-variant='success']) .app-icon-button__btn {
	      background:
	        linear-gradient(
	          to bottom,
	          var(--accent-green-bright, #34d399),
	          var(--accent-green, #10b981)
	        );
	      border-color: color-mix(in srgb, var(--accent-green-dark, #059669) 70%, transparent);
	      color: rgba(255, 255, 255, 0.96);
	      box-shadow:
	        inset 0 1px 2px rgba(255, 255, 255, 0.5),
	        0 2px 8px rgba(16, 185, 129, 0.55);
	    }

    :host([data-variant='danger']) .app-icon-button__btn {
      background:
        linear-gradient(
          to bottom,
          var(--danger-soft, #f87171),
          var(--danger, #ef4444)
        );
      border-color: color-mix(in srgb, var(--danger-dark, #dc2626) 70%, transparent);
      color: rgba(255, 255, 255, 0.96);
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(239, 68, 68, 0.45);
    }

    .app-icon-button__btn:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: saturate(1.06);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 2px 6px rgba(0, 0, 0, 0.16);
    }

    :host([data-variant='primary']) .app-icon-button__btn:hover:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue-soft, #60a5fa),
          var(--accent-blue, #3b82f6)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.55),
        0 3px 12px rgba(59, 130, 246, 0.6);
    }

    :host([data-variant='success']) .app-icon-button__btn:hover:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--accent-green-soft, #6ee7b7),
          var(--accent-green-bright, #34d399)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 3px 12px rgba(16, 185, 129, 0.6);
    }

    :host([data-variant='danger']) .app-icon-button__btn:hover:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--danger-soft, #f87171) 70%, white 30%),
          var(--danger-soft, #f87171)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.55),
        0 3px 12px rgba(239, 68, 68, 0.55);
    }

    .app-icon-button__btn:hover:not(:disabled) .app-icon-button__glint {
      opacity: 0.95;
    }

    .app-icon-button__btn:active:not(:disabled) {
      transform: translateY(0);
      filter: saturate(1.04);
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.16),
        0 1px 2px rgba(0, 0, 0, 0.14);
    }

    :host([data-variant='primary']) .app-icon-button__btn:active:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue-dark, #1d4ed8),
          var(--accent-blue-darker, #1e40af)
        );
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(59, 130, 246, 0.3);
    }

    :host([data-variant='success']) .app-icon-button__btn:active:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--accent-green, #10b981),
          var(--accent-green-dark, #059669)
        );
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.22),
        0 1px 3px rgba(16, 185, 129, 0.26);
    }

    :host([data-variant='danger']) .app-icon-button__btn:active:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--danger, #ef4444),
          var(--danger-dark, #dc2626)
        );
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.22),
        0 1px 3px rgba(239, 68, 68, 0.26);
    }

    .app-icon-button__btn:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--accent-blue, #3b82f6) 22%, transparent),
        0 0 0 6px color-mix(in srgb, var(--accent-blue, #3b82f6) 12%, transparent),
        inset 0 1px 1px rgba(255, 255, 255, 0.8),
        0 1px 3px rgba(0, 0, 0, 0.14);
    }

    .app-icon-button__btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      filter: grayscale(0.1);
      transform: none;
    }
  `,
})
export class IconButtonComponent {
  @Input({ required: true }) icon!: IconName;
  @Input() ariaLabel = '';
  @Input() variant: IconButtonVariant = 'neutral';
  @Input() size = 36;
  @Input() iconSize = 18;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
