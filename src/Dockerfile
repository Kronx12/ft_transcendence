FROM alpine:latest

RUN apk add --no-cache --upgrade bash && apk add --update nodejs npm && npm i -g @vue/cli @nestjs/cli

WORKDIR /ft_transcendence

COPY run.sh /run.sh
RUN chmod +x /run.sh


ENTRYPOINT ["sh", "/run.sh"]