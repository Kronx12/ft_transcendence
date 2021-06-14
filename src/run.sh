#!/bin/sh

cd /var/www/ft_transcendence-back/ && npm run start:dev &
cd /var/www/ft_transcendence-front/ && npm run serve & 
sleep infinity