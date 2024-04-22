# react-native/Dockerfile
FROM node:18-alpine

WORKDIR /app/native

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 19000

CMD ["npm", "start"]