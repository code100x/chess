#!/bin/sh
cd /app/packages/db && npx prisma migrate dev && npx prisma generate
cd /app/apps/backend && yarn run dev