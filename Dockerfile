FROM node:14-alpine

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["sh", "-c", "npm run build && npm start"]
