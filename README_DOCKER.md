# 🐳 Docker развертывание Camoufox Automation

Данное руководство описывает процесс развертывания приложения Camoufox Automation с использованием Docker и Docker Compose на порту 6000.

## 📋 Предварительные требования

На сервере должны быть установлены:
- Docker (версия 20.10 или выше)
- Docker Compose (версия 2.0 или выше)

### Установка Docker на Ubuntu/Debian

```bash
# Обновление пакетов
sudo apt-get update

# Установка зависимостей
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Добавление официального GPG ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверка установки
docker --version
docker compose version
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/sergeevgit1/camoufox-automation.git
cd camoufox-automation
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл и заполните необходимые параметры:

```bash
nano .env
```

**Обязательные параметры для изменения:**
- `OAUTH_CLIENT_ID` - ID клиента OAuth (получить на https://manus.im)
- `OAUTH_CLIENT_SECRET` - секрет клиента OAuth
- `OAUTH_REDIRECT_URI` - URL для OAuth callback (например: `http://your-domain.com:6000/api/oauth/callback`)
- `JWT_SECRET` - секретный ключ для JWT (сгенерируйте надежный случайный ключ)
- `MYSQL_PASSWORD` - пароль для базы данных MySQL
- `MYSQL_ROOT_PASSWORD` - root пароль для MySQL

### 3. Сборка и запуск контейнеров

```bash
# Сборка образов
docker compose build

# Запуск контейнеров в фоновом режиме
docker compose up -d
```

### 4. Инициализация базы данных

После первого запуска необходимо выполнить миграции базы данных:

```bash
# Войти в контейнер приложения
docker compose exec app sh

# Выполнить миграции
pnpm db:push

# Выйти из контейнера
exit
```

### 5. Проверка работы

Откройте браузер и перейдите по адресу:
```
http://localhost:6000
```

Или если развертывание на сервере:
```
http://your-server-ip:6000
```

## 🔧 Управление контейнерами

### Просмотр логов

```bash
# Все логи
docker compose logs -f

# Логи приложения
docker compose logs -f app

# Логи базы данных
docker compose logs -f db
```

### Остановка контейнеров

```bash
docker compose stop
```

### Перезапуск контейнеров

```bash
docker compose restart
```

### Остановка и удаление контейнеров

```bash
docker compose down
```

### Остановка с удалением volumes (⚠️ удалит все данные)

```bash
docker compose down -v
```

## 🔄 Обновление приложения

```bash
# Остановить контейнеры
docker compose down

# Получить последние изменения
git pull

# Пересобрать образы
docker compose build

# Запустить контейнеры
docker compose up -d

# Выполнить миграции (если есть изменения в схеме БД)
docker compose exec app pnpm db:push
```

## 📊 Мониторинг ресурсов

```bash
# Статистика использования ресурсов
docker stats

# Информация о контейнерах
docker compose ps

# Проверка здоровья контейнеров
docker compose ps --format json | jq '.[].Health'
```

## 🔐 Безопасность

### Рекомендации для production:

1. **Измените все пароли по умолчанию** в `.env` файле
2. **Сгенерируйте надежный JWT_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
3. **Настройте firewall** для ограничения доступа:
   ```bash
   sudo ufw allow 6000/tcp
   sudo ufw enable
   ```
4. **Используйте reverse proxy** (Nginx/Traefik) с SSL сертификатом
5. **Регулярно обновляйте** Docker образы и зависимости

## 🌐 Настройка Nginx (опционально)

Пример конфигурации Nginx для проксирования на порт 6000:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📦 Структура volumes

Данные сохраняются в следующих Docker volumes:

- `mysql_data` - данные базы данных MySQL
- `browser_profiles` - профили браузеров и их настройки
- `app_logs` - логи приложения

### Резервное копирование данных

```bash
# Создать backup базы данных
docker compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql

# Восстановить из backup
docker compose exec -T db mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < backup.sql
```

## 🐛 Решение проблем

### Контейнер не запускается

```bash
# Проверить логи
docker compose logs app

# Проверить статус
docker compose ps
```

### Проблемы с подключением к базе данных

```bash
# Проверить, что база данных запущена
docker compose ps db

# Проверить логи базы данных
docker compose logs db

# Проверить подключение
docker compose exec app sh -c 'ping db'
```

### Ошибки при установке Camoufox

Если возникают проблемы с установкой Camoufox, попробуйте:

```bash
# Пересобрать образ без кэша
docker compose build --no-cache app
```

### Порт 6000 уже занят

Измените порт в `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8000:6000"  # Используйте другой внешний порт
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs -f`
2. Убедитесь, что все переменные окружения заполнены корректно
3. Проверьте доступность портов: `netstat -tulpn | grep 6000`
4. Создайте issue на GitHub: https://github.com/sergeevgit1/camoufox-automation/issues

## 📄 Лицензия

MIT
