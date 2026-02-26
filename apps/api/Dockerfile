FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install

COPY . .
RUN npm --workspace apps/api run prisma:generate
RUN npm --workspace apps/api run build

EXPOSE 4000
CMD ["sh", "-c", "npm --workspace apps/api run prisma:migrate && npm --workspace apps/api run prisma:seed && npm --workspace apps/api run start"]
