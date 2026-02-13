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
      border-radius: var(--radius-control, 12px);
      border: 1px solid var(--plastic-border, rgba(0, 0, 0, 0.12));
      color: color-mix(in srgb, var(--text, #1a1a2e) 78%, transparent);
      text-decoration: none;
      font-weight: 650;
      letter-spacing: 0.01em;
      background:
        linear-gradient(
          to bottom,
          var(--plastic-bg-top, #f3f4f6),
          var(--plastic-bg-bot, #e5e7eb)
        );
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.75),
        0 1px 2px rgba(0, 0, 0, 0.08);
      transition:
        transform 140ms ease,
        filter 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease,
        border-color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .app-nav__item:hover {
      filter: saturate(1.03);
      transform: translateY(-1px);
      background:
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 1),
          var(--plastic-bg-bot, #e5e7eb)
        );
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.85),
        0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .app-nav__item:active {
      transform: translateY(0);
    }

    .app-nav__icon {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      background:
        linear-gradient(
          to bottom,
          rgba(249, 250, 251, 1),
          rgba(229, 231, 235, 1)
        );
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.8),
        0 1px 3px rgba(0, 0, 0, 0.1);
      color: rgba(26, 26, 46, 0.9);
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
          var(--accent-blue, #3b82f6),
          var(--accent-blue-dark, #1d4ed8)
        );
      border-color: color-mix(in srgb, var(--accent-blue-dark, #1d4ed8) 80%, transparent);
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        0 2px 8px rgba(59, 130, 246, 0.6);
      color: rgba(255, 255, 255, 0.96);
    }

    .app-nav__item.is-active .app-nav__icon {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.22);
      color: rgba(255, 255, 255, 0.96);
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
