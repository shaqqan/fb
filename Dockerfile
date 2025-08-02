FROM node:22-alpine

# Установка openssl3
RUN apk update && apk add --no-cache openssl3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start:dev"]