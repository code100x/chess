
FROM node:21

WORKDIR /base

COPY ["package.json", "./package.json"]
COPY [".npmrc", "./.npmrc"]
COPY [".eslintrc.js", "./.eslintrc.js"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]

COPY ["packages/typescript-config", "./packages/typescript-config"]
COPY ["packages/eslint-config", "./packages/eslint-config"]
COPY ["packages/db", "./packages/db"]
COPY ["apps/worker", "./apps/worker"]


RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/apps/worker

WORKDIR /base/apps/worker

CMD ["yarn", "dev"]