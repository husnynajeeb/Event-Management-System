FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ✅ Provide fallback env so Prisma works at build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate

RUN npm run build

EXPOSE 4003

CMD ["node", "dist/src/main.js"]