FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --prod --frozen-lockfile
RUN yarn build

EXPOSE 50420
ENTRYPOINT [ "node", "-r", "module-alias/register", "dist/index.js" ]
