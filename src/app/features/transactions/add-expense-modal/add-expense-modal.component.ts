import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateRecurringExpense, FinanceStoreService, Transaction } from '../../../data/finance-store.service';
import { createClientId } from '../../../utils/id';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DateInputComponent } from '../../../shared/ui/forms/date-input.component';
import { FieldComponent } from '../../../shared/ui/forms/field.component';
import { InputDirective } from '../../../shared/ui/forms/input.directive';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

let nextFormId = 0;

export type AddExpenseMode = 'oneTime' | 'recurring';

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
      e2e="add-expense.modal"
      closeE2e="add-expense.close"
    >
      <div class="add-expense__mode" role="group" aria-label="Тип траты">
        <app-button
          variant="secondary"
          size="sm"
          type="button"
          e2e="add-expense.mode.one-time"
          [selected]="modeValue === 'oneTime'"
          (click)="setMode('oneTime')"
        >
          Разовая
        </app-button>
        <app-button
          variant="secondary"
          size="sm"
          type="button"
          e2e="add-expense.mode.recurring"
          [selected]="modeValue === 'recurring'"
          (click)="setMode('recurring')"
        >
          Регулярная
        </app-button>
      </div>

      <p class="add-expense__mode-hint" *ngIf="modeValue === 'recurring'">
        Будет создаваться каждый месяц в выбранный день. Старт задается датой ниже.
      </p>

      <ng-container *ngIf="expenseCategories().length > 0; else emptyState">
        <form class="add-expense" [id]="formId" (ngSubmit)="handleSubmit()">
          <app-field label="Категория">
            <select
              appInput
              name="category"
              [(ngModel)]="selectedCategoryId"
              required
              data-e2e="add-expense.category"
            >
              <option *ngFor="let category of expenseCategories(); trackBy: trackCategory" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </app-field>

          <div class="add-expense__row" [class.add-expense__row--single]="modeValue === 'recurring'">
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
                data-e2e="add-expense.amount"
              />
            </app-field>

            <app-field *ngIf="modeValue === 'oneTime'" label="Валюта">
              <select appInput name="currency" [(ngModel)]="currency" data-e2e="add-expense.currency">
                <option *ngFor="let item of currencies" [value]="item">{{ item }}</option>
              </select>
            </app-field>
          </div>

          <app-field label="Дата">
            <app-date-input name="date" [(ngModel)]="transactionDate" e2e="add-expense.date" />
          </app-field>

          <app-field
            [label]="modeValue === 'recurring' ? 'Описание' : 'Заметка'"
            hint="Опционально. Короткий комментарий."
          >
            <textarea
              appInput
              name="note"
              rows="3"
              placeholder="Например: кофе, доставка"
              [(ngModel)]="note"
              data-e2e="add-expense.note"
            ></textarea>
          </app-field>
        </form>
      </ng-container>

      <ng-template #emptyState>
        <ng-container *ngIf="initState() === 'ready'; else errorState">
          <div class="add-expense__empty">
            <p class="add-expense__empty-title">Сначала нужны категории</p>
            <p class="add-expense__empty-text">
              Без категорий дашборд будет пустой. Создай хотя бы одну категорию расходов.
            </p>
            <app-button variant="primary" size="md" e2e="add-expense.go-to-categories" (click)="goToCategories()">
              Перейти в категории
            </app-button>
          </div>
        </ng-container>
      </ng-template>

      <ng-template #errorState>
        <ng-container *ngIf="initState() === 'error'; else loadingState">
          <div class="add-expense__empty">
            <p class="add-expense__empty-title">Не удалось загрузить данные</p>
            <p class="add-expense__empty-text">
              {{ initError() || 'Проверь соединение и попробуй еще раз.' }}
            </p>
            <app-button variant="primary" size="md" e2e="add-expense.retry" (click)="retryInit()">
              Повторить
            </app-button>
          </div>
        </ng-container>
      </ng-template>

      <ng-template #loadingState>
        <div class="add-expense__loading" aria-busy="true" aria-live="polite">
          <p class="add-expense__loading-title">Загрузка данных…</p>
          <p class="add-expense__loading-text">Сейчас подтянем категории и операции.</p>
        </div>
      </ng-template>

      <div modalActions>
        <app-button
          variant="ghost"
          size="md"
          type="button"
          e2e="add-expense.cancel"
          (click)="handleOpenChange(false)"
        >
          Отмена
        </app-button>
        <app-button
          variant="primary"
          size="md"
          type="submit"
          [form]="formId"
          e2e="add-expense.save"
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

    .add-expense__mode {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 0.25rem 0;
    }

    .add-expense__mode-hint {
      margin: 0 0 0.25rem 0;
      color: color-mix(in srgb, var(--text, #0b1020) 65%, transparent);
      font-size: 0.9rem;
    }

    .add-expense__row {
      display: grid;
      gap: 0.95rem;
      grid-template-columns: 1fr 140px;
      align-items: end;
    }

    .add-expense__row--single {
      grid-template-columns: 1fr;
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

    .add-expense__loading {
      display: grid;
      gap: 0.35rem;
      padding: 0.5rem 0;
      color: color-mix(in srgb, var(--text, #0b1020) 70%, transparent);
    }

    .add-expense__loading-title {
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
    }

    .add-expense__loading-text {
      margin: 0;
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
  modeValue: AddExpenseMode = 'oneTime';

  @Input()
  set open(value: boolean) {
    this.isOpen = Boolean(value);
    if (this.isOpen) {
      this.modeValue = this.mode;
      this.ensureDefaults();
      setTimeout(() => this.amountInput?.nativeElement?.focus(), 0);
    }
  }

  get open() {
    return this.isOpen;
  }

  @Input() mode: AddExpenseMode = 'oneTime';

  @Output() openChange = new EventEmitter<boolean>();

  readonly categories;
  readonly initState;
  readonly initError;

  readonly currencies = ['RUB', 'USD', 'EUR'];

  selectedCategoryId = '';
  amount: number | null = null;
  currency = this.currencies[0]!;
  note = '';
  transactionDate = new Date().toISOString().slice(0, 10);

  isSaving = false;
  readonly formId = `add-expense-form-${++nextFormId}`;

  constructor(store: FinanceStoreService, router: Router) {
    this.store = store;
    this.router = router;
    this.categories = this.store.categories;
    this.initState = this.store.initState;
    this.initError = this.store.initError;

    // Categories may arrive after modal is opened (async store init). In that case
    // the <select> visually shows the first option, but ngModel can remain empty,
    // which keeps "Сохранить" disabled. Ensure defaults whenever categories update.
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

    const numericAmount = this.amount;
    if (typeof numericAmount !== 'number' || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    this.isSaving = true;
    try {
      if (this.modeValue === 'recurring') {
        const dayOfMonth = Number.parseInt(String(this.transactionDate).slice(8, 10), 10);
        if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
          return;
        }

        const payload: CreateRecurringExpense = {
          categoryId: this.selectedCategoryId,
          amount: numericAmount,
          dayOfMonth,
          date: this.transactionDate,
          description: this.note.trim() || undefined,
        };

        await this.store.addRecurringExpense(payload);
      } else {
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
      }
      this.resetAfterSave();
      this.handleOpenChange(false);
    } finally {
      this.isSaving = false;
    }
  }

  setMode(mode: AddExpenseMode) {
    this.modeValue = mode;
  }

  private resetAfterSave() {
    this.amount = null;
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

  retryInit() {
    void this.store.initStore().catch((error) => {
      console.error('Failed to initialize finance store', error);
    });
  }
}
