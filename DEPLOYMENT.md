# Prime Leather Repair: документація проєкту і деплою

Цей документ призначений для людини, яка буде деплоїти і підтримувати сайт. Він описує, як працює система, які сервіси потрібні, які змінні середовища налаштувати, як запускати локально, як деплоїти frontend і backend, і що перевіряти після релізу.

## 1. Загальна архітектура

Проєкт складається з двох частин:

- `LEATHERWORKS/client` - frontend на React + Vite.
- `LEATHERWORKS-bekend/server` - backend API на Node.js + Express.

Frontend показує публічний сайт і адмін-панель. Backend зберігає та читає дані через Supabase, приймає upload фото/відео, керує адмін-авторизацією і проксіює Google reviews.

Типова production схема:

```text
https://primeleatherrepair.com
  -> статичний frontend з папки client/dist

https://api.primeleatherrepair.com
  -> Node.js backend, npm start

Supabase
  -> таблиці contacts, categories, portfolio, admin_auth_state
  -> storage buckets portfolio, category-images

Google Places API
  -> reviews на сторінці /reviews
```

## 2. Що показує сайт

Публічні маршрути frontend:

- `/` - головна сторінка: hero, послуги, CTA, категорії з Supabase.
- `/portfolio` - before/after роботи. Підтримує фото і відео. Для відео генерується preview/poster з першого кадру до натискання Play.
- `/contact` - контакти, форма/контактна інформація.
- `/reviews` - Google reviews через backend endpoint.
- `/admin` - адмін-панель.

Адмінка дозволяє:

- логінитись як адмін;
- міняти пароль при першому вході;
- створювати/редагувати/видаляти portfolio items;
- завантажувати before/after фото або відео;
- бачити реальний upload progress у відсотках;
- редагувати категорії;
- редагувати контакти.

Важливі деталі про медіа:

- фото в адмінці оптимізуються на клієнті перед upload;
- відео в адмінці не перекодовуються, а завантажуються напряму, щоб не лагала сторінка;
- відео на публічному портфоліо мають lazy loading і poster з першого кадру.

## 3. Репозиторії і папки

У поточній робочій директорії є два проєкти:

```text
LEATHERWORKS/
  client/
    src/
    public/
    package.json
    .env.example

LEATHERWORKS-bekend/
  server/
    src/
    package.json
    .env.example
```

Git-репозиторій frontend знаходиться всередині `LEATHERWORKS`. Backend може деплоїтись окремим репозиторієм, який містить тільки вміст папки `LEATHERWORKS-bekend/server`.

## 4. Залежності

Потрібно:

- Node.js 20 або новіший.
- npm.
- Supabase project.
- Google Cloud project з Places API key, якщо потрібні reviews.
- Доступ до hosting-панелі для frontend.
- Доступ до Node.js hosting для backend, наприклад Hostinger Node.js app.

Frontend scripts:

```bash
cd LEATHERWORKS/client
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Backend scripts:

```bash
cd LEATHERWORKS-bekend/server
npm install
npm run dev
npm start
```

## 5. Environment variables

### 5.1 Frontend env

Файл локально:

```text
LEATHERWORKS/client/.env
```

Приклад:

```env
VITE_API_URL=https://api.primeleatherrepair.com
```

Для локальної роботи з локальним backend:

```env
VITE_API_URL=http://localhost:5002
```

Важливо: Vite читає тільки змінні з префіксом `VITE_`. Після зміни `.env` треба перезапустити dev server або перебілдити frontend.

### 5.2 Backend env

Файл локально:

```text
LEATHERWORKS-bekend/server/.env
```

Production змінні треба задати в hosting-панелі Node.js app.

Required:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_ORIGIN=https://primeleatherrepair.com
ADMIN_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-chars
```

Optional:

```env
PORT=5002
CONTACTS_TABLE=contacts
CORS_ORIGIN=https://primeleatherrepair.com
ADMIN_AUTH_TABLE=admin_auth_state
GOOGLE_PLACES_API_KEY=your-google-places-api-key
GOOGLE_PLACE_ID=ChIJYaPJi-S9D4gRtDreZsY3XD4
```

Пояснення:

- `SUPABASE_URL` - URL Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` - service role key з Supabase. Це секрет, його не можна класти у frontend.
- `CLIENT_ORIGIN` - домен frontend, який має право читати API з браузера.
- `ADMIN_AUTH_SECRET` - секрет для підпису адмін-токенів. Мінімум 32 символи, краще випадковий довгий рядок.
- `GOOGLE_PLACES_API_KEY` - ключ для Google Places API. Якщо його немає, `/reviews` працюватиме у fallback-режимі без реальних Google reviews.

Для Hostinger не треба hardcode `PORT`: платформа сама передає порт у `process.env.PORT`.

## 6. Supabase

Backend очікує такі таблиці:

- `contacts`
- `categories`
- `portfolio`
- `admin_auth_state`

І storage buckets:

- `portfolio`
- `category-images`

### 6.1 SQL bootstrap

Нижче базовий SQL-шаблон. Перед виконанням звірити з існуючим Supabase project, щоб не зламати production-дані.

```sql
create table if not exists public.contacts (
  id bigint primary key,
  phone text,
  email text,
  address text,
  working_hours text,
  messenger_telegram text,
  messenger_whatsapp text
);

insert into public.contacts (
  id,
  phone,
  email,
  address,
  working_hours,
  messenger_telegram,
  messenger_whatsapp
)
values (
  1,
  '+1 (847) 899-7312',
  'primeleatherrepair@yahoo.com',
  '567 Fairway View Dr #1A, Wheeling, IL 60090',
  'Mon - Fri: 9:00 AM - 6:00 PM',
  '',
  ''
)
on conflict (id) do nothing;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  img_categories text
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  before_url text not null,
  after_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_auth_state (
  id text primary key,
  state jsonb not null
);

alter table public.contacts enable row level security;
alter table public.categories enable row level security;
alter table public.portfolio enable row level security;
alter table public.admin_auth_state enable row level security;
```

Backend використовує `SUPABASE_SERVICE_ROLE_KEY`, тому RLS не блокує server-side операції. Якщо пізніше frontend почне напряму читати Supabase, треба буде додати public read policies.

### 6.2 Storage buckets

У Supabase Storage створити buckets:

```text
portfolio
category-images
```

Bucket `portfolio` має віддавати public URLs, бо публічний сайт показує `before_url` і `after_url` напряму з Supabase Storage. Bucket `category-images` теж має бути публічним, якщо у `categories.img_categories` використовуються URL з нього.

Backend зберігає portfolio media шляхами типу:

```text
works/{workId}/before-{uuid}.{ext}
works/{workId}/after-{uuid}.{ext}
```

При редагуванні або видаленні роботи backend намагається видалити старі файли зі storage.

## 7. Backend API

Base URL у production:

```text
https://api.primeleatherrepair.com
```

Health check:

```text
GET /health
```

Очікувана відповідь:

```json
{ "status": "ok" }
```

Основні endpoints:

```text
GET    /api/site-data
GET    /api/contact
PUT    /api/contact                  admin only

GET    /api/categories
POST   /api/categories               admin only
PUT    /api/categories/:id           admin only
DELETE /api/categories/:id           admin only

GET    /api/portfolio
POST   /api/portfolio                admin only, multipart
PUT    /api/portfolio/:id            admin only, multipart
DELETE /api/portfolio/:id            admin only

GET    /api/google-reviews

POST   /api/auth/login
GET    /api/auth/session             admin only
POST   /api/auth/change-password     admin only
```

Admin-only endpoints потребують header:

```text
Authorization: Bearer <admin-token>
```

Frontend зберігає admin token у `localStorage` під ключем:

```text
primeLeatherAdminToken
```

## 8. Admin auth

Адмін-стан зберігається у Supabase таблиці `admin_auth_state`, а також дублюється локально у backend файл:

```text
server/data/admin-auth.json
```

При першому запуску backend створює адмін-користувачів і може записати initial credentials у:

```text
server/data/admin-initial-credentials.txt
```

Що зробити після першого production запуску:

1. Зайти на `/admin`.
2. Увійти initial admin credentials.
3. Одразу змінити пароль, якщо система цього вимагає.
4. Зберегти production пароль у password manager.
5. Видалити `data/admin-initial-credentials.txt`, якщо він з'явився на сервері.

Не комітити:

```text
.env
data/admin-auth.json
data/admin-initial-credentials.txt
```

## 9. Local development

### 9.1 Backend local

```bash
cd LEATHERWORKS-bekend/server
npm install
cp .env.example .env
npm run dev
```

Перевірити:

```bash
curl http://localhost:5002/health
```

### 9.2 Frontend local

```bash
cd LEATHERWORKS/client
npm install
cp .env.example .env
```

Для локального backend у `client/.env`:

```env
VITE_API_URL=http://localhost:5002
```

Запуск:

```bash
npm run dev
```

Зазвичай frontend буде тут:

```text
http://localhost:5173
```

## 10. Frontend deploy

Frontend є статичним Vite build.

Команди:

```bash
cd LEATHERWORKS/client
npm ci
npm run lint
npm run build
```

Результат:

```text
LEATHERWORKS/client/dist
```

На hosting треба залити вміст `dist` як сайт `primeleatherrepair.com`.

Production env для build:

```env
VITE_API_URL=https://api.primeleatherrepair.com
```

Важливо для React Router:

Якщо hosting відкриває `/portfolio`, `/contact`, `/reviews`, `/admin` напряму, він має повертати `index.html`. Для Apache це зазвичай `.htaccess` rewrite на `index.html`. Для Nginx - `try_files $uri /index.html`.

Приклад Apache `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 11. Backend deploy

Backend деплоїться як Node.js app.

Рекомендовано мати окремий GitHub repo, де лежить тільки вміст:

```text
LEATHERWORKS-bekend/server/
```

Тобто в корені backend repo мають бути:

```text
package.json
package-lock.json
src/
.env.example
README.md
```

Не класти в repo:

```text
.env
node_modules/
data/
```

Production setup на Hostinger або схожому Node.js hosting:

1. Створити Node.js app для `api.primeleatherrepair.com`.
2. Підключити GitHub repo backend.
3. Build/install command: `npm ci` або стандартне install від платформи.
4. Start command: `npm start`.
5. Entry point: `src/index.js`, якщо платформа питає окремо.
6. Додати backend env variables.
7. Переконатися, що `CLIENT_ORIGIN=https://primeleatherrepair.com`.
8. Перезапустити Node.js app.

Після деплою перевірити:

```bash
curl https://api.primeleatherrepair.com/health
curl https://api.primeleatherrepair.com/api/site-data
```

## 12. Google reviews

Сторінка `/reviews` викликає:

```text
GET /api/google-reviews?placeId=ChIJYaPJi-S9D4gRtDreZsY3XD4
```

Backend викликає Google Places API і кешує відповідь на 15 хвилин.

Щоб reviews працювали:

1. У Google Cloud увімкнути Places API.
2. Створити API key.
3. Обмежити key по API і, якщо можливо, по backend/domain.
4. Додати в backend env:

```env
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=ChIJYaPJi-S9D4gRtDreZsY3XD4
```

Якщо ключ не заданий, backend поверне fallback payload з помилкою, а frontend покаже fallback-стан.

## 13. CORS

Backend дозволяє браузерні запити тільки з origins у:

```env
CLIENT_ORIGIN
```

або fallback:

```env
CORS_ORIGIN
```

Можна задати кілька origins через кому:

```env
CLIENT_ORIGIN=https://primeleatherrepair.com,https://www.primeleatherrepair.com
```

Якщо frontend у браузері показує CORS error, перевірити:

- реальний domain у browser address bar;
- значення `CLIENT_ORIGIN` на backend;
- чи перезапущений backend після зміни env;
- чи frontend `VITE_API_URL` дивиться на правильний API domain.

## 14. Upload фото і відео

Portfolio upload іде через multipart form data:

- `before` або `beforeImage`
- `after` або `afterImage`
- `title`
- `description`
- `category`

Frontend показує upload progress через `axios onUploadProgress`.

Відео:

- дозволені формати включають `mp4`, `mov`, `m4v`, `webm`, `ogg`, `avi`, `mkv`, `3gp`, `mpeg`, `ts`, `hevc`, `h265`;
- frontend не перекодовує відео;
- backend зберігає файл у Supabase Storage як є;
- швидкість upload залежить від розміру файлу і мережі;
- якщо upload великих відео падає, перевірити limits hosting/proxy/Supabase.

Фото:

- frontend підтримує `jpg`, `jpeg`, `png`, `webp`, `heic`, `heif`, `avif`, `gif`, `bmp`, `tif`, `tiff`, `svg`;
- великі фото оптимізуються перед upload;
- HEIC намагається конвертуватись у браузері.

## 15. Pre-deploy checklist

Перед релізом frontend:

```bash
cd LEATHERWORKS/client
npm run lint
npm run build
```

Перед релізом backend:

```bash
cd LEATHERWORKS-bekend/server
npm install
npm start
```

Перевірити:

- `.env` не закомічений;
- `VITE_API_URL` у production build правильний;
- `CLIENT_ORIGIN` на backend відповідає frontend domain;
- Supabase tables існують;
- Supabase buckets існують і публічні для читання;
- `ADMIN_AUTH_SECRET` заданий і довгий;
- Google key заданий, якщо потрібні reviews;
- `/health` повертає `{ "status": "ok" }`;
- `/api/site-data` повертає contact і categories;
- `/admin` логіниться;
- upload фото/відео в portfolio працює;
- `/portfolio` показує фото/відео preview;
- пряме відкриття `/portfolio`, `/contact`, `/reviews`, `/admin` не дає 404.

## 16. Troubleshooting

### Frontend показує "Server not reachable"

Перевірити:

- `VITE_API_URL` у frontend build;
- чи backend запущений;
- чи `https://api.primeleatherrepair.com/health` відкривається;
- чи немає CORS помилки в browser console.

### CORS blocked

Перевірити `CLIENT_ORIGIN`. Значення має точно збігатися з origin frontend, включно з protocol:

```text
https://primeleatherrepair.com
```

Якщо сайт відкривається і з `www`, додати обидва origins через кому.

### Admin login required або 401

Перевірити:

- чи є `ADMIN_AUTH_SECRET`;
- чи не змінився `ADMIN_AUTH_SECRET` після логіну, бо старі токени стануть невалідні;
- чи існує таблиця `admin_auth_state`;
- чи backend має доступ до Supabase service role key.

### Password change required

Це нормальна поведінка для першого входу admin. Треба змінити пароль у `/admin`.

### Upload зависає або падає

Перевірити:

- розмір відео;
- network tab у браузері;
- limits Node.js hosting/proxy;
- Supabase Storage bucket `portfolio`;
- чи не закінчився storage quota;
- backend logs.

### Portfolio media не відкривається

Перевірити:

- чи bucket `portfolio` public;
- чи URL у `portfolio.before_url` / `portfolio.after_url` відкривається напряму;
- чи файл не був видалений зі storage.

### Google reviews не показуються

Перевірити:

- `GOOGLE_PLACES_API_KEY`;
- чи Places API увімкнений у Google Cloud;
- restrictions API key;
- backend logs для `/api/google-reviews`;
- чи не повертається 503 з `GOOGLE_PLACES_API_KEY is not configured`.

## 17. Як оновлювати production

Frontend:

1. Pull latest code.
2. Задати production `VITE_API_URL`.
3. Виконати `npm ci`, `npm run lint`, `npm run build`.
4. Залити `client/dist` на hosting.
5. Перевірити public pages і `/admin`.

Backend:

1. Pull latest backend repo.
2. Виконати install залежностей.
3. Перевірити env.
4. Restart Node.js app.
5. Перевірити `/health`, `/api/site-data`, `/admin`.

Якщо змінюються Supabase schema або env, спочатку оновити backend/Supabase, потім frontend.
