import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FinanceStoreService } from '../../data/finance-store.service';
import {
  filterExpenseTransactions,
  formatMoney,
  groupExpensesByCategory,
} from '../../features/dashboard/dashboard.selectors';
import { BarChartComponent } from '../../shared/charts/bar-chart.component';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [NgIf, NgFor, BarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="dashboards">
      <header class="glass-header dashboards__header">
        <p class="glass-header__eyebrow">Раздел</p>
        <h1 class="glass-header__title">Дашборды</h1>
        <p class="glass-header__subtitle">
          Дополнительная витрина: месяцы и топ категорий. Главный дашборд живет на “Главной”.
        </p>
      </header>

      <section class="glass-surface dashboards__card">
        <header class="dashboards__card-header">
          <h2 class="dashboards__card-title">Месяцы (последние 6)</h2>
          <p class="dashboards__card-hint">Только траты, без конвертации валют.</p>
        </header>
        <app-bar-chart
          [labels]="monthLabels()"
          [values]="monthValues()"
          [colors]="monthColors()"
          ariaLabel="Траты по месяцам"
          [height]="240"
        />
      </section>

      <section class="glass-surface dashboards__card">
        <header class="dashboards__card-header">
          <h2 class="dashboards__card-title">Топ категорий (все время)</h2>
          <p class="dashboards__card-hint">Если данных нет, добавь трату на главной через “+”.</p>
        </header>

        <p class="dashboards__empty" *ngIf="topCategories().length === 0">Пока нет операций.</p>
        <ul class="dashboards__list" *ngIf="topCategories().length > 0">
          <li class="dashboards__item" *ngFor="let item of topCategories(); trackBy: trackItem">
            <span class="dashboards__dot" [style.background]="dot(item.color)" aria-hidden="true"></span>
            <span class="dashboards__name">{{ item.label }}</span>
            <span class="dashboards__value">{{ format(item.total) }}</span>
          </li>
        </ul>
      </section>
    </main>
  `,
  styles: `
    .dashboards {
      display: grid;
      gap: 18px;
    }

    .dashboards__card {
      padding: 14px;
      display: grid;
      gap: 12px;
    }

    .dashboards__card-header {
      display: grid;
      gap: 4px;
    }

    .dashboards__card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: -0.01em;
    }

    .dashboards__card-hint {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 58%, transparent);
      font-size: 0.9rem;
    }

    .dashboards__empty {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 62%, transparent);
      font-weight: 700;
    }

    .dashboards__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    .dashboards__item {
      display: grid;
      grid-template-columns: 14px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.12);
    }

    .dashboards__dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.65);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    .dashboards__name {
      font-weight: 850;
      letter-spacing: -0.01em;
      color: rgba(11, 16, 32, 0.92);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dashboards__value {
      font-weight: 950;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class DashboardsComponent {
  readonly categories = this.store.categories;
  readonly transactions = this.store.transactions;

  constructor(private readonly store: FinanceStoreService) {}

  readonly expenses = computed(() => filterExpenseTransactions(this.transactions(), this.categories()));

  readonly monthSeries = computed(() => {
    const map = this.expenses().reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.date.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + transaction.amount;
      return acc;
    }, {});

    const months = Object.keys(map).sort().slice(-6);
    return {
      labels: months.map((m) => `${m.slice(5)}.${m.slice(0, 4)}`),
      values: months.map((m) => map[m] ?? 0),
    };
  });

  readonly monthLabels = computed(() => this.monthSeries().labels);
  readonly monthValues = computed(() => this.monthSeries().values);
  readonly monthColors = computed(() =>
    this.monthSeries().values.map(() => 'rgba(46, 229, 143, 0.72)'),
  );

  readonly topCategories = computed(() => groupExpensesByCategory(this.expenses(), this.categories(), 5));

  format(amount: number) {
    return formatMoney(amount, this.expenses().at(0)?.currency ?? 'RUB');
  }

  dot(color?: string) {
    return `radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.65), transparent 55%), ${
      color ?? '#94a3b8'
    }`;
  }

  trackItem(_: number, item: { label: string }) {
    return item.label;
  }
}
