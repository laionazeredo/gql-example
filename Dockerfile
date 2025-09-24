FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

EXPOSE 4999

ENV NODE_ENV=production

CMD ["npm", "start"]
