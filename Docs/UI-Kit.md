# UI-Kit (shared)

Набор переиспользуемых компонентов, которые задают единый LunaGlass-стиль и поведения.

## Нейминг
- HTML селекторы: `app-*`
- TS классы: без префикса (`ButtonComponent`, `ModalComponent`, ...)

## Компоненты

### Иконки
- Selector: `app-icon`
- Файлы:
  - `/Users/slave/FettrCode/money-flow/src/app/shared/ui/icon/icon.component.ts`
  - `/Users/slave/FettrCode/money-flow/src/app/shared/ui/icon/icons.ts`

Пример:
```html
<app-icon name="home" [size]="18" [decorative]="true" />
```

### Кнопки
- Selector: `app-button`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/button/button.component.ts`
- Inputs:
  - `variant`: `primary | secondary | ghost`
  - `size`: `sm | md | lg`
  - `type`: `button | submit | reset`
  - `disabled`, `loading`, `selected`
  - `form` (для сабмита формы из модального футера)

Пример:
```html
<app-button variant="primary" size="md" type="submit">Сохранить</app-button>
```

### Icon Button
- Selector: `app-icon-button`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/button/icon-button.component.ts`
- Назначение: иконка-кнопка в пластике (например “+” рядом с карточками/дашбордами).
- Inputs:
  - `icon` (обязательный)
  - `ariaLabel`
  - `variant`: `neutral | primary | success | danger`
  - `size`, `iconSize`, `disabled`

Пример:
```html
<app-icon-button icon="plus" ariaLabel="Добавить" variant="success" />
```

### FAB
- Selector: `app-fab`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/button/fab.component.ts`
- Назначение: большой “+” справа снизу, учитывает bottom bar через `--app-bottom-inset`.

### Поля формы
- Selector: `app-field`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/forms/field.component.ts`
- Назначение: label/hint/error + слот под контрол.

Пример:
```html
<app-field label="Сумма">
  <input appInput type="number" [(ngModel)]="amount" name="amount" />
</app-field>
```

### Инпут-стилизация
- Directive: `appInput`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/forms/input.directive.ts`
- Назначение: единый LunaGlass “plastic” стиль для `input/select/textarea` через класс `.app-control` в `/Users/slave/FettrCode/money-flow/src/styles.css`.

### Календарь (date)
- Selector: `app-date-input`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/forms/date-input.component.ts`
- Реализован как `ControlValueAccessor`, можно использовать с `[(ngModel)]`.

### Модалка
- Selector: `app-modal`
- Файл: `/Users/slave/FettrCode/money-flow/src/app/shared/ui/modal/modal.component.ts`
- Основа: `<dialog>`
- Фичи:
  - ESC/backdrop close
  - фокус-обводка и стеклянная “sheet”

Проекция:
- контент модалки: обычный контент
- футер: элемент с атрибутом `modalActions`

Пример:
```html
<app-modal [open]="open" (openChange)="open=$event" title="Пример">
  Контент
  <div modalActions>
    <app-button variant="ghost" type="button">Отмена</app-button>
    <app-button variant="primary" type="submit" [form]="formId">Ок</app-button>
  </div>
</app-modal>
```

## Чарты (shared)
- `/Users/slave/FettrCode/money-flow/src/app/shared/charts/chartjs.setup.ts`
- `/Users/slave/FettrCode/money-flow/src/app/shared/charts/line-chart.component.ts` (`app-line-chart`)
- `/Users/slave/FettrCode/money-flow/src/app/shared/charts/donut-chart.component.ts` (`app-donut-chart`)
- `/Users/slave/FettrCode/money-flow/src/app/shared/charts/bar-chart.component.ts` (`app-bar-chart`)
