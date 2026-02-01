import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" aria-label="Основная навигация">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        Главная
      </a>
      <a routerLink="/categories" routerLinkActive="active">Категории</a>
      <a routerLink="/dashboards" routerLinkActive="active">Дашборды</a>
    </nav>
  `,
})
export class NavComponent {}
