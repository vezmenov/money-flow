import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService } from '../../data/finance-store.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="categories">
      <header class="categories__header">
        <h1>Категории</h1>
        <p>Создавайте категории расходов и доходов.</p>
      </header>

      <form class="category-form" (ngSubmit)="handleAddCategory()">
        <label class="category-form__field">
          <span>Цвет</span>
          <input type="color" [(ngModel)]="categoryColor" name="categoryColor" />
        </label>

        <label class="category-form__field">
          <span>Название</span>
          <input
            type="text"
            placeholder="Например: Продукты"
            [(ngModel)]="categoryName"
            name="categoryName"
          />
        </label>

        <button class="category-form__submit" type="submit">Добавить</button>
      </form>

      <div class="categories__list">
        <p class="categories__empty" *ngIf="categories().length === 0">
          Категории пока не добавлены.
        </p>
        <ul *ngIf="categories().length > 0">
          <li class="category-card" *ngFor="let category of categories(); trackBy: trackCategory">
            <span class="category-card__color" [style.backgroundColor]="category.color"></span>
            <span class="category-card__name">{{ category.name }}</span>
          </li>
        </ul>
      </div>
    </section>
  `,
})
export class CategoriesComponent {
  readonly categories = this.store.categories;

  categoryName = '';
  categoryColor = '#3b82f6';

  constructor(private readonly store: FinanceStoreService) {}

  async handleAddCategory() {
    const trimmedName = this.categoryName.trim();

    if (!trimmedName) {
      return;
    }

    await this.store.addCategory({
      id: crypto.randomUUID(),
      name: trimmedName,
      color: this.categoryColor,
      type: 'expense',
      createdAt: new Date().toISOString(),
    });

    this.categoryName = '';
    this.categoryColor = '#3b82f6';
  }

  trackCategory(_: number, category: { id: string }) {
    return category.id;
  }
}
