# Transactions (быстрое добавление траты)

Быстрый ввод на главной сделан через FAB “+” и модальное окно.

## Компоненты
- FAB: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/button/fab.component.ts`
- Модалка: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/modal/modal.component.ts`
- Фича: `/Users/slave/FettrCode/money-flow/src/app/features/transactions/add-expense-modal/add-expense-modal.component.ts`

## Режимы
Внутри модалки есть переключатель:
- `Разовая` — создает обычную транзакцию (`/transactions`)
- `Регулярная` — создает шаблон регулярки (`/recurring-expenses`)

## Поля
- категория (только `expense`)
- сумма (валидируем `> 0`)
- дата
- валюта (только для `Разовая`)
- заметка (опционально)

## UX
- фокус на поле суммы при открытии
- ESC и клик по backdrop закрывают модалку
- если категорий нет: показываем empty-state и кнопку перехода в `/categories`
