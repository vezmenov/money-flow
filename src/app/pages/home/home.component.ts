import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService, Transaction } from '../../data/finance-store.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="app">
      <section class="card form-card">
        <h2>Добавить операцию</h2>
        <form class="entry-form" (ngSubmit)="handleSubmit()">
          <label class="field">
            <span class="field-label">Категория</span>
            <select name="category" [(ngModel)]="selectedCategoryId">
              <option *ngIf="categories().length === 0" value="" disabled>Нет категорий</option>
              <option *ngFor="let category of categories()" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">Сумма</span>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              [(ngModel)]="amount"
            />
          </label>

          <label class="field">
            <span class="field-label">Дата</span>
            <input name="date" type="date" [(ngModel)]="transactionDate" />
          </label>

          <label class="field">
            <span class="field-label">Валюта</span>
            <select name="currency" [(ngModel)]="currency">
              <option *ngFor="let item of currencies" [value]="item">{{ item }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">Заметка</span>
            <textarea
              name="note"
              rows="3"
              placeholder="Короткий комментарий"
              [(ngModel)]="note"
            ></textarea>
          </label>

          <button class="primary-button" type="submit">Сохранить</button>
        </form>
      </section>

      <section class="card">
        <h2>Траты за период</h2>
        <div class="entry-form">
          <label class="field">
            <span class="field-label">С</span>
            <input name="periodStart" type="date" [(ngModel)]="periodStart" />
          </label>
          <label class="field">
            <span class="field-label">По</span>
            <input name="periodEnd" type="date" [(ngModel)]="periodEnd" />
          </label>
        </div>

        <ng-container *ngIf="filteredTransactions.length === 0; else transactionsList">
          <p>За выбранный период операций нет.</p>
        </ng-container>
        <ng-template #transactionsList>
          <ul>
            <li *ngFor="let transaction of filteredTransactions; trackBy: trackTransaction">
              {{ transaction.date }} ·
              {{ categoryMap.get(transaction.categoryId)?.name ?? 'Без категории' }} ·
              {{ transaction.amount.toFixed(2) }} {{ transaction.currency }}
            </li>
          </ul>
        </ng-template>
      </section>
    </main>
  `,
})
export class HomeComponent {
  readonly currencies = ['RUB', 'USD', 'EUR'];
  readonly categories = this.store.categories;
  readonly transactions = this.store.transactions;

  selectedCategoryId = '';
  amount = '';
  currency = this.currencies[0];
  note = '';
  transactionDate = new Date().toISOString().slice(0, 10);

  periodStart = this.getMonthRange(new Date()).start;
  periodEnd = this.getMonthRange(new Date()).end;

  constructor(private readonly store: FinanceStoreService) {
    effect(() => {
      const categories = this.categories();
      if (categories.length && !this.selectedCategoryId) {
        this.selectedCategoryId = categories[0].id;
      }
    });
  }

  get categoryMap() {
    return new Map(this.categories().map((category) => [category.id, category]));
  }

  get filteredTransactions() {
    return this.transactions()
      .filter((transaction) => {
        if (this.periodStart && transaction.date < this.periodStart) {
          return false;
        }
        if (this.periodEnd && transaction.date > this.periodEnd) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  private getMonthRange(date: Date) {
    const value = new Date(date);
    const start = new Date(value.getFullYear(), value.getMonth(), 1);
    const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }

  async handleSubmit() {
    const numericAmount = Number.parseFloat(this.amount);

    if (!this.selectedCategoryId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const payload: Transaction = {
      id: crypto.randomUUID(),
      amount: numericAmount,
      currency: this.currency,
      categoryId: this.selectedCategoryId,
      note: this.note.trim(),
      date: this.transactionDate,
      createdAt: new Date().toISOString(),
    };

    await this.store.addTransaction(payload);
    this.resetForm();
  }

  trackTransaction(_: number, transaction: Transaction) {
    return transaction.id;
  }

  private resetForm() {
    this.amount = '';
    this.note = '';
    const categories = this.categories();
    if (categories.length) {
      this.selectedCategoryId = categories[0].id;
    }
  }
}
