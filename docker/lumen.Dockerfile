# docker/lumen.Dockerfile
FROM php:8.2-fpm-alpine

RUN apk add --no-cache bash curl git icu-dev oniguruma-dev libpq mariadb-client \
    && docker-php-ext-install pdo pdo_mysql

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# pre-warm vendor (won’t hurt if bind-mounted later)
COPY lumen-api/composer.json lumen-api/composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-progress || true
COPY lumen-api ./

RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# ---- wait script (convert CRLF -> LF and make it executable)
COPY docker/wait-for-db.sh /docker/wait-for-db.sh
RUN sed -i 's/\r$//' /docker/wait-for-db.sh && chmod +x /docker/wait-for-db.sh

EXPOSE 9000
CMD ["php-fpm"]
