# Responsive

## Брейкпоинт
- `>=700px` — левый сайдбар (`app-nav`) в потоке, `position: sticky`.
- `<700px` — нижний bottom bar (`app-nav`) `position: fixed`.

Базовая настройка в `/Users/slave/FettrCode/money-flow/src/styles.css`:
- `--bottom-nav-h`
- `--app-bottom-inset` (учитывает высоту bottom bar + safe-area + отступ)

## Safe-area (iOS)
На mobile добавляем `env(safe-area-inset-bottom)` к inset-ам:
- bottom bar: `bottom: calc(12px + env(safe-area-inset-bottom))`
- контент: `padding-bottom: var(--app-bottom-inset)`

## FAB
FAB (`app-fab`) фиксирован справа снизу и учитывает `--app-bottom-inset`, чтобы не пересекаться с bottom bar:
- позиционирование в `/Users/slave/FettrCode/money-flow/src/app/shared/ui/button/fab.component.ts`
- базовый расчет: `bottom: calc(18px + var(--app-bottom-inset, 0px))`

## Навигация
Реализация:
- `/Users/slave/FettrCode/money-flow/src/app/components/nav/nav.component.ts`

Поведение:
- Desktop/sidebar: иконка + текст в строку.
- Mobile/bottom: иконка + подпись в столбик.
- Active state: “plastic selected” (XP pill) для четкого сигнала.

