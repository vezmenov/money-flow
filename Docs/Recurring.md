# Регулярные траты

Регулярная трата это шаблон, по которому backend сам создает обычную транзакцию раз в месяц.

## Где в UI
- Главная (`/`): отдельная карточка “Регулярные траты” (план на месяц + список + статус `создано/ожидает`).
- Добавление: общий модал быстрого добавления (переключатель `Разовая / Регулярная`).
  - Плюс рядом с карточкой регулярных трат открывает модал сразу в режиме `Регулярная`.
- Удаление: в списке регулярных трат есть кнопка (корзина) и confirm-модалка.

Файлы:
- `/Users/slave/FettrCode/money-flow/src/app/pages/home/home.component.ts`
- `/Users/slave/FettrCode/money-flow/src/app/features/transactions/add-expense-modal/add-expense-modal.component.ts`

## API (backend)
Используем контур `/api`:
- `GET /api/recurring-expenses?month=YYYY-MM`
- `POST /api/recurring-expenses`
- `DELETE /api/recurring-expenses/:id`

Важно (правила backend):
- `dayOfMonth` должен совпадать с днем в `date` (`YYYY-MM-DD`).
- в списке на месяц backend возвращает `scheduledDate` и `committed`.

## Данные и стор
- Fetch слой: `/Users/slave/FettrCode/money-flow/src/app/data/api.service.ts`
- Store: `/Users/slave/FettrCode/money-flow/src/app/data/finance-store.service.ts`

Месяц для карточки на главной:
- берется из выбранного периода: `period().end.slice(0,7)`

## UI Snapshots
Для `npm run ui:snap` добавлены фикстуры по регуляркам:
- `/Users/slave/FettrCode/money-flow/scripts/ui-snapshots/fixtures.mjs`
