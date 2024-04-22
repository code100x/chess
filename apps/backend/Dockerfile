# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app/backend

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]