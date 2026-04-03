# ─────────────────────────────────────────────
# Stage 1: Build frontend assets
# ─────────────────────────────────────────────
FROM node:22-alpine AS node-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

COPY resources/ resources/
COPY vite.config.js ./
COPY public/ public/

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: PHP-FPM production image
# ─────────────────────────────────────────────
FROM php:8.4-fpm-alpine AS production

RUN apk add --no-cache \
    nginx \
    supervisor \
    sqlite \
    sqlite-dev \
    libpng-dev \
    oniguruma-dev \
    libzip-dev \
    curl \
    unzip

RUN docker-php-ext-install \
    pdo \
    pdo_sqlite \
    mbstring \
    zip \
    bcmath \
    opcache \
    pcntl

RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.memory_consumption=128"; \
    echo "opcache.interned_strings_buffer=8"; \
    echo "opcache.max_accelerated_files=10000"; \
    echo "opcache.validate_timestamps=0"; \
} >> /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader

COPY . .
COPY --from=node-builder /app/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev

RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /var/www/html/database \
    && chown -R www-data:www-data /var/www/html/database

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
