import { Component } from '@angular/core';
import { FinanceStoreService } from '../../data/finance-store.service';

type CategorySummary = {
  name: string;
  total: number;
};

@Component({
  selector: 'app-dashboards',
  standalone: true,
  template: `
    <main class="page">
      <header>
        <p class="eyebrow">Раздел</p>
        <h1>Дашборды</h1>
        <p>Собирайте ключевые показатели и наблюдайте динамику.</p>
      </header>

      <section class="card">
        <h2>Баланс</h2>
        <p>Общая сумма операций: {{ totalBalance.toFixed(2) }}</p>
      </section>

      <section class="card">
        <h2>Топ категорий</h2>
        <p *ngIf="topCategories.length === 0">Пока нет операций.</p>
        <ul *ngIf="topCategories.length > 0">
          <li *ngFor="let item of topCategories">
            {{ item.name }}: {{ item.total.toFixed(2) }}
          </li>
        </ul>
      </section>

      <section class="card">
        <h2>Сравнение месяцев</h2>
        <p *ngIf="!currentMonth">Нет данных для сравнения.</p>
        <ng-container *ngIf="currentMonth">
          <p>{{ currentMonth }}: {{ monthlyTotals[currentMonth].toFixed(2) }}</p>
          <p *ngIf="previousMonth">
            {{ previousMonth }}: {{ monthlyTotals[previousMonth].toFixed(2) }}
          </p>
        </ng-container>
      </section>
    </main>
  `,
})
export class DashboardsComponent {
  readonly categories = this.store.categories;
  readonly transactions = this.store.transactions;

  constructor(private readonly store: FinanceStoreService) {}

  get totalBalance() {
    return this.transactions().reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  get topCategories(): CategorySummary[] {
    const categoryMap = new Map(this.categories().map((category) => [category.id, category]));
    const categoryTotals = this.transactions().reduce((acc, transaction) => {
      const total = acc.get(transaction.categoryId) ?? 0;
      acc.set(transaction.categoryId, total + transaction.amount);
      return acc;
    }, new Map<string, number>());

    return Array.from(categoryTotals.entries())
      .map(([categoryId, total]) => ({
        name: categoryMap.get(categoryId)?.name ?? 'Без категории',
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  get monthlyTotals() {
    return this.transactions().reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.date.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + transaction.amount;
      return acc;
    }, {});
  }

  get sortedMonths() {
    return Object.keys(this.monthlyTotals).sort();
  }

  get currentMonth() {
    return this.sortedMonths.at(-1);
  }

  get previousMonth() {
    return this.sortedMonths.at(-2);
  }
}
