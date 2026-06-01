FROM node:20-alpine

WORKDIR /app

# Copy package files from backend/ (Docker build context is backend/)
COPY package.json ./
COPY package-lock.json* ./
COPY .npmrc* ./

# Install build dependencies even when NODE_ENV=production is provided by the host
RUN npm install --include=dev

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

EXPOSE 3000

# Run migrations then start
CMD sh -c "npx prisma migrate deploy && node dist/main"
