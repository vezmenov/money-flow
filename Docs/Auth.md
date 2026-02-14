# Auth (x-api-key)

Backend защищает основной контур `/api/*` заголовком `x-api-key` (ключ `APP_API_KEY` на стороне backend).

## Frontend
Frontend автоматически добавляет `x-api-key`, если задан `VITE_APP_API_KEY`.

Где используется:
- `/Users/slave/FettrCode/money-flow/src/app/data/api.service.ts`

## Docker / стенд
В стенде ключ задается через `APP_API_KEY` в `money-flow-infra` и пробрасывается:
- в backend как `APP_API_KEY`
- в frontend build как `APP_API_KEY` -> `VITE_APP_API_KEY` (в Dockerfile)

По умолчанию в infra используется `APP_API_KEY=dev` (если переменная не задана).

