FROM node:boron

COPY package.json /srv
COPY app.js /srv
COPY katip-framework /srv/katip-framework
COPY src /srv/src

WORKDIR /srv

RUN npm install
RUN npm install forever -g

CMD [ "npm", "start" ]