import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconName } from '../../shared/ui/icon/icons';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="app-nav glass-surface" aria-label="Основная навигация">
      <a
        *ngFor="let item of items; trackBy: trackItem"
        class="app-nav__item"
        [routerLink]="item.path"
        routerLinkActive="is-active"
        [routerLinkActiveOptions]="{ exact: item.exact }"
        [attr.aria-label]="item.label"
      >
        <span class="app-nav__icon" aria-hidden="true">
          <app-icon [name]="item.icon" [size]="18" [decorative]="true" />
        </span>
        <span class="app-nav__label">{{ item.label }}</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .app-nav {
      display: grid;
      gap: 0.35rem;
      padding: 0.75rem;
    }

    .app-nav__item {
      display: grid;
      grid-template-columns: 26px 1fr;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.75rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: color-mix(in srgb, var(--text, #0b1020) 86%, transparent);
      text-decoration: none;
      font-weight: 650;
      letter-spacing: 0.01em;
      background: rgba(255, 255, 255, 0.08);
      transition: transform 140ms ease, filter 140ms ease, background 140ms ease, border-color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .app-nav__item:hover {
      filter: saturate(1.03);
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.32);
    }

    .app-nav__item:active {
      transform: translateY(1px);
    }

    .app-nav__icon {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background:
        linear-gradient(to bottom, rgba(255, 255, 255, 0.55), rgba(231, 243, 255, 0.22));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 0 rgba(2, 6, 23, 0.08);
    }

    .app-nav__label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-nav__item.is-active {
      background:
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.78),
          rgba(214, 233, 255, 0.64)
        );
      border-color: rgba(255, 255, 255, 0.55);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1px 0 rgba(2, 6, 23, 0.1),
        0 12px 24px rgba(2, 6, 23, 0.14);
      color: rgba(11, 16, 32, 0.92);
    }

    .app-nav__item.is-active .app-nav__icon {
      background:
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--accent-blue, #2b7cff) 18%, white 82%),
          rgba(214, 233, 255, 0.7)
        );
      border-color: rgba(255, 255, 255, 0.62);
    }

    @media (min-width: 700px) {
      .app-nav {
        position: sticky;
        top: var(--page-pad);
        height: calc(100dvh - (var(--page-pad) * 2));
        align-content: start;
      }
    }

    @media (max-width: 699.98px) {
      .app-nav {
        position: fixed;
        left: 12px;
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom));
        height: var(--bottom-nav-h);
        padding: 0.55rem 0.65rem;
        border-radius: 22px;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: 0.55rem;
        z-index: 35;
      }

      .app-nav__item {
        grid-template-columns: 1fr;
        grid-template-rows: 28px auto;
        justify-items: center;
        gap: 0.25rem;
        padding: 0.4rem 0.35rem;
        border-radius: 16px;
        font-size: 0.72rem;
        font-weight: 700;
      }

      .app-nav__label {
        font-size: 0.7rem;
        letter-spacing: 0.02em;
      }
    }
  `,
})
export class NavComponent {
  readonly items: Array<{ path: string; label: string; icon: IconName; exact: boolean }> = [
    { path: '/', label: 'Главная', icon: 'home', exact: true },
    { path: '/categories', label: 'Категории', icon: 'categories', exact: false },
    { path: '/dashboards', label: 'Дашборды', icon: 'dashboard', exact: false },
  ];

  trackItem(_: number, item: { path: string }) {
    return item.path;
  }
}
