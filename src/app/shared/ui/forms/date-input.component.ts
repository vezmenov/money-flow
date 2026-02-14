import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputDirective } from './input.directive';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      appInput
      class="app-date-input"
      type="date"
      [attr.aria-label]="ariaLabel || null"
      [attr.data-e2e]="e2e || null"
      [attr.name]="name || null"
      [attr.min]="min || null"
      [attr.max]="max || null"
      [disabled]="isDisabled"
      [value]="value"
      (input)="handleInput($event)"
      (blur)="onTouched()"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() name = '';
  @Input() min = '';
  @Input() max = '';
  @Input() ariaLabel = '';
  @Input() e2e = '';

  value = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = typeof value === 'string' ? value : '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const nextValue = String(target?.value ?? '');
    this.value = nextValue;
    this.onChange(nextValue);
  }
}
