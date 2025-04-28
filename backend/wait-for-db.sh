#!/bin/sh

# Wait for the database to be ready
until nc -z -v -w30 db 5432; do
  echo "Waiting for database connection..."
  sleep 1
done

echo "Database is ready!"

# Run Prisma migrations
npx prisma migrate deploy

# Start the application
npm run dev