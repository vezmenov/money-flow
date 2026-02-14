import { NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService, RecurringExpenseForMonth, Transaction } from '../../data/finance-store.service';
import {
  filterExpenseTransactions,
  filterTransactionsByPeriod,
  formatMoney,
  getLastDaysRange,
  getMonthRange,
  groupExpensesByCategory,
  groupExpensesByDay,
  normalizePeriod,
  parseIsoDate,
} from '../../features/dashboard/dashboard.selectors';
import { AddExpenseModalComponent } from '../../features/transactions/add-expense-modal/add-expense-modal.component';
import { BarChartComponent } from '../../shared/charts/bar-chart.component';
import { DonutChartComponent } from '../../shared/charts/donut-chart.component';
import { LineChartComponent } from '../../shared/charts/line-chart.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FabComponent } from '../../shared/ui/button/fab.component';
import { IconButtonComponent } from '../../shared/ui/button/icon-button.component';
import { DateInputComponent } from '../../shared/ui/forms/date-input.component';
import { FieldComponent } from '../../shared/ui/forms/field.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    ButtonComponent,
    FieldComponent,
    DateInputComponent,
    LineChartComponent,
    DonutChartComponent,
    BarChartComponent,
    FabComponent,
    IconComponent,
    IconButtonComponent,
    AddExpenseModalComponent,
  ],
  template: `
    <main class="home">
      <header class="glass-header home__header">
        <p class="glass-header__eyebrow">Money Flow</p>
        <h1 class="glass-header__title">Дашборд трат</h1>
        <p class="glass-header__subtitle">
          Динамика, категории и быстрый ввод. Стекло снаружи, пластик внутри.
        </p>
      </header>

	      <section class="glass-surface home__filters">
	        <div class="home__filters-top">
	          <div class="home__chips" role="group" aria-label="Период">
            <app-button
              variant="ghost"
              size="sm"
              [selected]="preset() === '7d'"
              type="button"
              (click)="setPreset('7d')"
            >
              7 дней
            </app-button>
            <app-button
              variant="ghost"
              size="sm"
              [selected]="preset() === '30d'"
              type="button"
              (click)="setPreset('30d')"
            >
              30 дней
            </app-button>
            <app-button
              variant="ghost"
              size="sm"
              [selected]="preset() === 'month'"
              type="button"
              (click)="setPreset('month')"
            >
              Месяц
            </app-button>
            <app-button
              variant="ghost"
              size="sm"
              [selected]="preset() === 'custom'"
              type="button"
              (click)="setPreset('custom')"
            >
              Свои даты
            </app-button>
	          </div>

	          <div class="home__filters-actions">
	            <div class="home__range" aria-label="Текущий период">
	              <span class="home__range-label">Период:</span>
	              <span class="home__range-value home__range-value--long">{{ period().start }} → {{ period().end }}</span>
	              <span class="home__range-value home__range-value--short">{{ periodShortLabel() }}</span>
	            </div>
            <app-button
              variant="secondary"
              size="sm"
              type="button"
              [loading]="isExporting()"
              e2e="home.export"
              ariaLabel="Экспортировать траты в XLSX"
              (click)="exportXlsx()"
            >
              <app-icon name="download" [size]="18" [decorative]="true" />
	              <span class="home__export-label">Экспорт</span>
	            </app-button>
	          </div>
	        </div>

        <div *ngIf="preset() === 'custom'" class="home__dates">
          <app-field label="С">
            <app-date-input name="customStart" [(ngModel)]="customStart" />
          </app-field>
          <app-field label="По">
            <app-date-input name="customEnd" [(ngModel)]="customEnd" />
          </app-field>
        </div>
      </section>

      <section class="home__kpis">
        <div class="glass-surface home-kpi">
          <div class="home-kpi__label">Траты</div>
          <div class="home-kpi__value">{{ totalLabel() }}</div>
          <div class="home-kpi__meta" *ngIf="currencyNote()">{{ currencyNote() }}</div>
        </div>
        <div class="glass-surface home-kpi">
          <div class="home-kpi__label">В среднем в день</div>
          <div class="home-kpi__value">{{ avgLabel() }}</div>
          <div class="home-kpi__meta">{{ dayCount() }} дн.</div>
        </div>
        <div class="glass-surface home-kpi">
          <div class="home-kpi__label">Фокус</div>
          <div class="home-kpi__value">{{ focusLabel() }}</div>
          <div class="home-kpi__meta">
            <ng-container *ngIf="activeCategory(); else topCat">
              <app-button variant="ghost" size="sm" type="button" (click)="clearCategoryFilter()">
                Сбросить
              </app-button>
            </ng-container>
            <ng-template #topCat>Топ категория за период</ng-template>
          </div>
        </div>
      </section>

      <section class="home__grid">
        <section class="glass-surface home-card home-card--wide">
          <header class="home-card__header">
            <h2 class="home-card__title">Динамика</h2>
            <p class="home-card__hint">
              {{ activeCategory() ? 'Выбрана категория: ' + activeCategory()!.name : 'Все траты' }}
            </p>
          </header>
          <app-line-chart
            [labels]="lineChartLabels()"
            [values]="lineChartValues()"
            ariaLabel="Траты по дням"
          />
        </section>

        <section class="glass-surface home-card">
          <header class="home-card__header">
            <h2 class="home-card__title">Категории</h2>
            <p class="home-card__hint">Нажми на сектор, чтобы сфокусироваться</p>
          </header>
          <app-donut-chart
            [labels]="donutLabels()"
            [values]="donutValues()"
            [colors]="donutColors()"
            [selectedIndex]="donutSelectedIndex()"
            ariaLabel="Доли категорий"
            (sliceClick)="handleDonutClick($event.index)"
          />
        </section>

        <section class="glass-surface home-card">
          <header class="home-card__header">
            <h2 class="home-card__title">Топ</h2>
            <p class="home-card__hint">Категории с максимальными тратами</p>
          </header>
          <app-bar-chart
            [labels]="barLabels()"
            [values]="barValues()"
            [colors]="barColors()"
            [selectedIndex]="barSelectedIndex()"
            ariaLabel="Топ категорий"
            (barClick)="handleBarClick($event.index)"
          />
        </section>

        <section class="glass-surface home-card home-card--wide">
          <header class="home-card__header home-card__header--row">
            <div>
              <h2 class="home-card__title">Регулярные траты</h2>
              <p class="home-card__hint">
                План на {{ recurringMonthLabel() }} · {{ recurringCommittedCount() }}/{{ recurringExpenses().length }}
                создано
              </p>
            </div>
	            <app-icon-button
	              icon="plus"
	              ariaLabel="Добавить регулярную трату"
                e2e="home.recurring.add"
	              variant="success"
	              [size]="42"
	              [iconSize]="20"
	              (click)="openAddModal('recurring')"
	            />
	          </header>

          <ng-container *ngIf="recurringExpenses().length > 0; else emptyRecurring">
            <div class="home-recurring__kpis">
              <div class="home-recurring__kpi">
                <div class="home-recurring__kpi-label">План</div>
                <div class="home-recurring__kpi-value">{{ recurringTotalLabel() }}</div>
              </div>
              <div class="home-recurring__kpi">
                <div class="home-recurring__kpi-label">Ожидает</div>
                <div class="home-recurring__kpi-value">{{ recurringPendingLabel() }}</div>
              </div>
              <div class="home-recurring__kpi">
                <div class="home-recurring__kpi-label">Создано</div>
                <div class="home-recurring__kpi-value">{{ recurringCommittedCount() }}</div>
              </div>
            </div>

            <ul class="home-recurring__list">
              <li
                *ngFor="let item of recurringSorted(); trackBy: trackRecurring"
                class="home-recurring__item"
              >
                <span class="home-recurring__dot" [style.background]="categoryDot(item.categoryId)" aria-hidden="true"></span>
                <div class="home-recurring__main">
                  <div class="home-recurring__top">
                    <span class="home-recurring__name">{{ categoryName(item.categoryId) }}</span>
                    <span class="home-recurring__amount">{{ formatRecurringAmount(item.amount) }}</span>
                  </div>
                  <div class="home-recurring__bottom">
                    <span class="home-recurring__date">Сработает {{ item.scheduledDate }}</span>
                    <span class="home-recurring__badge" [attr.data-state]="item.committed ? 'done' : 'pending'">
                      {{ item.committed ? 'создано' : 'ожидает' }}
                    </span>
                    <span class="home-recurring__note" *ngIf="item.description">{{ item.description }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </ng-container>

          <ng-template #emptyRecurring>
            <div class="home-empty">
              <app-icon name="dashboard" [size]="22" [decorative]="true" />
              <p class="home-empty__title">Регулярных трат пока нет</p>
              <p class="home-empty__text">Жми плюс справа, чтобы добавить шаблон на месяц.</p>
            </div>
          </ng-template>
        </section>

        <section class="glass-surface home-card home-card--wide">
          <header class="home-card__header home-card__header--row">
            <div>
              <h2 class="home-card__title">Последние траты</h2>
              <p class="home-card__hint" *ngIf="activeCategory()">
                Фильтр: <strong>{{ activeCategory()!.name }}</strong>
              </p>
              <p class="home-card__hint" *ngIf="!activeCategory()">За выбранный период</p>
            </div>
            <app-button
              *ngIf="activeCategory()"
              variant="ghost"
              size="sm"
              type="button"
              (click)="clearCategoryFilter()"
            >
              Сбросить фильтр
            </app-button>
          </header>

          <ng-container *ngIf="latestTransactions().length > 0; else emptyList">
            <ul class="home-list">
              <li *ngFor="let transaction of latestTransactions(); trackBy: trackTransaction" class="home-list__item">
                <span
                  class="home-list__dot"
                  [style.background]="categoryDot(transaction.categoryId)"
                  aria-hidden="true"
                ></span>
                <div class="home-list__main">
                  <div class="home-list__top">
                    <button
                      class="home-list__category"
                      type="button"
                      (click)="setCategoryFilter(transaction.categoryId)"
                    >
                      {{ categoryName(transaction.categoryId) }}
                    </button>
                    <span class="home-list__amount">
                      {{ formatAmount(transaction.amount, transaction.currency) }}
                    </span>
                  </div>
                  <div class="home-list__bottom">
                    <span class="home-list__date">{{ transaction.date }}</span>
                    <span class="home-list__note" *ngIf="transaction.note">{{ transaction.note }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </ng-container>

          <ng-template #emptyList>
            <div class="home-empty">
              <app-icon name="dashboard" [size]="22" [decorative]="true" />
              <p class="home-empty__title">Пока пусто</p>
              <p class="home-empty__text">Добавь первую трату через большой плюс справа снизу.</p>
            </div>
          </ng-template>
        </section>
      </section>

      <app-fab e2e="home.fab.add" (click)="openAddModal('oneTime')" />
      <app-add-expense-modal
        [mode]="addMode()"
        [open]="isAddOpen()"
        (openChange)="isAddOpen.set($event)"
      />
    </main>
  `,
  styles: `
    .home {
      display: grid;
      gap: 18px;
      padding-bottom: 22px;
    }

    .home__header {
      padding: 6px 2px 2px 2px;
    }

    .home__filters {
      padding: 14px;
      display: grid;
      gap: 12px;
    }

	    .home__filters-top {
	      display: flex;
	      flex-wrap: wrap;
	      align-items: center;
	      justify-content: space-between;
	      gap: 12px;
	    }

	    .home__filters-actions {
	      display: flex;
	      align-items: center;
	      justify-content: flex-end;
	      flex-wrap: wrap;
	      gap: 10px;
	    }

	    .home__export-label {
	      white-space: nowrap;
	    }

	    .home__chips {
	      display: flex;
	      flex-wrap: wrap;
	      gap: 10px;
	    }

    .home__range {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
      padding: 0.45rem 0.65rem;
      border-radius: var(--radius-pill, 999px);
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.16);
      color: color-mix(in srgb, var(--text, #0b1020) 68%, transparent);
      font-weight: 650;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

	    .home__range-label {
	      color: color-mix(in srgb, var(--text, #0b1020) 52%, transparent);
	      font-weight: 750;
	    }

	    .home__range-value {
	      font-variant-numeric: tabular-nums;
	    }

	    .home__range-value--short {
	      display: none;
	    }

	    .home__dates {
	      display: grid;
	      grid-template-columns: 1fr 1fr;
	      gap: 12px;
	    }

    .home__kpis {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .home-kpi {
      padding: 14px;
      display: grid;
      gap: 6px;
    }

    .home-kpi__label {
      font-size: 0.78rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--text, #0b1020) 48%, transparent);
    }

    .home-kpi__value {
      font-size: 1.25rem;
      font-weight: 860;
      letter-spacing: -0.02em;
    }

    .home-kpi__meta {
      color: color-mix(in srgb, var(--text, #0b1020) 58%, transparent);
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .home__grid {
      display: grid;
      gap: 12px;
      grid-template-columns: 1.25fr 0.75fr;
      grid-auto-rows: minmax(120px, auto);
      align-items: start;
    }

    .home-card {
      padding: 14px;
      display: grid;
      gap: 10px;
    }

    .home-card--wide {
      grid-column: 1 / -1;
    }

    .home-card__header {
      display: grid;
      gap: 4px;
    }

    .home-card__header--row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .home-card__title {
      margin: 0;
      font-size: 1rem;
      font-weight: 860;
      letter-spacing: -0.01em;
    }

    .home-card__hint {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 58%, transparent);
      font-size: 0.9rem;
    }

    .home-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    .home-list__item {
      display: grid;
      grid-template-columns: 12px 1fr;
      gap: 12px;
      align-items: start;
      padding: 10px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.12);
      transition: filter 140ms ease, background 140ms ease;
    }

    .home-list__item:hover {
      filter: saturate(1.02);
      background: rgba(255, 255, 255, 0.16);
    }

    .home-list__dot {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.65);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
      margin-top: 4px;
    }

    .home-list__top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }

    .home-list__category {
      border: 1px solid rgba(255, 255, 255, 0.35);
      background:
        linear-gradient(to bottom, rgba(255, 255, 255, 0.74), rgba(230, 240, 255, 0.45));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        inset 0 -1px 0 rgba(2, 6, 23, 0.08);
      border-radius: var(--radius-pill, 999px);
      padding: 0.35rem 0.55rem;
      font: inherit;
      font-weight: 750;
      cursor: pointer;
      color: rgba(11, 16, 32, 0.9);
      -webkit-tap-highlight-color: transparent;
      transition: transform 140ms ease;
    }

    .home-list__category:hover {
      transform: translateY(-1px);
    }

    .home-list__amount {
      font-weight: 900;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .home-list__bottom {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: baseline;
      color: color-mix(in srgb, var(--text, #0b1020) 62%, transparent);
      font-size: 0.9rem;
    }

    .home-list__date {
      font-variant-numeric: tabular-nums;
    }

    .home-empty {
      display: grid;
      gap: 6px;
      justify-items: start;
      padding: 8px 2px;
      color: color-mix(in srgb, var(--text, #0b1020) 65%, transparent);
    }

    .home-empty__title {
      margin: 0;
      font-weight: 900;
      color: rgba(11, 16, 32, 0.92);
    }

    .home-empty__text {
      margin: 0;
      max-width: 42rem;
    }

    .home-recurring__kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      padding: 2px 0 6px 0;
    }

    .home-recurring__kpi {
      padding: 10px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.16);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
      display: grid;
      gap: 4px;
    }

    .home-recurring__kpi-label {
      font-size: 0.72rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--text, #0b1020) 50%, transparent);
      font-weight: 750;
    }

    .home-recurring__kpi-value {
      font-weight: 900;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
    }

    .home-recurring__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    .home-recurring__item {
      display: grid;
      grid-template-columns: 12px 1fr;
      gap: 12px;
      align-items: start;
      padding: 10px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.12);
    }

    .home-recurring__dot {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.65);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
      margin-top: 4px;
    }

    .home-recurring__main {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .home-recurring__top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }

    .home-recurring__name {
      font-weight: 900;
      letter-spacing: -0.01em;
      color: rgba(11, 16, 32, 0.92);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .home-recurring__amount {
      font-weight: 950;
      letter-spacing: -0.01em;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }

    .home-recurring__bottom {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: baseline;
      color: color-mix(in srgb, var(--text, #0b1020) 62%, transparent);
      font-size: 0.9rem;
    }

    .home-recurring__badge {
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-pill, 999px);
      font-size: 0.78rem;
      font-weight: 750;
      border: 1px solid rgba(0, 0, 0, 0.12);
      background:
        linear-gradient(
          to bottom,
          var(--plastic-bg-top, #f3f4f6),
          var(--plastic-bg-bot, #e5e7eb)
        );
      color: rgba(55, 65, 81, 0.95);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.75);
    }

    .home-recurring__badge[data-state='done'] {
      background:
        linear-gradient(
          to bottom,
          var(--accent-green-soft, #6ee7b7),
          var(--accent-green-bright, #34d399)
        );
      border-color: color-mix(in srgb, var(--accent-green-dark, #059669) 50%, transparent);
      color: rgba(6, 78, 59, 0.96);
    }

    .home-recurring__badge[data-state='pending'] {
      background:
        linear-gradient(
          to bottom,
          var(--accent-blue-soft, #60a5fa),
          color-mix(in srgb, var(--accent-blue, #3b82f6) 70%, white 30%)
        );
      border-color: color-mix(in srgb, var(--accent-blue-dark, #1d4ed8) 45%, transparent);
      color: rgba(30, 58, 138, 0.96);
    }

    .home-recurring__note {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    @media (max-width: 900px) {
      .home__grid {
        grid-template-columns: 1fr;
      }
      .home-card--wide {
        grid-column: auto;
      }
    }

		    @media (max-width: 699.98px) {
		      .home__kpis {
		        grid-template-columns: 1fr;
		      }
		      .home__dates {
		        grid-template-columns: 1fr;
		      }

		      .home__filters-actions {
		        width: 100%;
		        justify-content: space-between;
		      }

		      .home__range-label {
		        display: none;
		      }

		      .home__range-value--long {
		        display: none;
		      }

		      .home__range-value--short {
		        display: inline;
		      }

		      .home__export-label {
		        display: none;
		      }

		      .home-recurring__kpis {
	        grid-template-columns: 1fr;
	      }
	    }
	  `,
})
export class HomeComponent {
  readonly categories = this.store.categories;
  readonly transactions = this.store.transactions;
  readonly isExporting = this.store.isExporting;

  readonly preset = signal<'7d' | '30d' | 'month' | 'custom'>('month');
  private readonly customStartSignal = signal(getMonthRange(new Date()).start);
  private readonly customEndSignal = signal(getMonthRange(new Date()).end);
  readonly activeCategoryId = signal<string | null>(null);
  readonly isAddOpen = signal(false);
  readonly addMode = signal<'oneTime' | 'recurring'>('oneTime');

  constructor(private readonly store: FinanceStoreService) {
    effect(() => {
      const activeId = this.activeCategoryId();
      if (!activeId) {
        return;
      }
      const ids = new Set(this.baseExpenses().map((t) => t.categoryId));
      if (!ids.has(activeId)) {
        this.activeCategoryId.set(null);
      }
    });

    effect(() => {
      const month = this.recurringMonth();
      void this.store.loadRecurringExpenses(month).catch((error) => {
        console.error('Failed to load recurring expenses', error);
      });
    });
  }

  readonly period = computed(() => {
    const preset = this.preset();
    if (preset === '7d') {
      return getLastDaysRange(7);
    }
    if (preset === '30d') {
      return getLastDaysRange(30);
    }
    if (preset === 'custom') {
      return normalizePeriod({ start: this.customStart, end: this.customEnd });
    }
    return getMonthRange(new Date());
  });

  readonly periodTransactions = computed(() =>
    filterTransactionsByPeriod(this.transactions(), this.period().start, this.period().end),
  );

  readonly baseExpenses = computed(() => filterExpenseTransactions(this.periodTransactions(), this.categories()));

  readonly scopeExpenses = computed(() => {
    const id = this.activeCategoryId();
    const base = this.baseExpenses();
    if (!id) {
      return base;
    }
    return base.filter((t) => t.categoryId === id);
  });

  readonly dayCount = computed(() => {
    const start = parseIsoDate(this.period().start);
    const end = parseIsoDate(this.period().end);
    if (!start || !end) {
      return 0;
    }
    const ms = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(ms / 86_400_000) + 1);
  });

  readonly total = computed(() => this.scopeExpenses().reduce((sum, t) => sum + t.amount, 0));

  readonly currencyNote = computed(() => {
    const set = new Set(this.scopeExpenses().map((t) => t.currency));
    if (set.size <= 1) {
      return '';
    }
    return 'В периоде несколько валют (без конвертации)';
  });

  readonly primaryCurrency = computed(() => {
    const first = this.scopeExpenses().at(0)?.currency;
    return first ?? 'RUB';
  });

  readonly totalLabel = computed(() => {
    const value = this.total();
    const note = this.currencyNote();
    if (note) {
      return value.toFixed(2);
    }
    return formatMoney(value, this.primaryCurrency());
  });

  readonly avgLabel = computed(() => {
    const days = this.dayCount();
    if (!days) {
      return '—';
    }
    const avg = this.total() / days;
    const note = this.currencyNote();
    if (note) {
      return avg.toFixed(2);
    }
    return formatMoney(avg, this.primaryCurrency());
  });

  readonly categoryTotals = computed(() => groupExpensesByCategory(this.baseExpenses(), this.categories(), 6));

  readonly activeCategory = computed(() => {
    const id = this.activeCategoryId();
    if (!id) {
      return null;
    }
    return this.categories().find((c) => c.id === id) ?? null;
  });

  readonly focusLabel = computed(() => {
    const active = this.activeCategory();
    if (active) {
      return active.name;
    }
    const top = this.categoryTotals().at(0);
    return top ? top.label : '—';
  });

  readonly lineData = computed(() => groupExpensesByDay(this.scopeExpenses(), this.period().start, this.period().end));

  readonly lineChartLabels = computed(() => this.lineData().labels.map((d) => d.slice(5)));
  readonly lineChartValues = computed(() => this.lineData().values);

  readonly donutLabels = computed(() => this.categoryTotals().map((i) => i.label));
  readonly donutValues = computed(() => this.categoryTotals().map((i) => i.total));
  readonly donutColors = computed(() => this.categoryTotals().map((i) => i.color ?? 'rgba(43, 124, 255, 0.55)'));
  readonly donutSelectedIndex = computed(() => {
    const activeId = this.activeCategoryId();
    if (!activeId) {
      return null;
    }
    const idx = this.categoryTotals().findIndex((i) => i.categoryId === activeId);
    return idx >= 0 ? idx : null;
  });

  readonly barTotals = computed(() => groupExpensesByCategory(this.baseExpenses(), this.categories(), 5));
  readonly barLabels = computed(() => this.barTotals().map((i) => i.label));
  readonly barValues = computed(() => this.barTotals().map((i) => i.total));
  readonly barColors = computed(() => this.barTotals().map((i) => i.color ?? 'rgba(43, 124, 255, 0.6)'));
  readonly barSelectedIndex = computed(() => {
    const activeId = this.activeCategoryId();
    if (!activeId) {
      return null;
    }
    const idx = this.barTotals().findIndex((i) => i.categoryId === activeId);
    return idx >= 0 ? idx : null;
  });

  readonly latestTransactions = computed(() =>
    this.scopeExpenses()
      .slice()
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) {
          return byDate;
        }
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, 12),
  );

  readonly recurringExpenses = this.store.recurringExpenses;
  readonly recurringMonth = computed(() => String(this.period().end ?? '').slice(0, 7));

  readonly recurringSorted = computed(() =>
    this.recurringExpenses()
      .slice()
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
  );

  readonly recurringCommittedCount = computed(() => this.recurringExpenses().filter((r) => r.committed).length);

  readonly recurringTotal = computed(() => this.recurringExpenses().reduce((sum, r) => sum + r.amount, 0));
  readonly recurringPendingTotal = computed(() =>
    this.recurringExpenses()
      .filter((r) => !r.committed)
      .reduce((sum, r) => sum + r.amount, 0),
  );

  setPreset(preset: '7d' | '30d' | 'month' | 'custom') {
    this.preset.set(preset);
    if (preset === 'custom') {
      // Keep current values; they are already initialized.
      return;
    }
  }

  handleDonutClick(index: number) {
    const item = this.categoryTotals().at(index);
    if (!item?.categoryId) {
      this.clearCategoryFilter();
      return;
    }
    this.setCategoryFilter(item.categoryId);
  }

  handleBarClick(index: number) {
    const item = this.barTotals().at(index);
    if (!item?.categoryId) {
      this.clearCategoryFilter();
      return;
    }
    this.setCategoryFilter(item.categoryId);
  }

  clearCategoryFilter() {
    this.activeCategoryId.set(null);
  }

  setCategoryFilter(categoryId: string) {
    if (this.activeCategoryId() === categoryId) {
      this.activeCategoryId.set(null);
      return;
    }
    this.activeCategoryId.set(categoryId);
  }

  categoryName(categoryId: string) {
    return this.categories().find((c) => c.id === categoryId)?.name ?? 'Без категории';
  }

  categoryDot(categoryId: string) {
    const color = this.categories().find((c) => c.id === categoryId)?.color ?? '#94a3b8';
    return `radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.65), transparent 55%), ${color}`;
  }

  formatAmount(amount: number, currency: string) {
    return formatMoney(amount, currency);
  }

  openAddModal(mode: 'oneTime' | 'recurring') {
    this.addMode.set(mode);
    this.isAddOpen.set(true);
  }

  exportXlsx() {
    void this.store.exportXlsx().catch((error) => {
      console.error('Failed to export XLSX', error);
    });
  }

  periodShortLabel() {
    const period = this.period();
    const start = String(period.start ?? '');
    const end = String(period.end ?? '');

    if (start.length !== 10 || end.length !== 10) {
      return `${start} → ${end}`.trim();
    }

    const fmt = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
    const fmtYear = (iso: string) => `${fmt(iso)}.${iso.slice(2, 4)}`;

    if (start.slice(0, 4) !== end.slice(0, 4)) {
      return `${fmtYear(start)} → ${fmtYear(end)}`;
    }

    return `${fmt(start)} → ${fmt(end)}`;
  }

  recurringMonthLabel() {
    const month = this.recurringMonth();
    if (month.length !== 7) {
      return '—';
    }
    return `${month.slice(5)}.${month.slice(0, 4)}`;
  }

  recurringTotalLabel() {
    return formatMoney(this.recurringTotal(), this.primaryCurrency());
  }

  recurringPendingLabel() {
    return formatMoney(this.recurringPendingTotal(), this.primaryCurrency());
  }

  formatRecurringAmount(amount: number) {
    return formatMoney(amount, this.primaryCurrency());
  }

  trackRecurring(_: number, item: RecurringExpenseForMonth) {
    return item.id;
  }

  trackTransaction(_: number, transaction: Transaction) {
    return transaction.id;
  }

  get customStart() {
    return this.customStartSignal();
  }

  set customStart(value: string) {
    this.customStartSignal.set(String(value ?? ''));
  }

  get customEnd() {
    return this.customEndSignal();
  }

  set customEnd(value: string) {
    this.customEndSignal.set(String(value ?? ''));
  }
}
