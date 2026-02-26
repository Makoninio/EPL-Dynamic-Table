FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install

COPY . .
ENV NEXT_PUBLIC_API_BASE=http://localhost:4000
RUN npm --workspace apps/web run build

EXPOSE 3000
CMD ["npm", "--workspace", "apps/web", "run", "start"]
