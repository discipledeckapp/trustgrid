FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY src/prisma/schema.prisma ./prisma/schema.prisma
COPY src/prisma/migrations ./prisma/migrations

EXPOSE 3000

# Run migrations then start — matches render.yaml startCommand
CMD sh -c "npx prisma migrate deploy && node dist/main"
