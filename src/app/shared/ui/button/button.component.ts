import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
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
      border: 1px solid rgba(255, 255, 255, 0.55);
      font: inherit;
      font-weight: 650;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1px 0 rgba(2, 6, 23, 0.12),
        var(--shadow-ambient, 0 10px 22px rgba(2, 6, 23, 0.12));
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
      border-color: rgba(255, 255, 255, 0.3);
      background:
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--accent-blue, #2b7cff) 92%, white 8%),
          color-mix(in srgb, var(--accent-blue, #2b7cff) 82%, black 18%)
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 -1px 0 rgba(2, 6, 23, 0.25),
        0 18px 34px rgba(24, 75, 170, 0.22),
        var(--shadow-ambient, 0 10px 22px rgba(2, 6, 23, 0.12));
    }

    :host([data-variant='secondary']) .app-button__btn {
      background:
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.82),
          rgba(230, 240, 255, 0.66)
        );
    }

    :host([data-variant='ghost']) .app-button__btn {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.42);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        inset 0 -1px 0 rgba(2, 6, 23, 0.08);
    }

    :host([data-selected='true']) .app-button__btn {
      background:
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.86),
          rgba(214, 233, 255, 0.74)
        );
      border-color: rgba(255, 255, 255, 0.62);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        inset 0 -1px 0 rgba(2, 6, 23, 0.12),
        0 10px 22px rgba(2, 6, 23, 0.12);
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

    .app-button__btn:hover:not(:disabled) .app-button__glint {
      opacity: 0.9;
    }

    .app-button__btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(2, 6, 23, 0.18),
        0 9px 18px rgba(2, 6, 23, 0.1);
    }

    .app-button__btn:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px rgba(43, 124, 255, 0.24),
        0 0 0 6px rgba(43, 124, 255, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1px 0 rgba(2, 6, 23, 0.12);
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
      border: 2px solid rgba(255, 255, 255, 0.55);
      border-top-color: rgba(255, 255, 255, 0.05);
      animation: app-button-spin 700ms linear infinite;
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
}
