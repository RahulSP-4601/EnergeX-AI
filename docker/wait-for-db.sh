#!/bin/sh
set -e

# Pick the right admin binary (mysqld / mariadb)
ADMIN_BIN="$(command -v mariadb-admin || command -v mysqladmin)"

echo "Waiting for MySQL @ ${DB_HOST}:${DB_PORT} as ${DB_USERNAME} ..."
# Loop until the server answers ping with success
until "${ADMIN_BIN}" ping \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USERNAME}" \
  --password="${DB_PASSWORD}" \
  --silent >/dev/null 2>&1; do
  sleep 2
done

echo "MySQL is up — running migrations..."
php artisan migrate --force || true

exec "$@"
