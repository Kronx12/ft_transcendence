FROM alpine:latest

RUN apk add --no-cache --upgrade bash
RUN apk add --update nodejs npm



RUN mkdir /var/www/
WORKDIR /
ADD ./ft_transcendence-back /var/www/ft_transcendence-back/
ADD ./ft_transcendence-front /var/www/ft_transcendence-front/

COPY run.sh /run.sh
RUN chmod +x /run.sh


EXPOSE 80 3000

ENTRYPOINT ["sh", "/run.sh"]