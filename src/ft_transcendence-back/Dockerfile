FROM alpine:latest

RUN apk add --no-cache --upgrade bash && apk add --update nodejs npm

RUN npm install -g @nestjs/cli


WORKDIR /back

ENTRYPOINT ["sh", "./launch.sh"]