# 🔄 Migration Guide: Manus OAuth → PocketBase

Данное руководство поможет перейти с Manus OAuth на PocketBase аутентификацию.

## 📋 Что изменилось

### Было (Manus OAuth)
- Требовались переменные окружения: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_REDIRECT_URI`
- Внешняя зависимость от Manus OAuth сервера
- MySQL база данных для хранения пользователей
- Сложная настройка OAuth credentials

### Стало (PocketBase)
- **Нулевая конфигурация** — работает из коробки
- Встроенная аутентификация (Email/Password + OAuth2)
- SQLite база данных (легче и быстрее для большинства случаев)
- Admin UI для управления пользователями
- Один контейнер вместо двух (MySQL + OAuth)

## 🚀 Шаги миграции

### 1. Backup существующих данных

Если у вас уже есть данные в MySQL:

```bash
# Создать backup MySQL
docker compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql
```

### 2. Остановить старые контейнеры

```bash
docker compose down
```

### 3. Обновить код

Код уже обновлен в репозитории. Основные изменения:

**Удалены файлы:**
- `server/_core/oauth.ts` - старая OAuth интеграция
- `server/_core/sdk.ts` - Manus SDK

**Добавлены файлы:**
- `server/_core/auth.ts` - новая аутентификация
- `server/_core/pocketbase.ts` - PocketBase клиент
- `pocketbase/pb_hooks/main.pb.js` - автоматическая инициализация схемы
- `pocketbase/pb_schema.js` - описание схемы данных

**Изменены файлы:**
- `server/_core/index.ts` - использует новую аутентификацию
- `server/_core/context.ts` - работает с PocketBase пользователями
- `docker-compose.yml` - добавлен PocketBase, удален MySQL
- `Dockerfile` - убраны зависимости MySQL

### 4. Обновить переменные окружения

Старый `.env`:
```bash
# OAuth настройки
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=http://localhost:6000/api/oauth/callback

# MySQL
DATABASE_URL=mysql://user:password@db:3306/database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=camoufox_automation
MYSQL_USER=camoufox
MYSQL_PASSWORD=camoufox_password

# JWT секрет
JWT_SECRET=your_jwt_secret
```

Новый `.env`:
```bash
# Порт приложения
PORT=6000

# PocketBase URL
POCKETBASE_URL=http://pocketbase:8090

# Cookie secret (можно использовать старый JWT_SECRET)
COOKIE_SECRET=your_jwt_secret
```

### 5. Запустить новые контейнеры

```bash
# Собрать новые образы
docker compose build

# Запустить контейнеры
docker compose up -d

# Проверить статус
docker compose ps
```

### 6. Настроить PocketBase

Откройте PocketBase Admin UI:
```
http://localhost:8090/_/
```

**При первом запуске:**
1. Создайте admin аккаунт
2. Схема базы данных создастся автоматически
3. Готово! Можно использовать приложение

### 7. Миграция пользователей (опционально)

Если нужно перенести существующих пользователей из MySQL в PocketBase:

#### Вариант A: Ручная миграция через UI

1. Откройте PocketBase Admin: `http://localhost:8090/_/`
2. Перейдите в коллекцию "users"
3. Создайте пользователей вручную

#### Вариант B: Автоматическая миграция через скрипт

Создайте скрипт миграции:

```javascript
// migrate-users.js
import PocketBase from 'pocketbase';
import mysql from 'mysql2/promise';

const pb = new PocketBase('http://localhost:8090');

// Подключение к старой MySQL базе
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'camoufox_automation'
});

// Аутентификация в PocketBase как admin
await pb.admins.authWithPassword('admin@localhost', 'admin_password');

// Получить пользователей из MySQL
const [users] = await connection.execute('SELECT * FROM users');

// Мигрировать каждого пользователя
for (const user of users) {
  try {
    await pb.collection('users').create({
      email: user.email,
      name: user.name,
      password: generateRandomPassword(), // Пользователи должны будут сбросить пароль
      passwordConfirm: generateRandomPassword(),
      role: user.role,
      emailVisibility: true,
    });
    console.log(`Migrated user: ${user.email}`);
  } catch (error) {
    console.error(`Failed to migrate ${user.email}:`, error);
  }
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

await connection.end();
console.log('Migration completed!');
```

Запустить:
```bash
node migrate-users.js
```

**Важно:** После миграции пользователи должны будут сбросить пароли, так как старые пароли были хешированы другим способом.

### 8. Миграция профилей, сессий и задач

Аналогично пользователям, можно мигрировать другие данные:

```javascript
// Пример миграции профилей
const [profiles] = await connection.execute('SELECT * FROM profiles');

for (const profile of profiles) {
  // Найти соответствующего пользователя в PocketBase
  const pbUsers = await pb.collection('users').getFullList({
    filter: `email = "${profile.userEmail}"`
  });
  
  if (pbUsers.length > 0) {
    await pb.collection('profiles').create({
      userId: pbUsers[0].id,
      name: profile.name,
      tags: profile.tags,
      fingerprint: JSON.parse(profile.fingerprint || '{}'),
      cookies: JSON.parse(profile.cookies || '{}'),
      // ... остальные поля
    });
  }
}
```

## 🔄 Изменения в API

### Аутентификация

**Было:**
```javascript
// Вход через OAuth
window.location.href = '/api/oauth/login';
```

**Стало:**
```javascript
// Вход через email/password
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Или OAuth2 через PocketBase
window.location.href = '/api/auth/oauth2/google';
```

### Получение текущего пользователя

**Было:**
```javascript
const user = await sdk.authenticateRequest(req);
```

**Стало:**
```javascript
import { authenticateRequest } from './auth';
const user = await authenticateRequest(req);
```

### Структура пользователя

**Было (MySQL):**
```typescript
interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

**Стало (PocketBase):**
```typescript
interface PBUser {
  id: string; // UUID вместо числа
  email: string;
  name: string;
  verified: boolean;
  role: 'user' | 'admin';
  created: string; // ISO date string
  updated: string;
}
```

## ⚠️ Важные изменения

### ID пользователей

- **Было:** Числовые ID (1, 2, 3...)
- **Стало:** UUID строки ('abc123def456...')

Если у вас есть связи по userId, убедитесь что они обновлены.

### Даты

- **Было:** JavaScript Date объекты
- **Стало:** ISO строки ('2024-01-01T12:00:00.000Z')

Используйте `new Date(user.created)` для преобразования.

### OAuth

- **Было:** Только Manus OAuth
- **Стало:** Email/Password + любые OAuth2 провайдеры (Google, GitHub, Facebook, etc.)

Настройка OAuth2 провайдеров теперь через PocketBase Admin UI.

## 🎯 Преимущества миграции

✅ **Простота** — нет необходимости в OAuth credentials  
✅ **Автономность** — не зависит от внешних сервисов  
✅ **Гибкость** — поддержка множества OAuth2 провайдеров  
✅ **Admin UI** — удобное управление пользователями  
✅ **Производительность** — SQLite быстрее для небольших нагрузок  
✅ **Realtime** — встроенная поддержка WebSocket  

## 🐛 Решение проблем

### Ошибка "Cannot connect to PocketBase"

```bash
# Проверить что PocketBase запущен
docker compose ps pocketbase

# Проверить логи
docker compose logs pocketbase

# Перезапустить
docker compose restart pocketbase
```

### Пользователи не могут войти

1. Убедитесь что пользователи созданы в PocketBase
2. Проверьте что email verified (или отключите проверку в настройках)
3. Проверьте правильность пароля

### Старые данные не отображаются

Убедитесь что миграция завершена успешно:
```bash
# Проверить количество пользователей
docker compose exec pocketbase ls -la /pb_data

# Открыть Admin UI и проверить коллекции
http://localhost:8090/_/
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs -f`
2. Откройте issue на GitHub
3. Проверьте [PocketBase документацию](https://pocketbase.io/docs/)

## 📄 Откат миграции

Если нужно вернуться к старой версии:

```bash
# Остановить контейнеры
docker compose down

# Восстановить старые файлы из git
git checkout HEAD~1 server/_core/oauth.ts
git checkout HEAD~1 server/_core/sdk.ts
git checkout HEAD~1 docker-compose.yml

# Восстановить MySQL backup
docker compose up db -d
docker compose exec -T db mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < backup.sql

# Запустить старую версию
docker compose up -d
```
