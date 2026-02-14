import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, FinanceStoreService } from '../../data/finance-store.service';
import { createClientId } from '../../utils/id';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../shared/ui/button/icon-button.component';
import { FieldComponent } from '../../shared/ui/forms/field.component';
import { InputDirective } from '../../shared/ui/forms/input.directive';
import { ModalComponent } from '../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    ButtonComponent,
    IconButtonComponent,
    FieldComponent,
    InputDirective,
    ModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="categories">
      <header class="glass-header categories__header">
        <p class="glass-header__eyebrow">Раздел</p>
        <h1 class="glass-header__title">Категории</h1>
        <p class="glass-header__subtitle">
          Собери базу категорий расходов. Цвет нужен для графиков и быстрых сигналов.
        </p>
      </header>

      <section class="glass-surface categories__card">
        <form class="categories__form" (ngSubmit)="handleAddCategory()">
          <div class="categories__form-row">
            <app-field label="Цвет">
              <input
                class="categories__color"
                type="color"
                [(ngModel)]="categoryColor"
                name="categoryColor"
              />
            </app-field>

            <app-field label="Название">
              <input
                appInput
                type="text"
                placeholder="Например: Продукты"
                [(ngModel)]="categoryName"
                name="categoryName"
              />
            </app-field>
          </div>

          <app-button type="submit" variant="primary" size="md">Добавить</app-button>
        </form>
      </section>

      <section class="glass-surface categories__card">
        <header class="categories__list-header">
          <h2 class="categories__list-title">Список</h2>
          <p class="categories__list-hint">Нажми на категорию позже, чтобы фильтровать траты на главной.</p>
        </header>

        <p class="categories__empty" *ngIf="categories().length === 0">Категорий пока нет.</p>
        <ul class="categories__list" *ngIf="categories().length > 0">
          <li
            class="category-item"
            *ngFor="let category of categories(); trackBy: trackCategory"
            data-e2e="categories.item"
            [attr.data-category-id]="category.id"
          >
            <span class="category-item__dot" [style.background]="dot(category.color)" aria-hidden="true"></span>
            <span class="category-item__name">{{ category.name }}</span>
            <span class="category-item__actions">
              <app-icon-button
                icon="edit"
                ariaLabel="Редактировать категорию"
                e2e="categories.edit"
                [size]="36"
                [iconSize]="18"
                (click)="openEditCategory(category)"
              />
            </span>
          </li>
        </ul>
      </section>

      <app-modal
        title="Редактировать категорию"
        size="sm"
        [open]="isEditOpen"
        (openChange)="handleEditOpenChange($event)"
        e2e="edit-category.modal"
        closeE2e="edit-category.close"
      >
        <form class="edit-category" [id]="editFormId" (ngSubmit)="handleUpdateCategory()">
          <div class="edit-category__row">
            <app-field label="Цвет">
              <input
                class="categories__color"
                type="color"
                [(ngModel)]="editColor"
                name="editColor"
                data-e2e="edit-category.color"
              />
            </app-field>

            <app-field label="Название" [error]="editNameError">
              <input
                appInput
                type="text"
                placeholder="Например: Продукты"
                [(ngModel)]="editName"
                name="editName"
                data-e2e="edit-category.name"
                required
              />
            </app-field>
          </div>

          <p class="edit-category__error" *ngIf="editError">{{ editError }}</p>
        </form>

        <div modalActions>
          <app-button
            variant="ghost"
            size="md"
            type="button"
            e2e="edit-category.cancel"
            (click)="handleEditOpenChange(false)"
          >
            Отмена
          </app-button>
          <app-button
            variant="primary"
            size="md"
            type="submit"
            [form]="editFormId"
            e2e="edit-category.save"
            [loading]="isSaving"
            [disabled]="!canSave"
          >
            Сохранить
          </app-button>
        </div>
      </app-modal>
    </main>
  `,
  styles: `
    .categories {
      display: grid;
      gap: 18px;
    }

    .categories__card {
      padding: 14px;
      display: grid;
      gap: 12px;
    }

    .categories__form {
      display: grid;
      gap: 12px;
      align-items: end;
    }

    .categories__form-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
      align-items: end;
    }

    .categories__color {
      width: 100%;
      height: 44px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: var(--radius-control, 12px);
      background: rgba(255, 255, 255, 0.45);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 0 rgba(2, 6, 23, 0.08);
      cursor: pointer;
    }

    .categories__list-header {
      display: grid;
      gap: 4px;
    }

    .categories__list-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: -0.01em;
    }

    .categories__list-hint {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 58%, transparent);
    }

    .categories__empty {
      margin: 0;
      color: color-mix(in srgb, var(--text, #0b1020) 62%, transparent);
      font-weight: 650;
    }

    .categories__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    .category-item {
      display: grid;
      grid-template-columns: 14px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.12);
      transition: background 140ms ease;
    }

    .category-item:hover {
      background: rgba(255, 255, 255, 0.16);
    }

    .category-item__dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.65);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    .category-item__name {
      font-weight: 850;
      letter-spacing: -0.01em;
      color: rgba(11, 16, 32, 0.92);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .category-item__actions {
      opacity: 0;
      transform: translateY(1px);
      pointer-events: none;
      transition: opacity 140ms ease, transform 140ms ease;
    }

    .category-item:hover .category-item__actions,
    .category-item:focus-within .category-item__actions {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    @media (hover: none) {
      .category-item__actions {
        opacity: 1;
        transform: none;
        pointer-events: auto;
      }
    }

    .edit-category {
      display: grid;
      gap: 12px;
    }

    .edit-category__row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
      align-items: end;
    }

    .edit-category__error {
      margin: 0;
      padding: 0.55rem 0.65rem;
      border-radius: 14px;
      border: 1px solid color-mix(in srgb, var(--danger-dark, #dc2626) 40%, transparent);
      background: color-mix(in srgb, var(--danger, #ef4444) 14%, transparent);
      color: color-mix(in srgb, var(--danger-dark, #dc2626) 85%, var(--text, #0b1020) 15%);
      font-weight: 700;
    }

    @media (max-width: 699.98px) {
      .categories__form-row {
        grid-template-columns: 1fr;
      }

      .edit-category__row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class CategoriesComponent {
  readonly categories = this.store.categories;

  categoryName = '';
  categoryColor = '#3b82f6';

  isEditOpen = false;
  private editingCategory: Category | null = null;
  editName = '';
  editColor = '#3b82f6';
  isSaving = false;
  editError = '';
  readonly editFormId = `edit-category-form`;

  constructor(private readonly store: FinanceStoreService) {}

  async handleAddCategory() {
    const trimmedName = this.categoryName.trim();

    if (!trimmedName) {
      return;
    }

    await this.store.addCategory({
      id: createClientId(),
      name: trimmedName,
      color: this.categoryColor,
      type: 'expense',
      createdAt: new Date().toISOString(),
    });

    this.categoryName = '';
    this.categoryColor = '#3b82f6';
  }

  get editNameError() {
    if (!this.isEditOpen) {
      return '';
    }
    if (!this.editName.trim()) {
      return 'Введите название';
    }
    return '';
  }

  get canSave() {
    return !this.isSaving && Boolean(this.editingCategory) && Boolean(this.editName.trim());
  }

  openEditCategory(category: Category) {
    this.editError = '';
    this.isSaving = false;
    this.editingCategory = category;
    this.editName = category.name;
    this.editColor = category.color;
    this.isEditOpen = true;
  }

  handleEditOpenChange(open: boolean) {
    this.isEditOpen = open;
    if (!open) {
      this.editingCategory = null;
      this.editError = '';
      this.isSaving = false;
    }
  }

  async handleUpdateCategory() {
    const category = this.editingCategory;
    if (!category || !this.canSave) {
      return;
    }

    const trimmed = this.editName.trim();
    if (!trimmed) {
      return;
    }

    this.isSaving = true;
    this.editError = '';
    try {
      await this.store.updateCategory({
        ...category,
        name: trimmed,
        color: this.editColor,
      });
      this.handleEditOpenChange(false);
    } catch (error) {
      console.error('Failed to update category', error);
      this.editError = 'Не удалось сохранить. Попробуй еще раз.';
    } finally {
      this.isSaving = false;
    }
  }

  trackCategory(_: number, category: { id: string }) {
    return category.id;
  }

  dot(color: string) {
    return `radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.65), transparent 55%), ${color}`;
  }
}
