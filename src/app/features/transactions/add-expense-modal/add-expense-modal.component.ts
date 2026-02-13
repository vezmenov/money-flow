import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanceStoreService, Transaction } from '../../../data/finance-store.service';
import { createClientId } from '../../../utils/id';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DateInputComponent } from '../../../shared/ui/forms/date-input.component';
import { FieldComponent } from '../../../shared/ui/forms/field.component';
import { InputDirective } from '../../../shared/ui/forms/input.directive';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

let nextFormId = 0;

@Component({
  selector: 'app-add-expense-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    ModalComponent,
    FieldComponent,
    InputDirective,
    DateInputComponent,
    ButtonComponent,
  ],
  template: `
    <app-modal
      [open]="open"
      (openChange)="handleOpenChange($event)"
      title="Быстро добавить трату"
      size="sm"
    >
      <ng-container *ngIf="expenseCategories().length > 0; else noCategories">
        <form class="add-expense" [id]="formId" (ngSubmit)="handleSubmit()">
          <app-field label="Категория">
            <select appInput name="category" [(ngModel)]="selectedCategoryId" required>
              <option *ngFor="let category of expenseCategories(); trackBy: trackCategory" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </app-field>

          <div class="add-expense__row">
            <app-field label="Сумма" [error]="amountError">
              <input
                #amountInput
                appInput
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                [(ngModel)]="amount"
                required
              />
            </app-field>

            <app-field label="Валюта">
              <select appInput name="currency" [(ngModel)]="currency">
                <option *ngFor="let item of currencies" [value]="item">{{ item }}</option>
              </select>
            </app-field>
          </div>

          <app-field label="Дата">
            <app-date-input name="date" [(ngModel)]="transactionDate" />
          </app-field>

          <app-field label="Заметка" hint="Опционально. Короткий комментарий.">
            <textarea
              appInput
              name="note"
              rows="3"
              placeholder="Например: кофе, доставка"
              [(ngModel)]="note"
            ></textarea>
          </app-field>
        </form>
      </ng-container>

      <ng-template #noCategories>
        <div class="add-expense__empty">
          <p class="add-expense__empty-title">Сначала нужны категории</p>
          <p class="add-expense__empty-text">
            Без категорий дашборд будет пустой. Создай хотя бы одну категорию расходов.
          </p>
          <app-button variant="primary" size="md" (click)="goToCategories()">
            Перейти в категории
          </app-button>
        </div>
      </ng-template>

      <div modalActions>
        <app-button variant="ghost" size="md" type="button" (click)="handleOpenChange(false)">
          Отмена
        </app-button>
        <app-button
          variant="primary"
          size="md"
          type="submit"
          [form]="formId"
          [disabled]="!canSubmit"
          [loading]="isSaving"
        >
          Сохранить
        </app-button>
      </div>
    </app-modal>
  `,
  styles: `
    .add-expense {
      display: grid;
      gap: 0.95rem;
    }

    .add-expense__row {
      display: grid;
      gap: 0.95rem;
      grid-template-columns: 1fr 140px;
      align-items: end;
    }

    @media (max-width: 420px) {
      .add-expense__row {
        grid-template-columns: 1fr;
      }
    }

    .add-expense__empty {
      display: grid;
      gap: 0.75rem;
      padding: 0.25rem 0;
    }

    .add-expense__empty-title {
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
    }

    .add-expense__empty-text {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 65%, transparent);
    }
  `,
})
export class AddExpenseModalComponent {
  private readonly store: FinanceStoreService;
  private readonly router: Router;

  @ViewChild('amountInput') private readonly amountInput?: ElementRef<HTMLInputElement>;

  private isOpen = false;

  @Input()
  set open(value: boolean) {
    this.isOpen = Boolean(value);
    if (this.isOpen) {
      this.ensureDefaults();
      setTimeout(() => this.amountInput?.nativeElement?.focus(), 0);
    }
  }

  get open() {
    return this.isOpen;
  }

  @Output() openChange = new EventEmitter<boolean>();

  readonly categories;

  readonly currencies = ['RUB', 'USD', 'EUR'];

  selectedCategoryId = '';
  amount = '';
  currency = this.currencies[0]!;
  note = '';
  transactionDate = new Date().toISOString().slice(0, 10);

  isSaving = false;
  readonly formId = `add-expense-form-${++nextFormId}`;

  constructor(store: FinanceStoreService, router: Router) {
    this.store = store;
    this.router = router;
    this.categories = this.store.categories;
  }

  expenseCategories() {
    return this.categories().filter((category) => category.type === 'expense');
  }

  get amountError() {
    if (!this.amount.trim()) {
      return '';
    }
    const numeric = Number.parseFloat(this.amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 'Введите сумму больше нуля';
    }
    return '';
  }

  get canSubmit() {
    const numericAmount = Number.parseFloat(this.amount);
    return (
      !this.isSaving &&
      Boolean(this.selectedCategoryId) &&
      Number.isFinite(numericAmount) &&
      numericAmount > 0
    );
  }

  handleOpenChange(nextOpen: boolean) {
    this.open = nextOpen;
    this.openChange.emit(nextOpen);
  }

  private ensureDefaults() {
    const categories = this.expenseCategories();
    if (categories.length && !this.selectedCategoryId) {
      this.selectedCategoryId = categories[0]!.id;
    }
    if (!this.transactionDate) {
      this.transactionDate = new Date().toISOString().slice(0, 10);
    }
  }

  async handleSubmit() {
    if (!this.canSubmit) {
      return;
    }

    const numericAmount = Number.parseFloat(this.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    this.isSaving = true;
    try {
      const payload: Transaction = {
        id: createClientId(),
        amount: numericAmount,
        currency: this.currency,
        categoryId: this.selectedCategoryId,
        note: this.note.trim(),
        date: this.transactionDate,
        createdAt: new Date().toISOString(),
      };

      await this.store.addTransaction(payload);
      this.resetAfterSave();
      this.handleOpenChange(false);
    } finally {
      this.isSaving = false;
    }
  }

  private resetAfterSave() {
    this.amount = '';
    this.note = '';
    this.transactionDate = new Date().toISOString().slice(0, 10);
    // Keep category and currency as "sticky" defaults.
  }

  trackCategory(_: number, category: { id: string }) {
    return category.id;
  }

  goToCategories() {
    this.handleOpenChange(false);
    void this.router.navigateByUrl('/categories');
  }
}
