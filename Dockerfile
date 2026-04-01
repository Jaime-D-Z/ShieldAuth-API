FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./

RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
