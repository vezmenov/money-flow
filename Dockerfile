FROM node:20-alpine AS build

ARG APP_BUILD_VERSION=dev
ARG APP_BUILD_TIME=unknown

ENV VITE_BUILD_VERSION=$APP_BUILD_VERSION
ENV VITE_BUILD_TIME=$APP_BUILD_TIME

WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build
RUN printf '{"version":"%s","builtAt":"%s"}\n' "$APP_BUILD_VERSION" "$APP_BUILD_TIME" > /app/dist/build-info.json

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
