import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService, Transaction } from '../../../data/finance-store.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DateInputComponent } from '../../../shared/ui/forms/date-input.component';
import { FieldComponent } from '../../../shared/ui/forms/field.component';
import { InputDirective } from '../../../shared/ui/forms/input.directive';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

let nextFormId = 0;

@Component({
  selector: 'app-edit-expense-modal',
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
      title="Редактировать трату"
      size="sm"
      e2e="edit-expense.modal"
      closeE2e="edit-expense.close"
    >
      <ng-container *ngIf="transaction; else emptyState">
        <ng-container *ngIf="expenseCategories().length > 0; else categoriesState">
          <form class="edit-expense" [id]="formId" (ngSubmit)="handleSubmit()">
            <app-field label="Категория">
              <select
                appInput
                name="category"
                [(ngModel)]="selectedCategoryId"
                required
                data-e2e="edit-expense.category"
              >
                <option *ngFor="let category of expenseCategories(); trackBy: trackCategory" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </app-field>

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
                data-e2e="edit-expense.amount"
              />
            </app-field>

            <app-field label="Дата">
              <app-date-input name="date" [(ngModel)]="transactionDate" e2e="edit-expense.date" />
            </app-field>

            <app-field label="Заметка" hint="Опционально. Короткий комментарий.">
              <textarea
                appInput
                name="note"
                rows="3"
                placeholder="Например: кофе, доставка"
                [(ngModel)]="note"
                data-e2e="edit-expense.note"
              ></textarea>
            </app-field>

            <app-field label="Валюта" hint="Пока без изменения валюты (backend не гарантирует поддержку).">
              <input appInput name="currency" [ngModel]="currency" disabled data-e2e="edit-expense.currency" />
            </app-field>
          </form>
        </ng-container>
      </ng-container>

      <ng-template #categoriesState>
        <ng-container *ngIf="initState() === 'ready'; else errorState">
          <div class="edit-expense__empty">
            <p class="edit-expense__empty-title">Категорий расходов нет</p>
            <p class="edit-expense__empty-text">Сначала создай категории, потом можно будет редактировать траты.</p>
          </div>
        </ng-container>
      </ng-template>

      <ng-template #errorState>
        <ng-container *ngIf="initState() === 'error'; else loadingState">
          <div class="edit-expense__empty">
            <p class="edit-expense__empty-title">Не удалось загрузить данные</p>
            <p class="edit-expense__empty-text">
              {{ initError() || 'Проверь соединение и попробуй еще раз.' }}
            </p>
            <app-button variant="primary" size="md" e2e="edit-expense.retry" (click)="retryInit()">
              Повторить
            </app-button>
          </div>
        </ng-container>
      </ng-template>

      <ng-template #loadingState>
        <div class="edit-expense__loading" aria-busy="true" aria-live="polite">
          <p class="edit-expense__loading-title">Загрузка данных…</p>
          <p class="edit-expense__loading-text">Сейчас подтянем категории и операции.</p>
        </div>
      </ng-template>

      <ng-template #emptyState>
        <div class="edit-expense__empty">
          <p class="edit-expense__empty-title">Нечего редактировать</p>
          <p class="edit-expense__empty-text">Выбери трату в списке и нажми “карандаш”.</p>
        </div>
      </ng-template>

      <div modalActions>
        <app-button variant="ghost" size="md" type="button" e2e="edit-expense.cancel" (click)="handleOpenChange(false)">
          Отмена
        </app-button>
        <app-button
          variant="primary"
          size="md"
          type="submit"
          [form]="formId"
          e2e="edit-expense.save"
          [disabled]="!canSubmit"
          [loading]="isSaving"
        >
          Сохранить
        </app-button>
      </div>
    </app-modal>
  `,
  styles: `
    .edit-expense {
      display: grid;
      gap: 0.95rem;
    }

    .edit-expense__empty {
      display: grid;
      gap: 0.75rem;
      padding: 0.25rem 0;
    }

    .edit-expense__empty-title {
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
    }

    .edit-expense__empty-text {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 65%, transparent);
    }

    .edit-expense__loading {
      display: grid;
      gap: 0.35rem;
      padding: 0.5rem 0;
      color: color-mix(in srgb, var(--text, #0b1020) 70%, transparent);
    }

    .edit-expense__loading-title {
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
    }

    .edit-expense__loading-text {
      margin: 0;
    }
  `,
})
export class EditExpenseModalComponent {
  private readonly store: FinanceStoreService;

  @ViewChild('amountInput') private readonly amountInput?: ElementRef<HTMLInputElement>;

  private isOpen = false;

  @Input()
  set open(value: boolean) {
    this.isOpen = Boolean(value);
    if (this.isOpen) {
      this.isSaving = false;
      this.fillFromTransaction();
      this.ensureDefaults();
      setTimeout(() => this.amountInput?.nativeElement?.focus(), 0);
    }
  }

  get open() {
    return this.isOpen;
  }

  private currentTransaction: Transaction | null = null;

  @Input()
  set transaction(value: Transaction | null) {
    this.currentTransaction = value;
    if (this.isOpen) {
      this.fillFromTransaction();
      this.ensureDefaults();
    }
  }

  get transaction() {
    return this.currentTransaction;
  }

  @Output() openChange = new EventEmitter<boolean>();

  readonly categories;
  readonly initState;
  readonly initError;

  selectedCategoryId = '';
  amount: number | null = null;
  note = '';
  transactionDate = '';
  currency = '';

  isSaving = false;
  readonly formId = `edit-expense-form-${++nextFormId}`;

  constructor(store: FinanceStoreService) {
    this.store = store;
    this.categories = this.store.categories;
    this.initState = this.store.initState;
    this.initError = this.store.initError;

    // Categories may arrive after modal opens; keep selection valid.
    effect(() => {
      void this.categories();
      if (this.isOpen) {
        this.ensureDefaults();
      }
    });
  }

  expenseCategories() {
    return this.categories().filter((category) => category.type === 'expense');
  }

  get amountError() {
    if (this.amount === null) {
      return '';
    }
    if (!Number.isFinite(this.amount) || this.amount <= 0) {
      return 'Введите сумму больше нуля';
    }
    return '';
  }

  get canSubmit() {
    const numericAmount = this.amount;
    return (
      Boolean(this.transaction) &&
      !this.isSaving &&
      Boolean(this.selectedCategoryId) &&
      typeof numericAmount === 'number' &&
      Number.isFinite(numericAmount) &&
      numericAmount > 0
    );
  }

  handleOpenChange(nextOpen: boolean) {
    this.open = nextOpen;
    this.openChange.emit(nextOpen);
  }

  async handleSubmit() {
    const tx = this.transaction;
    if (!tx || !this.canSubmit) {
      return;
    }

    const numericAmount = this.amount;
    if (typeof numericAmount !== 'number' || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    this.isSaving = true;
    try {
      const next: Transaction = {
        ...tx,
        categoryId: this.selectedCategoryId,
        amount: numericAmount,
        date: this.transactionDate || tx.date,
        note: this.note.trim(),
        // Currency editing is intentionally not supported right now (API mismatch risk).
        currency: tx.currency,
      };

      await this.store.updateTransaction(next);
      this.handleOpenChange(false);
    } finally {
      this.isSaving = false;
    }
  }

  private fillFromTransaction() {
    const tx = this.transaction;
    if (!tx) {
      this.selectedCategoryId = '';
      this.amount = null;
      this.note = '';
      this.transactionDate = '';
      this.currency = '';
      return;
    }

    this.selectedCategoryId = tx.categoryId;
    this.amount = tx.amount;
    this.note = tx.note ?? '';
    this.transactionDate = tx.date;
    this.currency = tx.currency;
  }

  private ensureDefaults() {
    if (!this.isOpen) {
      return;
    }

    const expense = this.expenseCategories();
    if (!expense.length) {
      return;
    }

    const hasSelected = expense.some((c) => c.id === this.selectedCategoryId);
    if (!this.selectedCategoryId || !hasSelected) {
      const preferred = this.transaction?.categoryId;
      const preferredExists = preferred ? expense.some((c) => c.id === preferred) : false;
      this.selectedCategoryId = preferredExists ? preferred! : expense[0]!.id;
    }

    if (!this.transactionDate) {
      this.transactionDate = this.transaction?.date ?? new Date().toISOString().slice(0, 10);
    }
  }

  trackCategory(_: number, category: { id: string }) {
    return category.id;
  }

  retryInit() {
    void this.store.initStore().catch((error) => {
      console.error('Failed to initialize finance store', error);
    });
  }
}

