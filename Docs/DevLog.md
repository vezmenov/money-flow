# DevLog

## 2026-02-13
- Добавлен LunaGlass (токены, фон, стекло/пластик, глобальные контролы) в `/Users/slave/FettrCode/money-flow/src/styles.css`.
- Перестроен app-shell layout: sidebar (>=700px) и bottom bar (<700px).
- Добавлен shared UI-kit: `app-icon`, `app-button`, `app-fab`, `app-field`, `appInput`, `app-date-input`, `app-modal`.
- Подключен Chart.js и сделаны обертки для графиков (line/donut/bar).
- Главная страница переписана в формат интерактивного дашборда + быстрый ввод через модалку.
- `Категории` и `Дашборды` приведены к shared UI и LunaGlass.
- Добавлен генератор детерминированных UI-скриншотов (Playwright) + документация: `npm run ui:snap`, `Docs/Snapshots.md`.
