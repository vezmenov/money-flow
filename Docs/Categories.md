# Категории (добавление и редактирование)

Страница: `/categories`

## Добавление
Верхняя карточка:
- выбор цвета (`<input type="color">`)
- название
- кнопка “Добавить”

## Редактирование
Список категорий поддерживает редактирование:
- у каждой строки есть кнопка “карандаш”
- открывается модалка “Редактировать категорию”
- можно менять:
  - `name`
  - `color`

Сохранение:
- вызываем `store.updateCategory()` → `PUT /api/categories/:id`

E2E/Smoke хуки (`data-e2e`):
- `categories.item` + `data-category-id`
- `categories.edit`
- `edit-category.modal`
- `edit-category.name`
- `edit-category.color`
- `edit-category.save`
- `edit-category.cancel`

