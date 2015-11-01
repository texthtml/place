FROM node:0.12

WORKDIR /app

ADD package.json /app/package.json

RUN npm install -g grunt-cli && npm install && npm install bower
