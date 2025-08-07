FROM node:20-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci


COPY . .


RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app


ENV NODE_ENV production


COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --only=production


COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]