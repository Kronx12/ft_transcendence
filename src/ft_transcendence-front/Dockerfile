FROM alpine:latest

RUN apk add --no-cache --upgrade bash && apk add --update nodejs npm

RUN npm install -g @vue/cli


WORKDIR /front

COPY package.json /front/package.json
RUN npm install
ENTRYPOINT ["sh", "./launch.sh"]