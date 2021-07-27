FROM node:14-alpine

WORKDIR /home/node/app

RUN apk add --no-cache --virtual .gyp make gcc g++ python  \
    && npm install -g serverless \
    && apk del .gyp

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
