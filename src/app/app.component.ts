import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FinanceStoreService } from './data/finance-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <div class="app">
      <app-nav />
      <router-outlet />
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor(private readonly store: FinanceStoreService) {}

  ngOnInit(): void {
    void this.store.initStore();
  }
}
