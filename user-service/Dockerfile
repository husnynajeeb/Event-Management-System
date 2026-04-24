FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./

RUN npm install

# Copy prisma FIRST
COPY prisma ./prisma

# Set dummy DB for build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Copy rest of code
COPY . .

RUN npm run build

EXPOSE 4003

CMD ["node", "dist/main.js"]