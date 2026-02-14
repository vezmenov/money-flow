# DevLog

## 2026-02-13
- Добавлен LunaGlass (токены, фон, стекло/пластик, глобальные контролы) в `/Users/slave/FettrCode/money-flow/src/styles.css`.
- Перестроен app-shell layout: sidebar (>=700px) и bottom bar (<700px).
- Добавлен shared UI-kit: `app-icon`, `app-button`, `app-fab`, `app-field`, `appInput`, `app-date-input`, `app-modal`.
- Подключен Chart.js и сделаны обертки для графиков (line/donut/bar).
- Главная страница переписана в формат интерактивного дашборда + быстрый ввод через модалку.
- `Категории` и `Дашборды` приведены к shared UI и LunaGlass.
- Добавлен генератор детерминированных UI-скриншотов (Playwright) + документация: `npm run ui:snap`, `Docs/Snapshots.md`.
- Регулярные траты:
  - API + store (`/recurring-expenses`)
  - карточка “Регулярные траты” на главной
  - общий модал с режимами `Разовая / Регулярная`
  - `app-icon-button` для “+” рядом с карточкой

## 2026-02-14
- Экспорт данных в XLSX:
  - кнопка “Экспорт” на главной
  - backend `GET /api/export/xlsx`
- Auth:
  - UI добавляет `x-api-key`, если задан `VITE_APP_API_KEY` (для backend `APP_API_KEY`)
- Надежность UI при асинхронной инициализации:
  - добавлен `initState`/`initError` в стор
  - модалка быстрого добавления показывает “Загрузка…” вместо “нет категорий” во время init
  - фикс гонки: если категории пришли после открытия модалки, проставляем дефолт и не дизейблим “Сохранить”
