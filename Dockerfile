# root_image: copies & installs the (common) dependencies & necessary folders 
# for backend and web-socket server in packages folder
FROM node:20-alpine AS root_image
WORKDIR /root
COPY package.json yarn.lock ./
COPY ./packages/eslint-config/package.json ./packages/eslint-config/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/
RUN npm install
COPY ./packages/db/package.json ./packages/db/
RUN cd ./packages/db &&  npm install
COPY ./packages/db ./packages/db
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./packages/typescript-config ./packages/typescript-config


# copies remaining files from root folder except /apps & /packages
FROM node:20-alpine as intermediate_img
WORKDIR /root
COPY . .
RUN rm -rf apps/ packages/


# copies and installs dependencies for backend process 
FROM node:20-alpine as backend_img
WORKDIR /root
COPY --from=root_image /root ./
COPY ./apps/backend/package.json ./apps/backend/
COPY ./apps/backend/package-lock.json ./apps/backend/
RUN npm install
COPY ./apps/backend ./apps/backend/
COPY --from=intermediate_img /root ./
CMD ["npm", "run", "start:backend"]

# copies and installs dependencies for web socket process 
FROM node:20-alpine as ws_img
WORKDIR /root
COPY --from=root_image /root ./
COPY ./apps/ws/package.json ./apps/ws/
COPY ./apps/ws/package-lock.json ./apps/ws/
RUN npm install
COPY ./apps/ws ./apps/ws/
COPY --from=intermediate_img /root ./
CMD ["npm", "run", "start:ws"]

# copies and installs dependencies for frontend process
FROM node:20-alpine as frontend_img
WORKDIR /root
COPY --from=root_image /root ./
COPY ./packages/store/package.json ./packages/store/
COPY ./packages/ui/package.json ./packages/ui/
COPY ./packages/tailwind-Config/package.json ./packages/tailwind-Config/
COPY ./apps/frontend/package.json ./apps/frontend/
COPY ./apps/frontend/package-lock.json ./apps/frontend/
RUN npm install
COPY ./packages/store ./packages/store/
COPY ./packages/ui ./packages/ui/
COPY ./apps/frontend ./apps/frontend/
COPY --from=intermediate_img /root ./
CMD ["npm", "run", "start:frontend"]
