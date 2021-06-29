FROM alpine:latest

RUN apk add --no-cache --upgrade bash && apk add --update nodejs npm

RUN npm install -g @vue/cli


WORKDIR /front

ENTRYPOINT ["sh", "./launch.sh"]