import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICONS, IconName } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon',
    '[style.--app-icon-size.px]': 'size',
  },
  template: `
    <svg
      class="app-icon__svg"
      [attr.width]="size"
      [attr.height]="size"
      [attr.viewBox]="icon.viewBox"
      [attr.role]="decorative ? 'presentation' : 'img'"
      [attr.aria-hidden]="decorative ? 'true' : null"
      [attr.aria-label]="!decorative ? label : null"
      focusable="false"
    >
      <g class="app-icon__stroke" fill="none" stroke="currentColor">
        <path
          *ngFor="let d of icon.paths"
          [attr.d]="d"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      <g
        class="app-icon__highlight"
        aria-hidden="true"
        fill="none"
        stroke="rgba(255, 255, 255, 0.36)"
        transform="translate(0,-0.4)"
      >
        <path
          *ngFor="let d of icon.paths"
          [attr.d]="d"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--app-icon-size, 18px);
      height: var(--app-icon-size, 18px);
      color: inherit;
      filter:
        drop-shadow(0 1px 0 rgba(255, 255, 255, 0.18))
        drop-shadow(0 1px 0 rgba(2, 6, 23, 0.12));
    }

    .app-icon__svg {
      display: block;
    }

    .app-icon__stroke {
      opacity: 0.92;
    }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;
  @Input() title?: string;
  @Input() decorative = false;

  get icon() {
    return ICONS[this.name] ?? ICONS.home;
  }

  get label() {
    return String(this.title ?? this.name);
  }
}
