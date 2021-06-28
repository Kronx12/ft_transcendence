FROM alpine:latest

RUN apk add --no-cache --upgrade bash
RUN apk add --update nodejs npm

RUN npm install -g @vue/cli
RUN npm i -g @nestjs/cli

RUN mkdir /var/www/
WORKDIR /
ADD ./ft_transcendence-back /var/www/ft_transcendence-back/
ADD ./ft_transcendence-front /var/www/ft_transcendence-front/


COPY run.sh /run.sh
RUN chmod +x /run.sh


<<<<<<< HEAD
EXPOSE 8080 3000 4001
=======
EXPOSE 8080 4001 3000
>>>>>>> 88cd62ba13a330dee2cac20276700542779796aa

ENTRYPOINT ["sh", "/run.sh"]