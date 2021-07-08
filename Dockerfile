FROM node:14-alpine

WORKDIR /home/node/app

RUN npm install -g serverless

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
