# UI Snapshots (Playwright)

Цель: быстро получать актуальную “внешку” UI без текстовых простыней, плюс ловить тупые JS-падения через минимальный smoke-flow (без тяжелых UI-тестов).

## Команда
```bash
cd /Users/slave/FettrCode/money-flow
npm run ui:snap
```

## Что делает
- поднимает `vite preview` локально
- подменяет `GET /api/categories` и `GET /api/transactions` фикстурами
- замораживает “сейчас” и отключает анимации/переходы (для детерминизма)
- снимает PNG для страниц в двух viewport: `desktop` и `mobile`
  - desktop: `fullPage`
  - mobile: только видимая область (без “склейки” fixed-элементов вроде bottom-bar)
- делает smoke-проверки через `data-e2e` (например: открыть модалку и заполнить сумму, чтобы не словить `TypeError` в проде)
- падает с ошибкой, если в браузере есть `pageerror` или `console.error`

## Куда кладет
- `Docs/Snapshots/latest/*.png`

Если нужно, чтобы я улучшал UI по актуальному виду, просто коммить `Docs/Snapshots/latest` в `main`.

## Настройки
- фикстуры: `/Users/slave/FettrCode/money-flow/scripts/ui-snapshots/fixtures.mjs`
- “сейчас” (заморозка времени): `UI_SNAP_NOW` (по умолчанию `2026-02-13T12:00:00.000Z`)
- порт: `UI_SNAP_PORT` (по умолчанию `4173`)

## Требования
Скрипт использует `playwright-core` и пытается стартовать Chrome через `channel=chrome`.
Если у тебя нестандартная установка браузера:
- поставь `PLAYWRIGHT_CHANNEL` (например `chrome`/`msedge`)
- или просто установи Chrome нормально, чтобы Playwright его нашел
