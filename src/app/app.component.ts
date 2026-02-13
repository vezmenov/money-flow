import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FinanceStoreService } from './data/finance-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <div class="app-layout">
      <div class="app-frame">
        <app-nav />
        <main class="app-main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor(private readonly store: FinanceStoreService) {}

  ngOnInit(): void {
    void this.store.initStore().catch((error) => {
      console.error('Failed to initialize finance store', error);
    });
  }
}
