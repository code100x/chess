
FROM node:21

WORKDIR /base

COPY ["package.json", "./package.json"]
COPY [".yarnrc", "./.yarnrc"]
COPY [".npmrc", "./.npmrc"]
COPY [".eslintrc.js", "./.eslintrc.js"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]

COPY ["packages/typescript-config", "./packages/typescript-config"]
COPY ["packages/eslint-config", "./packages/eslint-config"]
COPY ["packages/common", "./packages/common"]
COPY ["backend/ws", "./backend/ws"]


RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/ws

EXPOSE 8081

WORKDIR /base/backend/ws

CMD ["yarn", "dev"]
