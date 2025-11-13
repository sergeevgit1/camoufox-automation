# Используем официальный образ Node.js 22
FROM node:22-slim

# Устанавливаем системные зависимости для Playwright и Camoufox
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем pnpm глобально
RUN npm install -g pnpm@10.4.1

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Устанавливаем зависимости Node.js
RUN pnpm install --frozen-lockfile

# Устанавливаем Camoufox и Playwright
RUN pip3 install --break-system-packages camoufox playwright && \
    python3 -m camoufox fetch && \
    python3 -m playwright install firefox

# Копируем остальные файлы проекта
COPY . .

# Компилируем TypeScript и собираем проект
RUN pnpm build

# Создаем директории для данных
RUN mkdir -p /app/profiles /app/logs

# Открываем порт 6000
EXPOSE 6000

# Устанавливаем переменную окружения для порта
ENV PORT=6000
ENV NODE_ENV=production

# Запускаем приложение
CMD ["pnpm", "start"]
