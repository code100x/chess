# websocket/Dockerfile
FROM node:18-alpine

WORKDIR /app/ws

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev"]