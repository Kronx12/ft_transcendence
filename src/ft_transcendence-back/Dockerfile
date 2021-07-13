FROM alpine:latest

RUN apk add --no-cache --upgrade bash && apk add --update nodejs npm

RUN npm install -g @nestjs/cli


WORKDIR /back

COPY package.json /back/package.json
RUN npm install
ENTRYPOINT ["sh", "./launch.sh"]