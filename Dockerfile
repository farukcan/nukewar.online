FROM node:22-alpine

COPY package.json /srv
COPY app.js /srv
COPY wrapper.js /srv
COPY katip-framework /srv/katip-framework
COPY src /srv/src

WORKDIR /srv

RUN npm install
RUN npm run build

ENV LISTEN_PORT=3000 \
    GAME_PORT=3001 \
    GAME_CMD=node \
    GAME_ARGS=app.js \
    IDLE_MS=300000

EXPOSE 3000
CMD ["node", "wrapper.js"]
