FROM node:boron

COPY package.json /srv
COPY app.js /srv
COPY katip-framework /srv
COPY src /srv

WORKDIR /srv

RUN npm install

EXPOSE 80

CMD [ "npm", "start" ]