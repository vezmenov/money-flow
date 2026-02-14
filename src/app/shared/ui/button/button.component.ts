import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button',
    '[attr.data-variant]': 'variant',
    '[attr.data-size]': 'size',
    '[attr.data-selected]': 'selected ? \"true\" : null',
  },
  template: `
    <button
      class="app-button__btn"
      [attr.type]="type"
      [attr.form]="form || null"
      [attr.data-e2e]="e2e || null"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-pressed]="selected ? 'true' : null"
    >
      <span class="app-button__glint" aria-hidden="true"></span>
      <span class="app-button__content">
        <ng-content />
      </span>
      <span *ngIf="loading" class="app-button__spinner" aria-hidden="true"></span>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .app-button__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      border-radius: var(--radius-control, 12px);
      border: 1px solid rgba(0, 0, 0, 0.15);
      font: inherit;
      font-weight: 650;
      letter-spacing: 0.01em;
      color: color-mix(in srgb, var(--text, #1a1a2e) 92%, transparent);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.75),
        0 1px 3px rgba(0, 0, 0, 0.12);
      transition:
        transform 140ms ease,
        box-shadow 140ms ease,
        filter 140ms ease;
      overflow: hidden;
    }

    .app-button__glint {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(120% 90% at 18% 12%, rgba(255, 255, 255, 0.55), transparent 42%),
        radial-gradient(80% 60% at 75% 10%, rgba(255, 255, 255, 0.25), transparent 45%);
      pointer-events: none;
      opacity: 0.7;
      transition: opacity 140ms ease;
    }

    :host([data-variant='primary']) .app-button__btn {
      color: rgba(255, 255, 255, 0.95);
      border-color: color-mix(in srgb, var(--accent-blue-dark, #1d4ed8) 80%, transparent);
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue, #3b82f6),
          var(--accent-blue-dark, #1d4ed8)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(59, 130, 246, 0.5);
    }

    :host([data-variant='danger']) .app-button__btn {
      color: rgba(255, 255, 255, 0.95);
      border-color: color-mix(in srgb, var(--danger-dark, #dc2626) 70%, transparent);
      background:
        linear-gradient(
          to bottom,
          var(--danger-soft, #f87171),
          var(--danger, #ef4444)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.45),
        0 2px 8px rgba(239, 68, 68, 0.45);
    }

    :host([data-variant='secondary']) .app-button__btn {
      background:
        linear-gradient(
          to bottom,
          var(--plastic-bg-top, #f3f4f6),
          var(--plastic-bg-bot, #e5e7eb)
        );
      border-color: rgba(0, 0, 0, 0.12);
      color: rgba(55, 65, 81, 0.95);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.75),
        0 1px 3px rgba(0, 0, 0, 0.12);
    }

    :host([data-variant='ghost']) .app-button__btn {
      background: rgba(255, 255, 255, 0.22);
      border-color: rgba(255, 255, 255, 0.45);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.7),
        0 1px 3px rgba(0, 0, 0, 0.08);
    }

    :host([data-selected='true']) .app-button__btn {
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue, #3b82f6),
          var(--accent-blue-dark, #1d4ed8)
        );
      border-color: color-mix(in srgb, var(--accent-blue-dark, #1d4ed8) 80%, transparent);
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(59, 130, 246, 0.5);
      color: rgba(255, 255, 255, 0.96);
    }

    :host([data-size='sm']) .app-button__btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
      border-radius: var(--radius-control, 12px);
    }

    :host([data-size='md']) .app-button__btn {
      padding: 0.65rem 1rem;
      font-size: 0.95rem;
    }

    :host([data-size='lg']) .app-button__btn {
      padding: 0.8rem 1.1rem;
      font-size: 1rem;
    }

    .app-button__btn:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: saturate(1.05);
    }

    :host([data-variant='primary']) .app-button__btn:hover:not(:disabled),
    :host([data-selected='true']) .app-button__btn:hover:not(:disabled) {
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

    :host([data-variant='danger']) .app-button__btn:hover:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--danger-soft, #f87171) 75%, white 25%),
          var(--danger-soft, #f87171)
        );
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 3px 12px rgba(239, 68, 68, 0.55);
    }

    .app-button__btn:hover:not(:disabled) .app-button__glint {
      opacity: 0.9;
    }

    .app-button__btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.16),
        0 1px 2px rgba(0, 0, 0, 0.14);
    }

    :host([data-variant='primary']) .app-button__btn:active:not(:disabled),
    :host([data-selected='true']) .app-button__btn:active:not(:disabled) {
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

    :host([data-variant='danger']) .app-button__btn:active:not(:disabled) {
      background:
        linear-gradient(
          to bottom,
          var(--danger, #ef4444),
          var(--danger-dark, #dc2626)
        );
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.28),
        0 1px 3px rgba(239, 68, 68, 0.25);
    }

    .app-button__btn:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--accent-blue, #3b82f6) 26%, transparent),
        0 0 0 6px color-mix(in srgb, var(--accent-blue, #3b82f6) 14%, transparent),
        inset 0 1px 1px rgba(255, 255, 255, 0.7),
        0 1px 3px rgba(0, 0, 0, 0.16);
    }

    .app-button__btn:disabled {
      cursor: not-allowed;
      opacity: 0.58;
      filter: grayscale(0.1);
      transform: none;
    }

    .app-button__content {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .app-button__spinner {
      position: relative;
      z-index: 1;
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 2px solid rgba(0, 0, 0, 0.22);
      border-top-color: rgba(0, 0, 0, 0.06);
      animation: app-button-spin 700ms linear infinite;
    }

    :host([data-variant='primary']) .app-button__spinner,
    :host([data-selected='true']) .app-button__spinner,
    :host([data-variant='danger']) .app-button__spinner {
      border-color: rgba(255, 255, 255, 0.6);
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    @keyframes app-button-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() form = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() selected = false;
  @Input() ariaLabel = '';
  @Input() e2e = '';
}
