import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICONS, IconName } from './icons';

let nextId = 0;

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
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="24">
          <stop offset="0" stop-color="rgba(255,255,255,0.95)" />
          <stop offset="1" stop-color="rgba(255,255,255,0.45)" />
        </linearGradient>
      </defs>

      <g fill="none" [attr.stroke]="'url(#' + gradientId + ')'">
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
      filter: drop-shadow(0 1px 0 rgba(2, 6, 23, 0.15));
    }

    .app-icon__svg {
      display: block;
    }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;
  @Input() title?: string;
  @Input() decorative = false;

  private readonly uid = `app-icon-${++nextId}`;

  get icon() {
    return ICONS[this.name] ?? ICONS.home;
  }

  get gradientId() {
    return `${this.uid}-g`;
  }

  get label() {
    return String(this.title ?? this.name);
  }
}
