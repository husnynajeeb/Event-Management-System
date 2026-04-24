FROM node:20-slim

WORKDIR /app

# install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./

RUN npm install

COPY . .

# ✅ Provide fallback env so Prisma works at build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"



RUN npx prisma generate

RUN npm run build

EXPOSE 4003

CMD ["node", "dist/main.js"]