#!/bin/sh

cd /var/www/ft_transcendence-back/ && npm install && npm run start:dev &
cd /var/www/ft_transcendence-front/ && npm install && npm run serve & 
sleep infinity
