import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-field-host',
  },
  template: `
    <label class="app-field">
      <span *ngIf="label" class="app-field__label">{{ label }}</span>
      <div class="app-field__control">
        <ng-content />
      </div>
      <div *ngIf="hint && !error" class="app-field__hint">{{ hint }}</div>
      <div *ngIf="error" class="app-field__error">{{ error }}</div>
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .app-field {
      display: grid;
      gap: 0.5rem;
      color: var(--text, #0b1020);
    }

    .app-field__label {
      font-size: 0.9rem;
      font-weight: 650;
      letter-spacing: 0.01em;
      color: color-mix(in srgb, var(--text, #0b1020) 84%, transparent);
    }

    .app-field__hint {
      font-size: 0.85rem;
      color: color-mix(in srgb, var(--text, #0b1020) 55%, transparent);
    }

    .app-field__error {
      font-size: 0.85rem;
      color: color-mix(in srgb, var(--danger, #ef4444) 80%, var(--text, #0b1020) 20%);
      font-weight: 650;
    }
  `,
})
export class FieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
}

