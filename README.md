# Retro Backend (NestJS)

REST API и WebSocket-шлюз для приложения спринт-ретроспектив.

## Требования

- Node.js 18+
- PostgreSQL 13+
- npm

## Быстрый старт (разработка)

```bash
npm install
cp .env.example .env
# отредактируйте .env — пароль БД, JWT_SECRET и т.д.

npx sequelize-cli db:create   # если базы ещё нет
npm run migration:run
npm run start:dev
```

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Переменные окружения

Скопируйте `.env.example` в `.env`:

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgres://user:pass@localhost:5432/retro_db` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Альтернатива `DATABASE_URL` | см. `.env.example` |
| `JWT_SECRET` | Секрет для подписи JWT | длинная случайная строка |
| `JWT_EXPIRES_IN` | Срок жизни токена | `7d` |
| `PORT` | Порт HTTP API | `3001` |
| `HOST` | Интерфейс прослушивания (`0.0.0.0` — доступ из сети) | `0.0.0.0` |
| `FRONTEND_URL` | URL фронтенда для CORS и WebSocket | `https://retro.example.com` |

> `FRONTEND_URL` должен совпадать с адресом, с которого открывают приложение (включая порт).

## Деплой (production)

### 1. Подготовка сервера

```bash
# Ubuntu/Debian — пример установки PostgreSQL
sudo apt update && sudo apt install -y postgresql

sudo -u postgres psql -c "CREATE USER retro WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE retro_db OWNER retro;"
```

### 2. Сборка и миграции

```bash
cd backend
npm ci
cp .env.example .env
# заполните production-значения в .env

npm run migration:run
npm run build
```

### 3. Запуск

```bash
npm run start:prod
```

Приложение слушает `HOST:PORT` (по умолчанию `0.0.0.0:3001`).

### 4. Process manager (рекомендуется)

**PM2:**

```bash
npm install -g pm2
pm2 start dist/main.js --name retro-api
pm2 save
pm2 startup
```

**systemd** — пример unit-файла `/etc/systemd/system/retro-api.service`:

```ini
[Unit]
Description=Retro API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/retro-kanban/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now retro-api
```

### 5. Reverse proxy (Nginx)

Пример проксирования API и WebSocket:

```nginx
server {
    listen 80;
    server_name api.retro.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Для production включите HTTPS (Let's Encrypt / certbot). После этого укажите в `.env`:

```
FRONTEND_URL=https://retro.example.com
```

### 6. Фаервол

Откройте порт API (или только 80/443, если трафик идёт через Nginx):

```bash
# пример для ufw
sudo ufw allow 3001/tcp
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run start:dev` | Dev-режим с hot-reload |
| `npm run build` | Сборка в `dist/` |
| `npm run start:prod` | Запуск production-сборки |
| `npm run migration:run` | Применить миграции |
| `npm run migration:undo` | Откатить последнюю миграцию |
| `npm run typecheck` | Проверка TypeScript |

## Обновление на сервере

```bash
git pull
npm ci
npm run migration:run
npm run build
pm2 restart retro-api   # или systemctl restart retro-api
```

## Проверка после деплоя

- `GET /api/docs` — Swagger открывается
- Регистрация фасилитатора через фронтенд
- WebSocket: карточки и голоса обновляются в реальном времени
