FROM node:18

WORKDIR /app/ws

COPY ws/package*.json ./

RUN npm install

COPY ws/ .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev"]